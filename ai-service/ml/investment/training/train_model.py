import os
import json
import logging
from datetime import datetime

from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.evaluation import evaluate_stock_predictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_training_pipeline(output_dir: str = "models/investment"):
    """
    Reproducible offline training pipeline for stock market predictor.
    Splits data chronologically, evaluates metrics, and persists artifacts.
    """
    logger.info("Initializing Stock Market Predictor training pipeline...")

    predictor = StockMarketPredictor()
    predictor.train()

    logger.info("Evaluating model metrics on time-ordered validation set...")
    metrics = evaluate_stock_predictor(predictor)
    logger.info(f"Model Evaluation Metrics: {metrics}")

    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "model.pkl")
    metadata_path = os.path.join(output_dir, "metadata.json")
    metrics_path = os.path.join(output_dir, "metrics.json")

    predictor.save_model(model_path)

    metadata = {
        "version": "1.0.0",
        "trained_at": datetime.now().isoformat(),
        "model_type": "GradientBoostingRegressor + RandomForestClassifier",
        "horizon_days": 60,
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    logger.info(f"Model training pipeline completed. Artifacts saved to {output_dir}")
    return metadata, metrics


if __name__ == "__main__":
    run_training_pipeline()
