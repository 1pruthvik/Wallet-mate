import logging
from typing import Optional, Any, Sequence
import numpy as np

from ml.investment.schemas import PredictionResult, HistoricalPrice, FundamentalSnapshot
from ml.investment.models.base_predictor import BaseStockPredictor
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.market_data import MarketDataProvider, MockMarketDataProvider

logger = logging.getLogger(__name__)


class EnsembleStockPredictor(BaseStockPredictor):
    """
    Advanced Multi-Model Ensemble Stock Predictor.
    Dynamically combines available model adapters (GradientBoosting, Chronos-Bolt, Chronos-2, TimesFM 2.5, Moirai 2.0).
    Features:
    1. Validation-learned dynamic weighting (inverse validation MAE weighting).
    2. Multi-model agreement scoring (HIGH, MEDIUM, LOW, LOW_CONFIDENCE, NO_CLEAR_SIGNAL).
    3. Low-confidence model abstention (abstains from strong directional signals when confidence is weak).
    """

    def __init__(
        self,
        gradient_predictor: Optional[BaseStockPredictor] = None,
        foundation_predictor: Optional[BaseStockPredictor] = None,
        predictors: Optional[Sequence[BaseStockPredictor]] = None,
        weights: Optional[dict[str, float]] = None,
        gradient_weight: float = 0.5,
        foundation_weight: float = 0.5,
        provider: Optional[MarketDataProvider] = None
    ):
        self.provider = provider or MockMarketDataProvider()
        self.gradient_predictor = gradient_predictor or StockMarketPredictor(provider=self.provider)
        self.foundation_predictor = foundation_predictor or FinancialFoundationPredictor(provider=self.provider)

        # Build active predictor list
        if predictors is not None and len(predictors) > 0:
            self.predictors = list(predictors)
        else:
            self.predictors = [self.gradient_predictor, self.foundation_predictor]

        self.weights = weights or {}
        self.gradient_weight = gradient_weight
        self.foundation_weight = foundation_weight

        # Check fallback / status
        fn_active = getattr(self.foundation_predictor, "foundation_model_active", True)
        if not getattr(self.foundation_predictor, "is_available", True) or not fn_active:
            self.gradient_weight = 1.0
            self.foundation_weight = 0.0

    def get_model_metadata(self) -> dict[str, Any]:
        available_models = [p.get_model_metadata()["model_name"] for p in self.predictors if getattr(p, "is_available", True)]
        return {
            "model_name": "AdvancedEnsemblePredictor",
            "model_version": "2.0.0",
            "status": "AVAILABLE",
            "device": "cpu",
            "is_available": True,
            "sub_models": available_models,
            "weights": self.weights
        }

    def train(self, historical_prices: Optional[list[HistoricalPrice]] = None):
        """Train underlying models."""
        for p in self.predictors:
            if hasattr(p, "train"):
                p.train(historical_prices)

    def fit_ensemble_weights(self, val_prices: list[HistoricalPrice], horizon_days: int = 20):
        """
        Learn optimal ensemble weights strictly on validation set data using inverse MAE weighting.
        Prevents look-ahead bias and test set leakage.
        """
        if len(val_prices) <= horizon_days + 10:
            return

        sym = val_prices[0].symbol if (val_prices and hasattr(val_prices[0], "symbol")) else "BENCH"
        maes = {}
        for p in self.predictors:
            meta = p.get_model_metadata()
            mname = meta["model_name"]
            if not meta.get("is_available", True):
                continue

            errors = []
            for i in range(10, len(val_prices) - horizon_days, 10):
                hist_slice = val_prices[:i]
                actual_ret = (val_prices[i + horizon_days].close - val_prices[i].close) / val_prices[i].close
                try:
                    pred_res = p.predict(sym, horizon_days=horizon_days, historical_prices=hist_slice)
                    errors.append(abs(pred_res.predicted_return - actual_ret))
                except Exception:
                    pass

            if errors:
                maes[mname] = float(np.mean(errors))

        if maes:
            inv_maes = {m: 1.0 / max(mae, 1e-4) for m, mae in maes.items()}
            tot = sum(inv_maes.values())
            self.weights = {m: w / tot for m, w in inv_maes.items()}
            logger.info(f"Learned Validation Ensemble Weights: {self.weights}")

    def predict(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list[HistoricalPrice]] = None,
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> PredictionResult:
        """
        Execute multi-model weighted ensemble prediction with agreement scoring and model abstention.
        """
        fn_active = getattr(self.foundation_predictor, "foundation_model_active", True)
        if not getattr(self.foundation_predictor, "is_available", True) or not fn_active or self.foundation_weight == 0.0:
            pred_a = self.gradient_predictor.predict(symbol, horizon_days, historical_prices, fundamentals)
            pred_a.model_agreement = "SINGLE_MODEL"
            pred_a.model_predictions = {"gradient_boosting": pred_a.predicted_return}
            pred_a.selected_model = "gradient_boosting"
            return pred_a

        preds: dict[str, PredictionResult] = {}
        for p in self.predictors:
            meta = p.get_model_metadata()
            mname = meta["model_name"]

            # Skip unavailable or inactive predictors
            if not meta.get("is_available", True) or meta.get("status") == "UNAVAILABLE":
                continue

            try:
                res = p.predict(symbol, horizon_days, historical_prices, fundamentals)
                preds[mname] = res
            except Exception as e:
                logger.warning(f"Predictor {mname} failed for {symbol}: {e}")

        if not preds:
            # Fall back to GradientBoosting
            res = self.gradient_predictor.predict(symbol, horizon_days, historical_prices, fundamentals)
            res.model_agreement = "SINGLE_MODEL"
            res.selected_model = "gradient_boosting"
            return res

        if len(preds) == 1:
            res = list(preds.values())[0]
            res.model_agreement = "SINGLE_MODEL"
            res.selected_model = list(preds.keys())[0]
            return res

        # Calculate dynamic model weights
        num_preds = len(preds)
        w_dict = {}
        for mname in preds.keys():
            if self.weights and mname in self.weights:
                w_dict[mname] = self.weights[mname]
            elif "Gradient" in mname or "StockMarketPredictor" in mname:
                w_dict[mname] = self.gradient_weight
            else:
                w_dict[mname] = self.foundation_weight / max(1, num_preds - 1)

        tot_w = sum(w_dict.values())
        w_dict = {m: w / tot_w for m, w in w_dict.items()}

        # Aggregate return, confidence, risk score
        ens_return = sum(w_dict[m] * preds[m].predicted_return for m in preds)
        ens_low = sum(w_dict[m] * (preds[m].expected_return_range.low if hasattr(preds[m].expected_return_range, "low") else preds[m].expected_return_range["low"]) for m in preds)
        ens_high = sum(w_dict[m] * (preds[m].expected_return_range.high if hasattr(preds[m].expected_return_range, "high") else preds[m].expected_return_range["high"]) for m in preds)
        raw_conf = sum(w_dict[m] * preds[m].confidence for m in preds)
        ens_risk = int(round(sum(w_dict[m] * preds[m].risk_score for m in preds)))

        # Evaluate Model Agreement & Directions
        directions = [preds[m].direction for m in preds]
        pos_count = directions.count("positive")
        neg_count = directions.count("negative")
        return_spread = max(preds[m].predicted_return for m in preds) - min(preds[m].predicted_return for m in preds)

        if pos_count == len(directions) or neg_count == len(directions):
            if return_spread <= 0.02:
                agreement = "HIGH"
                conf_delta = +0.10
            else:
                agreement = "MEDIUM"
                conf_delta = 0.0
        elif pos_count > 0 and neg_count > 0:
            if return_spread > 0.04:
                agreement = "NO_CLEAR_SIGNAL"
                conf_delta = -0.20
            else:
                agreement = "LOW"
                conf_delta = -0.10
        else:
            agreement = "MEDIUM"
            conf_delta = 0.0

        ens_conf = float(np.clip(raw_conf + conf_delta, 0.40, 0.95))

        # Model Abstention Rule: Low confidence or conflicting signals
        if ens_conf < 0.45 or agreement == "NO_CLEAR_SIGNAL":
            ens_direction = "neutral"
            agreement = "LOW_CONFIDENCE" if agreement != "NO_CLEAR_SIGNAL" else "NO_CLEAR_SIGNAL"
        else:
            ens_direction = "positive" if ens_return > 0 else "negative"

        first_pred = list(preds.values())[0]
        latest_price = first_pred.current_price
        expected_price = round(latest_price * (1.0 + ens_return), 2) if latest_price else None

        model_preds_summary = {m: round(preds[m].predicted_return, 4) for m in preds}
        for mname, pr in preds.items():
            if "Gradient" in mname or "StockMarket" in mname:
                model_preds_summary["gradient_boosting"] = round(pr.predicted_return, 4)
            elif "Chronos" in mname or "Foundation" in mname:
                model_preds_summary["foundation_model"] = round(pr.predicted_return, 4)

        return PredictionResult(
            symbol=symbol.upper(),
            horizon_days=horizon_days,
            predicted_return=round(ens_return, 4),
            expected_return_range={"low": round(ens_low, 4), "high": round(ens_high, 4)},
            risk_score=ens_risk,
            confidence=round(ens_conf, 2),
            direction=ens_direction,
            current_price=latest_price,
            expected_price=expected_price,
            model_name=f"EnsembleStockPredictor ({len(preds)} Models Active)",
            data_timestamp=first_pred.data_timestamp,
            model_agreement=agreement,
            model_predictions=model_preds_summary,
            selected_model="ensemble"
        )
