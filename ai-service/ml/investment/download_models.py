import sys
import logging
from ml.investment.models.predictor import GradientBoostingStockPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.models.chronos2_predictor import Chronos2Predictor
from ml.investment.models.timesfm_predictor import TimesFM25Predictor
from ml.investment.models.moirai_predictor import Moirai2Predictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def download_and_cache_models():
    """
    Download/verify foundation model weights safely once.
    Outputs status summary table and exits. Does NOT run ModelTournament.
    """
    print("\n==================================================")
    print("FINMITRA FOUNDATION MODEL SETUP")
    print("==================================================")

    # 1. GradientBoosting
    gb = GradientBoostingStockPredictor()
    gb_status = "AVAILABLE" if gb.is_available else "UNAVAILABLE"
    gb_weights = "N/A"

    # 2. Chronos-Bolt
    bolt = FinancialFoundationPredictor(model_id="amazon/chronos-bolt-tiny")
    bolt_status = bolt.status_message if bolt.status_message in ["ACTIVE", "AVAILABLE"] else "FALLBACK"
    bolt_weights = "CACHED" if bolt.pipeline is not None else "N/A"

    # 3. Chronos-2
    c2 = Chronos2Predictor(model_id="amazon/chronos-2")
    c2_status = c2.status if c2.status == "AVAILABLE" else "FALLBACK"
    c2_weights = "CACHED" if c2.pipeline is not None else "N/A"

    # 4. TimesFM 2.5
    tfm = TimesFM25Predictor(model_id="google/timesfm-2.5-200m-pytorch")
    tfm_status = tfm.status if tfm.status == "AVAILABLE" else "FALLBACK"
    tfm_weights = "CACHED" if tfm.tfm is not None else "N/A"

    # 5. Moirai 2.0
    moirai = Moirai2Predictor()
    moirai_status = "UNAVAILABLE (Incompatible: uni2ts requires numpy~=1.26 on Python 3.13)"
    moirai_weights = "N/A"

    print(f"\nGradientBoosting       {gb_status}")
    print(f"Chronos-Bolt           {bolt_status}")
    print(f"Chronos-2              {c2_status}")
    print(f"TimesFM 2.5            {tfm_status}")
    print(f"Moirai 2.0             {moirai_status}")

    print("\nModel weights:")
    print(f"Chronos-Bolt            {bolt_weights}")
    print(f"Chronos-2               {c2_weights}")
    print(f"TimesFM 2.5            {tfm_weights}")
    print(f"Moirai 2.0             {moirai_weights}")

    print("\n==================================================")
    print("SETUP COMPLETE")
    print("==================================================\n")


if __name__ == "__main__":
    download_and_cache_models()
