from abc import ABC, abstractmethod
from typing import Optional
from ml.investment.schemas import PredictionResult, HistoricalPrice, FundamentalSnapshot


class BaseStockPredictor(ABC):
    """
    Abstract Interface for Time-Series Stock Market Predictor Models.
    Enforces standardized probabilistic prediction and expected return output contract.
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
        """Helper method returning predicted direction ('positive'/'negative')."""
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
