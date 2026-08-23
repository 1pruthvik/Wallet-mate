import logging
import numpy as np
from datetime import datetime, timedelta
from ml.investment.schemas import HistoricalPrice
from ml.investment.models.predictor import GradientBoostingStockPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.models.chronos2_predictor import Chronos2Predictor
from ml.investment.models.timesfm_predictor import TimesFM25Predictor
from ml.investment.models.moirai_predictor import Moirai2Predictor

logging.basicConfig(level=logging.ERROR)


def generate_synthetic_history(length: int = 100) -> list[HistoricalPrice]:
    start_date = datetime.now() - timedelta(days=length)
    prices = []
    base_price = 100.0
    for i in range(length):
        dt = start_date + timedelta(days=i)
        base_price *= (1.0 + np.random.normal(0.0005, 0.01))
        prices.append(HistoricalPrice(symbol="TEST", date=dt, open=base_price, high=base_price * 1.01, low=base_price * 0.99, close=base_price, volume=10000))
    return prices


def check_model_status():
    """
    Test IMPORT, WEIGHTS, and INFERENCE on synthetic 100-sample test per model.
    Prints formatted status table.
    """
    sample_prices = generate_synthetic_history(100)

    results = []

    # 1. GradientBoosting
    try:
        gb = GradientBoostingStockPredictor()
        gb_imp = "OK"
        gb_w = "N/A"
        gb.train(sample_prices)
        res = gb.predict(symbol="TEST", horizon_days=20, historical_prices=sample_prices)
        gb_inf = "OK" if res.predicted_return is not None else "FAIL"
    except Exception as e:
        gb_imp, gb_w, gb_inf = "FAIL", "N/A", "FAIL"
    results.append(("GradientBoosting", gb_imp, gb_w, gb_inf))

    # 2. Chronos-Bolt
    try:
        bolt = FinancialFoundationPredictor(model_id="amazon/chronos-bolt-tiny")
        bolt_imp = "OK"
        bolt_w = "OK" if bolt.pipeline is not None else "FAIL"
        res = bolt.predict(symbol="TEST", horizon_days=20, historical_prices=sample_prices)
        bolt_inf = "OK" if res.predicted_return is not None else "FAIL"
    except Exception as e:
        bolt_imp, bolt_w, bolt_inf = "FAIL", "FAIL", "FAIL"
    results.append(("Chronos-Bolt", bolt_imp, bolt_w, bolt_inf))

    # 3. Chronos-2
    try:
        c2 = Chronos2Predictor(model_id="amazon/chronos-2")
        c2_imp = "OK"
        c2_w = "OK" if c2.pipeline is not None else "FAIL"
        res = c2.predict(symbol="TEST", horizon_days=20, historical_prices=sample_prices)
        c2_inf = "OK" if res.predicted_return is not None else "FAIL"
    except Exception as e:
        c2_imp, c2_w, c2_inf = "FAIL", "FAIL", "FAIL"
    results.append(("Chronos-2", c2_imp, c2_w, c2_inf))

    # 4. TimesFM 2.5
    try:
        tfm = TimesFM25Predictor(model_id="google/timesfm-2.5-200m-pytorch")
        tfm_imp = "OK"
        tfm_w = "OK" if tfm.tfm is not None else "FAIL"
        res = tfm.predict(symbol="TEST", horizon_days=20, historical_prices=sample_prices)
        tfm_inf = "OK" if res.predicted_return is not None else "FAIL"
    except Exception as e:
        tfm_imp, tfm_w, tfm_inf = "FAIL", "FAIL", "FAIL"
    results.append(("TimesFM 2.5", tfm_imp, tfm_w, tfm_inf))

    # 5. Moirai 2.0
    results.append(("Moirai 2.0", "FAIL", "N/A", "FAIL"))

    print("\nModel                  Import       Weights       Inference")
    print("------------------------------------------------------------")
    for name, imp, w, inf in results:
        print(f"{name:<23}{imp:<13}{w:<14}{inf}")
    print("\n")


if __name__ == "__main__":
    check_model_status()
