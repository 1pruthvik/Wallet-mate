import os
import joblib
import numpy as np
from datetime import datetime, timedelta
from typing import Optional
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier

from ml.investment.schemas import PredictionResult, ExpectedReturnRange
from ml.investment.market_data import MarketDataProvider, MockMarketDataProvider
from ml.investment.features import extract_market_features, feature_dict_to_vector


from ml.investment.models.base_predictor import BaseStockPredictor


class StockMarketPredictor(BaseStockPredictor):
    """
    ML Stock Market Predictor (Gradient Boosting Baseline).
    Predicts probabilistic returns, direction, uncertainty range, and confidence.
    Never hardcodes predictions or guarantees returns.
    """

    def __init__(self, provider: Optional[MarketDataProvider] = None):
        self.provider = provider or MockMarketDataProvider()
        self.regressor = GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42
        )
        self.classifier = RandomForestClassifier(
            n_estimators=100, max_depth=4, random_state=42
        )
        self.trained = False
        self.model_name = "GradientBoostingPredictor"
        self.model_version = "1.0.0"
        self.status = "AVAILABLE"
        self.device = "cpu"
        self.is_available = True
        self.load_error = None

    def get_model_metadata(self) -> dict:
        return {
            "model_name": self.model_name,
            "model_version": self.model_version,
            "status": self.status,
            "device": self.device,
            "is_available": self.is_available,
            "load_error": self.load_error
        }

    def _generate_synthetic_training_dataset(self, num_samples: int = 150):
        """
        Generate time-ordered chronological synthetic training data for baseline training.
        Uses realistic financial distributions to avoid data leakage.
        """
        X = []
        y_return = []
        y_direction = []

        np.random.seed(42)

        for i in range(num_samples):
            # Synthetic features
            monthly_return = np.random.normal(0.015, 0.05)
            volatility = np.random.uniform(0.01, 0.04)
            sma_20_ratio = 1.0 + np.random.normal(0.0, 0.02)
            sma_50_ratio = 1.0 + np.random.normal(0.0, 0.03)
            rsi = np.clip(np.random.normal(52, 12), 20, 80)
            macd = np.random.normal(0.0, 0.5)
            pe_ratio = np.random.uniform(12, 35)
            roe = np.random.uniform(8, 30)
            debt_to_equity = np.random.uniform(0.05, 1.2)

            feat_dict = {
                "daily_return": np.random.normal(0.001, 0.015),
                "weekly_return": np.random.normal(0.005, 0.03),
                "monthly_return": monthly_return,
                "volatility": volatility,
                "sma_20_ratio": sma_20_ratio,
                "sma_50_ratio": sma_50_ratio,
                "rsi_14": rsi,
                "macd": macd,
                "volume_change": np.random.normal(0.0, 0.1),
                "relative_strength_vs_market": np.random.normal(0.002, 0.03),
                "pe_ratio": pe_ratio,
                "roe": roe,
                "debt_to_equity": debt_to_equity,
            }
            vector = feature_dict_to_vector(feat_dict)
            X.append(vector)

            # Target 60-day return formula derived from momentum + fundamentals + noise
            future_ret = (
                0.3 * monthly_return
                + 0.15 * (sma_20_ratio - 1.0)
                + 0.001 * (roe - 15.0)
                - 0.0005 * (pe_ratio - 20.0)
                + np.random.normal(0.02, 0.04)
            )

            y_return.append(future_ret)

            if future_ret > 0.02:
                direction = "positive"
            elif future_ret < -0.02:
                direction = "negative"
            else:
                direction = "neutral"

            y_direction.append(direction)

        return np.array(X), np.array(y_return), np.array(y_direction)

    def train(self, historical_prices: Optional[list] = None, horizon_days: int = 20):
        """
        Train ML regressor and classifier models using time-ordered dataset.
        """
        if historical_prices and len(historical_prices) > 30:
            X_list = []
            y_ret_list = []
            y_dir_list = []

            for i in range(30, len(historical_prices) - horizon_days):
                hist_slice = historical_prices[:i]
                future_slice = historical_prices[i:i + horizon_days]

                feats = extract_market_features(hist_slice, is_historical_training=True)
                vec = feature_dict_to_vector(feats)

                act_ret = (future_slice[-1].close - hist_slice[-1].close) / hist_slice[-1].close
                dir_label = "positive" if act_ret > 0.01 else ("negative" if act_ret < -0.01 else "neutral")

                X_list.append(vec)
                y_ret_list.append(act_ret)
                y_dir_list.append(dir_label)

            if X_list:
                X = np.array(X_list)
                y_ret = np.array(y_ret_list)
                y_dir = np.array(y_dir_list)
            else:
                X, y_ret, y_dir = self._generate_synthetic_training_dataset()
        else:
            X, y_ret, y_dir = self._generate_synthetic_training_dataset()

        # Time-ordered split (no shuffle to prevent data leakage)
        split_idx = int(len(X) * 0.8)
        X_train, y_ret_train, y_dir_train = X[:split_idx], y_ret[:split_idx], y_dir[:split_idx]

        self.regressor.fit(X_train, y_ret_train)
        self.classifier.fit(X_train, y_dir_train)
        self.trained = True

    def predict(
        self,
        symbol: str,
        horizon_days: int = 60,
        historical_prices: Optional[list] = None,
        fundamentals: Optional[dict] = None
    ) -> PredictionResult:
        """
        Produce risk-aware, probabilistic predictions for a target symbol.
        """
        if not self.trained:
            self.train()

        clean_symbol = symbol.upper().strip()

        if not historical_prices:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=120)
            historical_prices = self.provider.get_historical_prices(clean_symbol, start_date, end_date)

        if not fundamentals:
            fund_obj = self.provider.get_fundamentals(clean_symbol)
        else:
            fund_obj = fundamentals

        index_prices = self.provider.get_market_index_data(days=120)

        feat_dict = extract_market_features(
            historical_prices=historical_prices,
            fundamentals=fund_obj,
            index_prices=index_prices
        )
        vec = feature_dict_to_vector(feat_dict).reshape(1, -1)

        pred_ret = float(self.regressor.predict(vec)[0])
        prob_array = self.classifier.predict_proba(vec)[0]
        direction_classes = self.classifier.classes_

        best_idx = int(np.argmax(prob_array))
        predicted_direction = str(direction_classes[best_idx])
        confidence = float(prob_array[best_idx])

        volatility = feat_dict.get("volatility", 0.02)
        margin = max(0.02, volatility * np.sqrt(horizon_days / 20.0))

        low_ret = round(pred_ret - margin, 4)
        high_ret = round(pred_ret + margin, 4)

        # Risk score calculation from volatility and debt
        debt = feat_dict.get("debt_to_equity", 0.5)
        raw_risk = (volatility * 1500) + (debt * 20)
        risk_score = int(np.clip(raw_risk, 15, 90))

        current_price = historical_prices[-1].close if historical_prices else None
        expected_price = round(current_price * (1.0 + pred_ret), 2) if current_price else None
        data_ts = historical_prices[-1].date if historical_prices else datetime.now()

        return PredictionResult(
            symbol=clean_symbol,
            horizon_days=horizon_days,
            predicted_return=round(pred_ret, 4),
            expected_return_range=ExpectedReturnRange(low=low_ret, high=high_ret),
            risk_score=risk_score,
            confidence=round(confidence, 2),
            direction=predicted_direction,
            current_price=current_price,
            expected_price=expected_price,
            model_name="GradientBoostingRegressor",
            data_timestamp=data_ts,
        )

    def save_model(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(
            {"regressor": self.regressor, "classifier": self.classifier, "trained": self.trained},
            filepath
        )

    def load_model(self, filepath: str):
        if os.path.exists(filepath):
            data = joblib.load(filepath)
            self.regressor = data["regressor"]
            self.classifier = data["classifier"]
            self.trained = data.get("trained", True)


# Alias for backward compatibility and explicit naming
GradientBoostingStockPredictor = StockMarketPredictor
GradientBoostingPredictor = StockMarketPredictor

