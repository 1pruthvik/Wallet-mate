import os
import sys
import argparse
import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple, List

from ml.investment.market_data.yfinance_provider import YFinanceMarketDataProvider
from ml.investment.market_data.validation import validate_and_clean_dataset
from ml.investment.features import extract_market_features, feature_dict_to_vector
from ml.investment.models.predictor import GradientBoostingStockPredictor
from ml.investment.models.foundation_predictor import ChronosFoundationPredictor
from ml.investment.models.ensemble_predictor import EnsembleStockPredictor
from ml.investment.model_registry import ModelRegistry
from ml.investment.schemas import HistoricalPrice

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ml.investment.train")


class WalkForwardValidator:
    """
    Time-series Walk-Forward Chronological Splitter & Evaluator.
    Guarantees strictly causal chronological splitting:
    Train (60%) -> Validation (20%) -> Test (20%).
    Zero look-ahead bias or random shuffling.
    """

    def __init__(self, train_ratio: float = 0.6, val_ratio: float = 0.2):
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio

    def split(self, prices: List[HistoricalPrice]) -> Tuple[List[HistoricalPrice], List[HistoricalPrice], List[HistoricalPrice]]:
        n = len(prices)
        train_end = int(n * self.train_ratio)
        val_end = int(n * (self.train_ratio + self.val_ratio))

        train_data = prices[:train_end]
        val_data = prices[train_end:val_end]
        test_data = prices[val_end:]
        return train_data, val_data, test_data


