import argparse
import logging
import sys
from datetime import datetime, timedelta
import numpy as np

from ml.investment.schemas import HistoricalPrice
from ml.investment.models.predictor import GradientBoostingStockPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.models.chronos2_predictor import Chronos2Predictor
from ml.investment.models.timesfm_predictor import TimesFM25Predictor
from ml.investment.models.moirai_predictor import Moirai2Predictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_synthetic_history(length: int = 100) -> list[HistoricalPrice]:
    start_date = datetime.now() - timedelta(days=length)
    prices = []
    base_price = 100.0
    for i in range(length):
        dt = start_date + timedelta(days=i)
        base_price *= (1.0 + np.random.normal(0.0005, 0.01))
        prices.append(HistoricalPrice(symbol="TEST", date=dt, open=base_price, high=base_price * 1.01, low=base_price * 0.99, close=base_price, volume=10000))
    return prices


def verify_single_model(model_key: str):
    """Run synthetic 100-sample verification test on a specific model."""
    sample_prices = generate_synthetic_history(100)
    key = model_key.lower().replace("-", "_")

    print(f"\nVerifying Model: {model_key}...")

    if key in ["chronos_bolt", "chronosbolt", "bolt"]:
        model = FinancialFoundationPredictor(model_id="amazon/chronos-bolt-tiny")
    elif key in ["chronos2", "chronos_2"]:
        model = Chronos2Predictor(model_id="amazon/chronos-2")
    elif key in ["timesfm", "timesfm25", "timesfm_2.5"]:
        model = TimesFM25Predictor(model_id="google/timesfm-2.5-200m-pytorch")
    elif key in ["gradient_boosting", "gradientboosting", "gb"]:
        model = GradientBoostingStockPredictor()
        model.train(sample_prices)
    elif key in ["moirai", "moirai2", "moirai_2.0"]:
        print(f"Model {model_key}: UNAVAILABLE (Incompatible: uni2ts requires numpy~=1.26 on Python 3.13)")
        return
    else:
        print(f"Unknown model key: {model_key}")
        return

    meta = model.get_model_metadata()
    print(f"Metadata: {meta}")

    pred = model.predict(symbol="TEST", horizon_days=20, historical_prices=sample_prices)
    print(f"Prediction Result: Symbol={pred.symbol}, Return={pred.predicted_return}, Model={pred.model_name}")
    print(f"Verification: PASSED\n")


def main():
    parser = argparse.ArgumentParser(description="FinMitra Model Verification Engine")
    parser.add_argument("--model", type=str, default="all", help="Model key (e.g. chronos2, timesfm, bolt, gb, moirai, or all)")
    args = parser.parse_args()

    if args.model.lower() == "all":
        for m in ["chronos_bolt", "chronos2", "timesfm", "gradient_boosting", "moirai"]:
            verify_single_model(m)
    else:
        verify_single_model(args.model)


if __name__ == "__main__":
    main()
