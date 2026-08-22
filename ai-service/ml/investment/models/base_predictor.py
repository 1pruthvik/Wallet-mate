from abc import ABC, abstractmethod
from typing import Optional, Any
from ml.investment.schemas import PredictionResult, HistoricalPrice, FundamentalSnapshot


class BaseStockPredictor(ABC):
    """
    Abstract Interface for Time-Series Stock Market Predictor Models.
    Enforces standardized probabilistic prediction, expected return output contract,
    and model status reporting.
    """

    @abstractmethod
    def train(self, historical_prices: Optional[list[HistoricalPrice]] = None):
        """Train baseline ML models on chronological historical time-series."""
        pass

    @abstractmethod
    def predict(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list[HistoricalPrice]] = None,
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> PredictionResult:
        """Produce risk-aware, probabilistic predictions for a target symbol."""
        pass

    def predict_direction(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list[HistoricalPrice]] = None,
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> str:
        """Helper method returning predicted direction ('positive'/'negative'/'neutral')."""
        pred = self.predict(symbol, horizon_days, historical_prices, fundamentals)
        return pred.direction

    def predict_return(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list[HistoricalPrice]] = None,
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> float:
        """Helper method returning predicted return float."""
        pred = self.predict(symbol, horizon_days, historical_prices, fundamentals)
        return pred.predicted_return

    def get_model_metadata(self) -> dict[str, Any]:
        """Return model metadata, status, version, device, and load error information."""
        return {
            "model_name": getattr(self, "model_name", self.__class__.__name__),
            "model_version": getattr(self, "model_version", "1.0.0"),
            "status": getattr(self, "status", "AVAILABLE"),
            "device": getattr(self, "device", "cpu"),
            "is_available": getattr(self, "is_available", True),
            "load_error": getattr(self, "load_error", None)
        }
