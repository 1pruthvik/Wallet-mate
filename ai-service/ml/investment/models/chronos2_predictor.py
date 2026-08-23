import logging
from datetime import datetime, timedelta
from typing import Optional, Any
import numpy as np

from ml.investment.schemas import PredictionResult, HistoricalPrice, FundamentalSnapshot
from ml.investment.models.base_predictor import BaseStockPredictor
from ml.investment.market_data import MarketDataProvider, MockMarketDataProvider
from ml.investment.market_data.validation import validate_and_clean_historical_prices

logger = logging.getLogger(__name__)

_CHRONOS_2_CACHE = {}


class Chronos2Predictor(BaseStockPredictor):
    """
    Chronos-2 Time-Series Foundation Model Adapter.
    Uses 'amazon/chronos-2' / 'amazon/chronos-bolt-small' zero-shot forecasting.
    Provides robust CPU inference with graceful fallback when weights/libraries are restricted.
    """

    def __init__(
        self,
        model_id: str = "amazon/chronos-2",
        provider: Optional[MarketDataProvider] = None,
        device: str = "cpu"
    ):
        self.model_id = model_id
        self.provider = provider or MockMarketDataProvider()
        self.device = device
        self.pipeline = None
        self.status = "UNINITIALIZED"
        self.is_available = False
        self.load_error: Optional[str] = None
        self._init_model()

    def _init_model(self):
        """Safely attempt model loading; mark UNAVAILABLE / FAILED on error without raising."""
        global _CHRONOS_2_CACHE
        if self.model_id in _CHRONOS_2_CACHE:
            self.pipeline = _CHRONOS_2_CACHE[self.model_id]
            self.is_available = True
            self.status = "AVAILABLE"
            self.load_error = None
            return

        try:
            import torch
            from chronos import BaseChronosPipeline
            pipe = BaseChronosPipeline.from_pretrained(
                self.model_id,
                device_map=self.device,
                torch_dtype=torch.float32,
            )
            _CHRONOS_2_CACHE[self.model_id] = pipe
            self.pipeline = pipe
            self.is_available = True
            self.status = "AVAILABLE"
            self.load_error = None
            logger.info(f"Chronos-2 AVAILABLE: Loaded '{self.model_id}' on {self.device}.")
        except Exception as e:
            self.pipeline = None
            self.load_error = str(e)
            # Try fallback model_id (e.g. chronos-bolt-small) or set FALLBACK/UNAVAILABLE
            try:
                import torch
                from chronos import BaseChronosPipeline
                fallback_id = "amazon/chronos-bolt-small"
                self.pipeline = BaseChronosPipeline.from_pretrained(
                    fallback_id,
                    device_map=self.device,
                    torch_dtype=torch.float32,
                )
                self.is_available = True
                self.status = "AVAILABLE"
                self.model_id = fallback_id
                self.load_error = None
                logger.info(f"Chronos-2 AVAILABLE (using {fallback_id}) on {self.device}.")
            except Exception as e2:
                self.pipeline = None
                self.is_available = True  # Operating in CPU fallback mode
                self.status = "FALLBACK"
                self.load_error = f"{self.model_id}: {e} | Fallback: {e2}"
                logger.warning(f"Chronos-2 FALLBACK: Operating in zero-shot CPU trend mode ({self.load_error}).")

    def get_model_metadata(self) -> dict[str, Any]:
        return {
            "model_name": f"Chronos2Predictor ({self.model_id})",
            "model_version": "2.0.0",
            "status": self.status,
            "device": self.device,
            "is_available": self.is_available,
            "load_error": self.load_error,
        }

    def train(self, historical_prices: Optional[list[HistoricalPrice]] = None):
        """Zero-shot pre-trained foundation model. No local fine-tuning required."""
        pass

    def predict(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list[HistoricalPrice]] = None,
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> PredictionResult:
        if historical_prices is None or len(historical_prices) == 0:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            historical_prices = self.provider.get_historical_prices(symbol, start_date, end_date)

        clean_prices = validate_and_clean_historical_prices(historical_prices, min_history_length=10)
        close_series = np.array([p.close for p in clean_prices], dtype=np.float32)
        latest_price = float(close_series[-1])

        if self.pipeline is not None and self.status == "AVAILABLE":
            import torch
            context_tensor = torch.tensor(close_series, dtype=torch.float32)
            if context_tensor.ndim == 1:
                context_tensor = context_tensor.unsqueeze(0).unsqueeze(0)
            elif context_tensor.ndim == 2:
                context_tensor = context_tensor.unsqueeze(1)
            forecast = self.pipeline.predict(context_tensor, prediction_length=horizon_days)

            if hasattr(forecast, "numpy"):
                forecast_arr = forecast.numpy()
            else:
                forecast_arr = np.array(forecast)

            flat_arr = np.asarray(forecast_arr).flatten()
            median_price = float(flat_arr[-1])
            low_price = median_price * 0.95
            high_price = median_price * 1.05

            pred_return = float((median_price - latest_price) / latest_price)
            low_return = float((low_price - latest_price) / latest_price)
            high_return = float((high_price - latest_price) / latest_price)
            model_display_name = f"Chronos-2 ({self.model_id} ACTIVE)"
        else:
            # Fallback zero-shot trend-adjusted forecast
            log_returns = np.diff(np.log(close_series))
            recent_momentum = np.mean(log_returns[-30:]) if len(log_returns) >= 30 else np.mean(log_returns)
            recent_vol = np.std(log_returns[-30:]) if len(log_returns) >= 30 else 0.015

            drift = recent_momentum * horizon_days
            vol_spread = recent_vol * np.sqrt(horizon_days)

            pred_return = float(np.expm1(drift))
            low_return = float(np.expm1(drift - 1.645 * vol_spread))
            high_return = float(np.expm1(drift + 1.645 * vol_spread))
            model_display_name = f"Chronos-2 ({self.model_id} FALLBACK)"

        direction = "positive" if pred_return > 0 else "negative"
        confidence = float(np.clip(0.50 + abs(pred_return) * 2.0, 0.50, 0.92))
        price_vol = float(np.std(np.diff(close_series) / close_series[:-1])) if len(close_series) > 1 else 0.02
        risk_score = int(np.clip(price_vol * 1000, 10, 95))
        expected_price = round(latest_price * (1.0 + pred_return), 2)
        data_ts = clean_prices[-1].date.isoformat()

        return PredictionResult(
            symbol=symbol.upper(),
            horizon_days=horizon_days,
            predicted_return=round(pred_return, 4),
            expected_return_range={"low": round(low_return, 4), "high": round(high_return, 4)},
            risk_score=risk_score,
            confidence=round(confidence, 2),
            direction=direction,
            current_price=latest_price,
            expected_price=expected_price,
            model_name=model_display_name,
            data_timestamp=data_ts
        )
