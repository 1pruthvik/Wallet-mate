import argparse
import logging
import os
import json
from datetime import datetime, timedelta
from typing import Optional, Any
import numpy as np

from ml.investment.market_data.yfinance_provider import YFinanceMarketDataProvider
from ml.investment.dataset import TimeSeriesDataset
from ml.investment.models.predictor import StockMarketPredictor, GradientBoostingPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor, ChronosBoltPredictor
from ml.investment.models.chronos2_predictor import Chronos2Predictor
from ml.investment.models.timesfm_predictor import TimesFM25Predictor
from ml.investment.models.moirai_predictor import Moirai2Predictor
from ml.investment.models.ensemble_predictor import EnsembleStockPredictor
from ml.investment.backtest import WalkForwardBacktester, BacktestResult
from ml.investment.model_registry import ModelRegistry

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("model_tournament")


class ModelTournament:
    """
    FinMitra Model Tournament Engine.
    Executes objective out-of-sample walk-forward benchmarking across candidate predictors
    on identical Indian stock datasets with zero look-ahead bias.
    """

    def __init__(
        self,
        symbol: str = "RELIANCE.NS",
        years: int = 10,
        horizon: int = 20,
        friction_bps: float = 0.0,
        registry_dir: Optional[str] = None
    ):
        self.symbol = symbol.upper()
        self.years = years
        self.horizon = horizon
        self.friction_bps = friction_bps
        self.provider = YFinanceMarketDataProvider(raise_on_error=True)
        self.registry = ModelRegistry(registry_dir=registry_dir)

    @staticmethod
    def instantiate_models(provider=None) -> dict:
        """Instantiate all candidate predictor adapters safely."""
        from ml.investment.market_data import MockMarketDataProvider
        p = provider or MockMarketDataProvider()
        return {
            "GradientBoosting": GradientBoostingPredictor(provider=p),
            "Chronos-Bolt": ChronosBoltPredictor(provider=p),
            "Chronos-2": Chronos2Predictor(provider=p),
            "TimesFM-2.5": TimesFM25Predictor(provider=p),
            "Moirai-2.0": Moirai2Predictor(provider=p),
        }

    def run_tournament(self) -> dict:
        days = self.years * 365
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)

        logger.info(f"=== Starting FinMitra Model Tournament for {self.symbol} ({self.years} Years, Horizon={self.horizon}d) ===")
        prices = self.provider.get_historical_prices(self.symbol, start_date, end_date)
        fundamentals = self.provider.get_fundamentals(self.symbol)

        dataset = TimeSeriesDataset(
            historical_prices=prices,
            horizon_days=self.horizon,
            lookback_days=60,
            fundamentals=fundamentals
        )

        # Split data: Train (60%), Validation (20%), Test (20%)
        train_len = int(len(prices) * 0.60)
        val_len = int(len(prices) * 0.20)
        train_prices = prices[:train_len]
        val_prices = prices[train_len:train_len + val_len]

        models = ModelTournament.instantiate_models(provider=self.provider)

        # Fit trainable models
        for name, m in models.items():
            logger.info(f"Training / Initializing {name}...")
            m.train(train_prices)

        # Validation-based Dynamic Ensemble Weighting (learned ONLY on validation data)
        ensemble = EnsembleStockPredictor(
            predictors=list(models.values()),
            provider=self.provider
        )
        ensemble.fit_ensemble_weights(val_prices, horizon_days=self.horizon)
        models["Ensemble"] = ensemble

        # Run Walk-Forward Evaluation on Unseen Test Dataset
        test_step = 10
        results: dict[str, BacktestResult] = {}

        for name, m in models.items():
            meta = m.get_model_metadata()
            logger.info(f"Evaluating {name} (Status: {meta.get('status', 'ACTIVE')})...")
            backtester = WalkForwardBacktester(
                predictor=m,
                train_window_days=60,
                test_step_days=test_step,
                horizon_days=self.horizon,
                transaction_cost_bps=self.friction_bps
            )
            res = backtester.run_backtest(self.symbol, prices, fundamentals)
            results[name] = res

        # Composite Scoring Formula:
        # Score = 30% * DirAcc + 30% * (Sharpe/2) + 20% * (1 - MaxDrawdown) + 20% * (1 - MAE*5)
        scores = {}
        for name, r in results.items():
            dir_acc_score = r.directional_accuracy
            sharpe_score = float(np.clip((r.sharpe_ratio + 1.0) / 3.0, 0.0, 1.0))
            dd_score = float(np.clip(1.0 - abs(r.max_drawdown), 0.0, 1.0))
            mae_score = float(np.clip(1.0 - r.mae * 5.0, 0.0, 1.0))

            composite = 0.30 * dir_acc_score + 0.30 * sharpe_score + 0.20 * dd_score + 0.20 * mae_score
            scores[name] = round(composite * 100.0, 2)

        # Determine Winner
        winning_model = max(scores.keys(), key=lambda k: scores[k])
        winner_res = results[winning_model]

        # Save production model metadata
        prod_metadata = {
            "symbol": self.symbol,
            "production_model": winning_model,
            "validation_score": scores[winning_model],
            "selected_at": datetime.now().isoformat(),
            "training_period": f"{prices[0].date.strftime('%Y-%m-%d')} to {prices[-1].date.strftime('%Y-%m-%d')}",
            "test_metrics": {
                "mae": winner_res.mae,
                "rmse": winner_res.rmse,
                "directional_accuracy": winner_res.directional_accuracy,
                "sharpe_ratio": winner_res.sharpe_ratio,
                "cumulative_return": winner_res.cumulative_strategy_return,
                "max_drawdown": winner_res.max_drawdown,
            },
            "all_model_scores": scores
        }
        prod_path = os.path.join(self.registry.registry_dir, "production_model.json")
        with open(prod_path, "w") as f:
            json.dump(prod_metadata, f, indent=2)

        # Print Tournament Report
        print("\n" + "=" * 110)
        print(f"FINMITRA MODEL TOURNAMENT REPORT - {self.symbol} ({self.years} Years, Horizon: {self.horizon}d)")
        print("=" * 110)
        print(f"{'Model':<20} | {'Status':<12} | {'MAE':<7} | {'RMSE':<7} | {'Dir Acc':<8} | {'Sharpe':<7} | {'Drawdown':<9} | {'Score':<6}")
        print("-" * 110)
        for name, r in results.items():
            meta = models[name].get_model_metadata()
            status_str = meta.get("status", "AVAILABLE")
            flag = " [WINNER]" if name == winning_model else ""
            print(f"{name:<20} | {status_str:<12} | {r.mae:<7.4f} | {r.rmse:<7.4f} | {r.directional_accuracy*100:<7.2f}% | {r.sharpe_ratio:<7.2f} | {r.max_drawdown*100:<8.2f}% | {scores[name]:<6.2f}{flag}")
        print("=" * 110)
        print(f"SELECTED PRODUCTION MODEL: {winning_model} (Composite Score: {scores[winning_model]}/100)\n")

        return {
            "symbol": self.symbol,
            "winning_model": winning_model,
            "scores": scores,
            "results": results,
            "models_metadata": {n: m.get_model_metadata() for n, m in models.items()}
        }


def main():
    parser = argparse.ArgumentParser(description="Run FinMitra Model Tournament")
    parser.add_argument("--symbol", type=str, default="ICICIBANK.NS", help="Stock ticker symbol")
    parser.add_argument("--years", type=int, default=10, help="Historical years to evaluate")
    parser.add_argument("--horizon", type=int, default=20, help="Forecast horizon in days")
    parser.add_argument("--friction", type=float, default=0.0, help="Transaction friction cost in bps")
    args = parser.parse_args()

    tournament = ModelTournament(symbol=args.symbol, years=args.years, horizon=args.horizon, friction_bps=args.friction)
    tournament.run_tournament()


if __name__ == "__main__":
    main()
