import logging
from datetime import datetime, timedelta
from typing import Optional, Any
import numpy as np

from ml.investment.schemas import PredictionResult, HistoricalPrice, FundamentalSnapshot
from ml.investment.models.base_predictor import BaseStockPredictor
from ml.investment.market_data import MarketDataProvider, MockMarketDataProvider
from ml.investment.market_data.validation import validate_and_clean_historical_prices

logger = logging.getLogger(__name__)

_TIMESFM_CACHE = {}


class TimesFM25Predictor(BaseStockPredictor):
    """
    TimesFM 2.5 Time-Series Foundation Model Adapter (google/timesfm-2.5-200m-pytorch).
    Provides zero-shot patch-based transformer forecasting using the PyTorch API.
    Includes safe status tracking (AVAILABLE, FALLBACK, UNAVAILABLE), process-level model caching,
    and CPU fallback mode.
    """

    def __init__(
        self,
        model_id: str = "google/timesfm-2.5-200m-pytorch",
        provider: Optional[MarketDataProvider] = None,
        device: str = "cpu"
    ):
        self.model_id = model_id
        self.provider = provider or MockMarketDataProvider()
        self.device = device
        self.tfm = None
        self.status = "UNINITIALIZED"
        self.is_available = False
        self.load_error: Optional[str] = None
        self._init_model()

    def _init_model(self):
        """Attempt loading TimesFM 2.5 PyTorch model; mark status appropriately on missing dependencies/limits."""
        global _TIMESFM_CACHE
        if self.model_id in _TIMESFM_CACHE:
            self.tfm = _TIMESFM_CACHE[self.model_id]
            self.is_available = True
            self.status = "AVAILABLE"
            self.load_error = None
            return

        try:
            from timesfm import TimesFM_2p5_200M_torch, ForecastConfig
            tfm_instance = TimesFM_2p5_200M_torch.from_pretrained(self.model_id)
            tfm_instance.compile(ForecastConfig(max_context=512, max_horizon=60))
            _TIMESFM_CACHE[self.model_id] = tfm_instance
            self.tfm = tfm_instance
            self.is_available = True
            self.status = "AVAILABLE"
            self.load_error = None
            logger.info(f"TimesFM 2.5 AVAILABLE: Loaded and compiled '{self.model_id}'.")
        except Exception as e:
            self.tfm = None
            self.is_available = True  # CPU zero-shot trend fallback mode active
            self.status = "FALLBACK"
            self.load_error = f"{self.model_id}: {str(e)}"
            logger.warning(f"TimesFM 2.5 FALLBACK: {self.load_error}. Operating in zero-shot trend fallback mode.")

    def get_model_metadata(self) -> dict[str, Any]:
        return {
            "model_name": f"TimesFM25Predictor ({self.model_id})",
            "model_version": "2.5.0",
            "status": self.status,
            "device": self.device,
            "is_available": self.is_available,
            "load_error": self.load_error,
        }

    def train(self, historical_prices: Optional[list[HistoricalPrice]] = None):
        """Zero-shot pre-trained foundation model. No local training required."""
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

        if self.tfm is not None and self.status == "AVAILABLE":
            try:
                point_forecast, _ = self.tfm.forecast(horizon=horizon_days, inputs=[close_series])
                median_price = float(np.asarray(point_forecast).flatten()[-1])
                pred_return = float((median_price - latest_price) / latest_price)
                low_return = pred_return - 0.04
                high_return = pred_return + 0.04
                model_display_name = f"TimesFM 2.5 ({self.model_id} ACTIVE)"
            except Exception as e_fc:
                logger.warning(f"TimesFM forecast call failed ({e_fc}); using fallback.")
                pred_return, low_return, high_return, model_display_name = self._fallback_forecast(close_series, horizon_days)
        else:
            pred_return, low_return, high_return, model_display_name = self._fallback_forecast(close_series, horizon_days)

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

    def _fallback_forecast(self, close_series: np.ndarray, horizon_days: int) -> tuple[float, float, float, str]:
        log_returns = np.diff(np.log(close_series))
        recent_momentum = np.mean(log_returns[-20:]) if len(log_returns) >= 20 else np.mean(log_returns)
        recent_vol = np.std(log_returns[-20:]) if len(log_returns) >= 20 else 0.015

        drift = recent_momentum * horizon_days
        vol_spread = recent_vol * np.sqrt(horizon_days)

        pred_return = float(np.expm1(drift))
        low_return = float(np.expm1(drift - 1.645 * vol_spread))
        high_return = float(np.expm1(drift + 1.645 * vol_spread))
        model_display_name = f"TimesFM 2.5 ({self.model_id} FALLBACK)"

        return pred_return, low_return, high_return, model_display_name

