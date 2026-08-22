import logging
from typing import Optional, Any

from ml.investment.schemas import PredictionResult, HistoricalPrice, FundamentalSnapshot
from ml.investment.models.base_predictor import BaseStockPredictor
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.market_data import MarketDataProvider, MockMarketDataProvider

logger = logging.getLogger(__name__)


class EnsembleStockPredictor(BaseStockPredictor):
    """
    Ensemble Stock Market Predictor.
    Combines Model A (GradientBoostingStockPredictor) and Model B (FinancialFoundationPredictor).
    Calculates Model Agreement and applies dynamic confidence adjustment.
    Falls back gracefully to Model A if Model B is unavailable.
    """

    def __init__(
        self,
        gradient_predictor: Optional[StockMarketPredictor] = None,
        foundation_predictor: Optional[FinancialFoundationPredictor] = None,
        gradient_weight: float = 0.5,
        foundation_weight: float = 0.5,
        provider: Optional[MarketDataProvider] = None
    ):
        self.provider = provider or MockMarketDataProvider()
        self.gradient_predictor = gradient_predictor or StockMarketPredictor(provider=self.provider)
        self.foundation_predictor = foundation_predictor or FinancialFoundationPredictor(provider=self.provider)
        self.gradient_weight = gradient_weight
        self.foundation_weight = foundation_weight

        # Check fallback availability
        fn_active = getattr(self.foundation_predictor, "foundation_model_active", True)
        if not self.foundation_predictor.is_available or not fn_active:
            logger.info("Foundation Model inactive or unavailable. Ensemble falling back to 100% GradientBoosting mode.")
            self.gradient_weight = 1.0
            self.foundation_weight = 0.0

    def train(self, historical_prices: Optional[list[HistoricalPrice]] = None):
        """Train underlying models."""
        self.gradient_predictor.train(historical_prices)
        self.foundation_predictor.train(historical_prices)

    def predict(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list[HistoricalPrice]] = None,
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> PredictionResult:
        """
        Execute weighted ensemble prediction and compute Model Agreement.
        """
        # Model A prediction
        pred_a = self.gradient_predictor.predict(
            symbol=symbol,
            horizon_days=horizon_days,
            historical_prices=historical_prices,
            fundamentals=fundamentals
        )

        # If Foundation model is not available, inactive, or disabled
        fn_active = getattr(self.foundation_predictor, "foundation_model_active", True)
        if not self.foundation_predictor.is_available or not fn_active or self.foundation_weight == 0.0:
            pred_a.model_agreement = "SINGLE_MODEL"
            pred_a.model_predictions = {"gradient_boosting": pred_a.predicted_return}
            pred_a.selected_model = "gradient_boosting"
            return pred_a

        # Model B prediction
        pred_b = self.foundation_predictor.predict(
            symbol=symbol,
            horizon_days=horizon_days,
            historical_prices=historical_prices,
            fundamentals=fundamentals
        )

        # Ensemble Weighted Return
        total_w = self.gradient_weight + self.foundation_weight
        w_a = self.gradient_weight / total_w
        w_b = self.foundation_weight / total_w

        low_a = pred_a.expected_return_range.low if hasattr(pred_a.expected_return_range, "low") else pred_a.expected_return_range["low"]
        high_a = pred_a.expected_return_range.high if hasattr(pred_a.expected_return_range, "high") else pred_a.expected_return_range["high"]
        low_b = pred_b.expected_return_range.low if hasattr(pred_b.expected_return_range, "low") else pred_b.expected_return_range["low"]
        high_b = pred_b.expected_return_range.high if hasattr(pred_b.expected_return_range, "high") else pred_b.expected_return_range["high"]

        ens_return = float(w_a * pred_a.predicted_return + w_b * pred_b.predicted_return)
        ens_low = float(w_a * low_a + w_b * low_b)
        ens_high = float(w_a * high_a + w_b * high_b)

        # Model Agreement Logic
        same_direction = (pred_a.direction == pred_b.direction)
        return_gap = abs(pred_a.predicted_return - pred_b.predicted_return)

        if same_direction and return_gap <= 0.015:
            agreement = "HIGH"
            agreement_conf_delta = +0.10
        elif same_direction:
            agreement = "MEDIUM"
            agreement_conf_delta = 0.0
        else:
            agreement = "LOW"
            agreement_conf_delta = -0.15

        raw_conf = (w_a * pred_a.confidence + w_b * pred_b.confidence) + agreement_conf_delta
        ens_conf = float(min(0.95, max(0.40, raw_conf)))
        ens_risk = int(round(w_a * pred_a.risk_score + w_b * pred_b.risk_score))
        ens_direction = "positive" if ens_return > 0 else "negative"

        latest_price = pred_a.current_price or pred_b.current_price
        expected_price = round(latest_price * (1.0 + ens_return), 2) if latest_price else None

        return PredictionResult(
            symbol=symbol.upper(),
            horizon_days=horizon_days,
            predicted_return=round(ens_return, 4),
            expected_return_range={
                "low": round(ens_low, 4),
                "high": round(ens_high, 4)
            },
            risk_score=ens_risk,
            confidence=round(ens_conf, 2),
            direction=ens_direction,
            current_price=latest_price,
            expected_price=expected_price,
            model_name="EnsembleStockPredictor (GradientBoosting + Foundation)",
            data_timestamp=pred_a.data_timestamp or pred_b.data_timestamp,
            model_agreement=agreement,
            model_predictions={
                "gradient_boosting": round(pred_a.predicted_return, 4),
                "foundation_model": round(pred_b.predicted_return, 4)
            },
            selected_model="ensemble"
        )