def evaluate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Computes comprehensive quantitative evaluation metrics."""
    if len(y_true) == 0 or len(y_pred) == 0:
        return {}

    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))

    # Directional accuracy
    true_dir = (y_true >= 0).astype(int)
    pred_dir = (y_pred >= 0).astype(int)
    dir_acc = float(np.mean(true_dir == pred_dir))

    # Precision, Recall, F1
    tp = float(np.sum((true_dir == 1) & (pred_dir == 1)))
    fp = float(np.sum((true_dir == 0) & (pred_dir == 1)))
    fn = float(np.sum((true_dir == 1) & (pred_dir == 0)))

    precision = (tp / (tp + fp)) if (tp + fp) > 0 else 0.0
    recall = (tp / (tp + fn)) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

    # Cumulative strategy return & max drawdown
    strat_returns = np.where(pred_dir == 1, y_true, -y_true)
    cum_returns = np.cumprod(1 + strat_returns) - 1
    cum_ret = float(cum_returns[-1]) if len(cum_returns) > 0 else 0.0

    peak = np.maximum.accumulate(1 + cum_returns)
    drawdowns = ((1 + cum_returns) - peak) / peak
    max_dd = float(np.min(drawdowns)) if len(drawdowns) > 0 else 0.0

    std_ret = float(np.std(strat_returns))
    sharpe = float((np.mean(strat_returns) / std_ret * np.sqrt(252))) if std_ret > 0 else 0.0

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "directional_accuracy": round(dir_acc, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "cumulative_return": round(cum_ret, 4),
        "max_drawdown": round(max_dd, 4),
        "sharpe_ratio": round(sharpe, 4),
    }


def train_pipeline(symbol: str = "ICICIBANK.NS", years: int = 10, horizon: int = 20) -> Dict[str, Any]:
    logger.info(f"=== Starting Multi-Year Training Pipeline for {symbol} ({years} years requested, horizon={horizon}d) ===")

    provider = YFinanceMarketDataProvider()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=years * 365)

    raw_prices = provider.get_historical_prices(symbol, start_date, end_date)
    cleaned_prices, validation_report = validate_and_clean_dataset(raw_prices, min_observations=100)

    actual_start = cleaned_prices[0].date.strftime("%Y-%m-%d") if cleaned_prices else "N/A"
    actual_end = cleaned_prices[-1].date.strftime("%Y-%m-%d") if cleaned_prices else "N/A"
    total_obs = len(cleaned_prices)

    logger.info(f"Dataset Loaded: {total_obs} observations from {actual_start} to {actual_end}")

    # Walk-Forward Chronological Split
    validator = WalkForwardValidator(train_ratio=0.6, val_ratio=0.2)
    train_prices, val_prices, test_prices = validator.split(cleaned_prices)

    logger.info(f"Walk-Forward Split -> Train: {len(train_prices)} obs | Val: {len(val_prices)} obs | Test: {len(test_prices)} obs")

    # 1. Train GradientBoosting Model
    gb_predictor = GradientBoostingStockPredictor()
    gb_predictor.train(train_prices, horizon_days=horizon)

    # 2. Chronos Foundation Model
    chronos_predictor = ChronosFoundationPredictor()

    # 3. Create Ensemble Predictor
    ensemble = EnsembleStockPredictor(
        gradient_predictor=gb_predictor,
        foundation_predictor=chronos_predictor,
        gradient_weight=0.6,
        foundation_weight=0.4
    )

    # Build evaluation test vectors
    y_test_true = []
    y_test_pred = []

    for i in range(50, len(test_prices) - horizon, 5):
        hist_slice = test_prices[:i]
        future_slice = test_prices[i:i + horizon]

        actual_ret = (future_slice[-1].close - hist_slice[-1].close) / hist_slice[-1].close
        res = ensemble.predict(symbol=symbol, horizon_days=horizon, historical_prices=hist_slice)

        y_test_true.append(actual_ret)
        y_test_pred.append(res.predicted_return)

    y_test_true_arr = np.array(y_test_true)
    y_test_pred_arr = np.array(y_test_pred)

    test_metrics = evaluate_metrics(y_test_true_arr, y_test_pred_arr)
    logger.info(f"Test Set Performance Metrics: {test_metrics}")

    # Register Model Artifact
    registry = ModelRegistry()
    version = f"v{years}Y_{datetime.now().strftime('%Y%m%d')}"
    features_list = [
        "daily_return", "weekly_return", "monthly_return", "volatility",
        "sma_20_ratio", "sma_50_ratio", "rsi_14", "macd", "volume_change",
        "relative_strength_vs_market", "pe_ratio", "roe", "debt_to_equity"
    ]

    registry.save_model(
        predictor_instance=ensemble,
        model_version=version,
        symbol=symbol,
        training_start=actual_start,
        training_end=actual_end,
        training_rows=len(train_prices),
        validation_rows=len(val_prices),
        test_rows=len(test_prices),
        features=features_list,
        horizon=horizon,
        test_metrics=test_metrics
    )

    return {
        "symbol": symbol,
        "years_requested": years,
        "years_available": round(total_obs / 252.0, 1),
        "data_start": actual_start,
        "data_end": actual_end,
        "observations": total_obs,
        "train_rows": len(train_prices),
        "val_rows": len(val_prices),
        "test_rows": len(test_prices),
        "model_version": version,
        "test_metrics": test_metrics
    }


def main():
    parser = argparse.ArgumentParser(description="FinMitra Multi-Year ML Model Training CLI")
    parser.add_argument("--symbol", type=str, default="ICICIBANK.NS", help="Stock symbol (e.g. RELIANCE.NS, ICICIBANK.NS)")
    parser.add_argument("--years", type=int, default=10, help="Years of historical OHLCV data (e.g. 5, 10, 15)")
    parser.add_argument("--horizon", type=int, default=20, help="Forecast horizon in trading days (e.g. 5, 10, 20)")

    args = parser.parse_args()
    summary = train_pipeline(symbol=args.symbol, years=args.years, horizon=args.horizon)
    print("\n" + "=" * 60)
    print("FINMITRA MODEL TRAINING COMPLETE")
    print("=" * 60)
    for k, v in summary.items():
        print(f"{k:20s}: {v}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
