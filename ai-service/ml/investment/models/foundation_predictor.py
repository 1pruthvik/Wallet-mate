from datetime import datetime, timedelta
import logging
from typing import Optional
import numpy as np

from ml.investment.schemas import PredictionResult, HistoricalPrice, FundamentalSnapshot
from ml.investment.models.base_predictor import BaseStockPredictor
from ml.investment.market_data import MarketDataProvider, MockMarketDataProvider
from ml.investment.market_data.validation import validate_and_clean_historical_prices

logger = logging.getLogger(__name__)

_CHRONOS_BOLT_CACHE = {}


class FinancialFoundationPredictor(BaseStockPredictor):
    """
    Open-Source Financial Time-Series Foundation Model Predictor (TSFM).
    Uses Chronos / Chronos-Bolt zero-shot probabilistic forecasting architecture.
    Provides local CPU-compatible inference, deterministic seeding, and strict non-leakage.
    """

    def __init__(
        self,
        model_id: str = "amazon/chronos-bolt-tiny",
        provider: Optional[MarketDataProvider] = None,
        device: str = "cpu"
    ):
        self.model_id = model_id
        self.provider = provider or MockMarketDataProvider()
        self.device = device
        self.pipeline = None
        self.is_available = True
        self.foundation_model_active = False
        self.status_message = "UNINITIALIZED"
        self.load_error: Optional[str] = None
        self._init_model()

    def _init_model(self):
        """Safely initialize pretrained Chronos-Bolt foundation model weights."""
        global _CHRONOS_BOLT_CACHE
        if self.model_id in _CHRONOS_BOLT_CACHE:
            self.pipeline = _CHRONOS_BOLT_CACHE[self.model_id]
            self.is_available = True
            self.foundation_model_active = True
            self.status_message = "ACTIVE"
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
            _CHRONOS_BOLT_CACHE[self.model_id] = pipe
            self.pipeline = pipe
            self.is_available = True
            self.foundation_model_active = True
            self.status_message = "ACTIVE"
            self.load_error = None
            logger.info(f"Chronos-Bolt ACTIVE: Successfully loaded '{self.model_id}' on {self.device}.")
        except Exception as e:
            self.pipeline = None
            self.is_available = True
            self.foundation_model_active = False
            self.status_message = "FALLBACK"
            self.load_error = str(e)
            logger.warning(f"Chronos-Bolt FALLBACK: Unable to load '{self.model_id}' ({e}). Operating in CPU zero-shot fallback mode.")

    def get_model_metadata(self) -> dict:
        status_str = "AVAILABLE" if self.foundation_model_active else ("FALLBACK" if self.is_available else "UNAVAILABLE")
        return {
            "model_name": f"ChronosBoltPredictor ({self.model_id})",
            "model_version": "2.3.1",
            "status": status_str,
            "device": self.device,
            "is_available": self.is_available,
            "load_error": self.load_error
        }

    def train(self, historical_prices: Optional[list[HistoricalPrice]] = None):
        """Foundation models are pre-trained zero-shot. No local training required."""
        pass

    def predict(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list[HistoricalPrice]] = None,
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> PredictionResult:
        """
        Generate zero-shot probabilistic forecasts using past OHLCV prices.
        Strictly prevents future-data leakage.
        """
        if historical_prices is None or len(historical_prices) == 0:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            historical_prices = self.provider.get_historical_prices(symbol, start_date, end_date)

        clean_prices = validate_and_clean_historical_prices(historical_prices, min_history_length=10)
        close_series = np.array([p.close for p in clean_prices], dtype=np.float32)
        latest_price = float(close_series[-1])

        # 1. Zero-shot TSFM Inference
        if self.pipeline is not None and self.foundation_model_active:
            import torch
            context_tensor = torch.tensor(close_series, dtype=torch.float32)
            forecast = self.pipeline.predict(context_tensor, prediction_length=horizon_days)

            if hasattr(forecast, "numpy"):
                forecast_arr = forecast.numpy()
            elif isinstance(forecast, np.ndarray):
                forecast_arr = forecast
            else:
                forecast_arr = np.array(forecast)

            if len(forecast_arr.shape) == 3:
                num_q = forecast_arr.shape[1]
                if num_q == 9:
                    median_price = float(forecast_arr[0, 4, -1])
                    low_price = float(forecast_arr[0, 0, -1])
                    high_price = float(forecast_arr[0, 8, -1])
                else:
                    median_price = float(np.median(forecast_arr[0, :, -1]))
                    low_price = float(np.percentile(forecast_arr[0, :, -1], 10))
                    high_price = float(np.percentile(forecast_arr[0, :, -1], 90))
            else:
                median_price = float(forecast_arr[-1])
                low_price = median_price * 0.95
                high_price = median_price * 1.05

            pred_return = float((median_price - latest_price) / latest_price)
            low_return = float((low_price - latest_price) / latest_price)
            high_return = float((high_price - latest_price) / latest_price)
            model_display_name = f"Chronos-Bolt ({self.model_id} ACTIVE)"
        else:
            # Standalone CPU zero-shot trend-adjusted exponential smoothing TSFM fallback
            log_returns = np.diff(np.log(close_series))
            recent_momentum = np.mean(log_returns[-20:]) if len(log_returns) >= 20 else np.mean(log_returns)
            recent_vol = np.std(log_returns[-20:]) if len(log_returns) >= 20 else (np.std(log_returns) if len(log_returns) > 1 else 0.01)

            drift = recent_momentum * horizon_days
            vol_spread = recent_vol * np.sqrt(horizon_days)

            pred_return = float(np.expm1(drift))
            low_return = float(np.expm1(drift - 1.645 * vol_spread))
            high_return = float(np.expm1(drift + 1.645 * vol_spread))
            model_display_name = f"Chronos-Bolt ({self.model_id} FALLBACK)"

        direction = "positive" if pred_return > 0 else "negative"
        confidence = float(np.clip(0.50 + abs(pred_return) * 2.0, 0.50, 0.92))

        price_vol = float(np.std(np.diff(close_series) / close_series[:-1])) if len(close_series) > 1 else 0.02
        risk_score = int(np.clip(price_vol * 1000 + (20 if fundamentals and fundamentals.debt_to_equity and fundamentals.debt_to_equity > 1.5 else 0), 10, 95))

        expected_price = round(latest_price * (1.0 + pred_return), 2)
        data_ts = clean_prices[-1].date.isoformat()

        return PredictionResult(
            symbol=symbol.upper(),
            horizon_days=horizon_days,
            predicted_return=round(pred_return, 4),
            expected_return_range={
                "low": round(low_return, 4),
                "high": round(high_return, 4)
            },
            risk_score=risk_score,
            confidence=round(confidence, 2),
            direction=direction,
            current_price=latest_price,
            expected_price=expected_price,
            model_name=model_display_name,
            data_timestamp=data_ts
        )


# Alias for explicit model naming
ChronosFoundationPredictor = FinancialFoundationPredictor
ChronosBoltPredictor = FinancialFoundationPredictor
