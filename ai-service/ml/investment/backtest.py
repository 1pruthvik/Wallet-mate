import math
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Any
import numpy as np

from ml.investment.schemas import HistoricalPrice, FundamentalSnapshot
from ml.investment.dataset import TimeSeriesDataset
from ml.investment.models.predictor import StockMarketPredictor


@dataclass
class BacktestResult:
    symbol: str
    num_predictions: int
    mae: float
    rmse: float
    directional_accuracy: float
    mean_predicted_return: float
    mean_actual_return: float
    cumulative_strategy_return: float
    benchmark_return: float
    max_drawdown: float
    volatility: float
    sharpe_ratio: float
    num_correct_directions: int = 0
    num_incorrect_directions: int = 0
    transaction_cost_bps: float = 0.0
    predictions: list[dict[str, Any]] = field(default_factory=list)


class WalkForwardBacktester:
    """
    Mandatory Walk-Forward Backtesting Engine for Time-Series Stock Forecasting.
    Evaluates forecasting accuracy and hypothetical strategy performance chronologically.
    Strictly avoids future-data leakage and supports configurable transaction costs.
    """

    def __init__(
        self,
        predictor: Optional[Any] = None,
        train_window_days: int = 60,
        test_step_days: int = 10,
        horizon_days: int = 20,
        risk_free_rate: float = 0.05,
        transaction_cost_bps: float = 0.0,
        slippage_bps: float = 0.0
    ):
        self.predictor = predictor or StockMarketPredictor()
        self.train_window_days = train_window_days
        self.test_step_days = test_step_days
        self.horizon_days = horizon_days
        self.risk_free_rate = risk_free_rate
        self.transaction_cost_bps = transaction_cost_bps
        self.slippage_bps = slippage_bps

    def run_backtest(
        self,
        symbol: str,
        historical_prices: list[HistoricalPrice],
        fundamentals: Optional[FundamentalSnapshot] = None
    ) -> BacktestResult:
        """
        Execute walk-forward expanding/rolling backtest over historical price series.
        """
        dataset = TimeSeriesDataset(
            historical_prices=historical_prices,
            horizon_days=self.horizon_days,
            lookback_days=self.train_window_days,
            fundamentals=fundamentals
        )

        n_samples = len(dataset.X)

        if n_samples < 5:
            # Fallback for short data
            return BacktestResult(
                symbol=symbol.upper(),
                num_predictions=0,
                mae=0.0,
                rmse=0.0,
                directional_accuracy=0.5,
                mean_predicted_return=0.0,
                mean_actual_return=0.0,
                cumulative_strategy_return=0.0,
                benchmark_return=0.0,
                max_drawdown=0.0,
                volatility=0.0,
                sharpe_ratio=0.0,
                num_correct_directions=0,
                num_incorrect_directions=0,
                transaction_cost_bps=self.transaction_cost_bps,
                predictions=[]
            )

        predicted_returns = []
        actual_returns = []
        prediction_records = []

        start_idx = int(n_samples * 0.5)

        for i in range(start_idx, n_samples, self.test_step_days):
            # Cut historical prices strictly up to index i for non-leakage
            sub_prices = historical_prices[:i + self.train_window_days]

            # Fit model if it supports local training
            if hasattr(self.predictor, "regressor") and hasattr(self.predictor.regressor, "fit"):
                X_train = np.array(dataset.X[:i])
                y_ret_train = np.array(dataset.y_return[:i])
                y_dir_train = np.array(dataset.y_direction[:i])

                if len(X_train) >= 5:
                    self.predictor.regressor.fit(X_train, y_ret_train)
                    self.predictor.classifier.fit(X_train, y_dir_train)
                    self.predictor.trained = True

            actual_ret = dataset.y_return[i]

            try:
                pred_res = self.predictor.predict(
                    symbol=symbol,
                    horizon_days=self.horizon_days,
                    historical_prices=sub_prices,
                    fundamentals=fundamentals
                )
                pred_ret = float(pred_res.predicted_return)
            except Exception:
                if hasattr(self.predictor, "regressor") and self.predictor.regressor is not None:
                    X_test = dataset.X[i].reshape(1, -1)
                    pred_ret = float(self.predictor.regressor.predict(X_test)[0])
                else:
                    pred_ret = 0.0

            predicted_returns.append(pred_ret)
            actual_returns.append(actual_ret)

            prediction_records.append({
                "date": dataset.dates[i].strftime("%Y-%m-%d"),
                "predicted_return": round(pred_ret, 4),
                "actual_return": round(actual_ret, 4),
                "error": round(abs(pred_ret - actual_ret), 4)
            })

        if not actual_returns:
            return BacktestResult(
                symbol=symbol.upper(),
                num_predictions=0,
                mae=0.0,
                rmse=0.0,
                directional_accuracy=0.5,
                mean_predicted_return=0.0,
                mean_actual_return=0.0,
                cumulative_strategy_return=0.0,
                benchmark_return=0.0,
                max_drawdown=0.0,
                volatility=0.0,
                sharpe_ratio=0.0,
                num_correct_directions=0,
                num_incorrect_directions=0,
                transaction_cost_bps=self.transaction_cost_bps,
                predictions=[]
            )

        pred_arr = np.array(predicted_returns)
        act_arr = np.array(actual_returns)

        # 1. Forecasting Metrics
        errors = pred_arr - act_arr
        mae = float(np.mean(np.abs(errors)))
        rmse = float(np.sqrt(np.mean(errors ** 2)))

        correct_directions = (np.sign(pred_arr) == np.sign(act_arr))
        num_correct = int(np.sum(correct_directions))
        num_incorrect = int(len(correct_directions) - num_correct)
        dir_accuracy = float(np.mean(correct_directions))

        mean_pred = float(np.mean(pred_arr))
        mean_act = float(np.mean(act_arr))

        # 2. Strategy & Portfolio Performance Metrics with Transaction Friction
        friction_rate = (self.transaction_cost_bps + self.slippage_bps) / 10000.0
        positions = np.where(pred_arr > 0.0, 1.0, 0.0)
        trades = np.abs(np.diff(np.insert(positions, 0, 0.0))) # Friction incurred when entering/exiting

        raw_strategy_returns = positions * act_arr
        cost_friction = trades * friction_rate
        strategy_returns = raw_strategy_returns - cost_friction

        cumulative_strategy = float(np.prod(1.0 + strategy_returns) - 1.0)
        benchmark_return = float(np.prod(1.0 + act_arr) - 1.0)

        # Max Drawdown
        cum_equity = np.cumprod(1.0 + strategy_returns)
        running_max = np.maximum.accumulate(cum_equity)
        drawdowns = (cum_equity - running_max) / running_max
        max_drawdown = float(abs(np.min(drawdowns))) if len(drawdowns) > 0 else 0.0

        # Volatility & Sharpe
        strat_vol = float(np.std(strategy_returns) * np.sqrt(252 / max(1, self.horizon_days)))
        annual_strat_return = (1.0 + cumulative_strategy) ** (252 / max(1, len(strategy_returns) * self.horizon_days)) - 1.0
        sharpe = float((annual_strat_return - self.risk_free_rate) / strat_vol) if strat_vol > 0 else 0.0

        return BacktestResult(
            symbol=symbol.upper(),
            num_predictions=len(predicted_returns),
            mae=round(mae, 4),
            rmse=round(rmse, 4),
            directional_accuracy=round(dir_accuracy, 4),
            mean_predicted_return=round(mean_pred, 4),
            mean_actual_return=round(mean_act, 4),
            cumulative_strategy_return=round(cumulative_strategy, 4),
            benchmark_return=round(benchmark_return, 4),
            max_drawdown=round(max_drawdown, 4),
            volatility=round(strat_vol, 4),
            sharpe_ratio=round(sharpe, 2),
            num_correct_directions=num_correct,
            num_incorrect_directions=num_incorrect,
            transaction_cost_bps=self.transaction_cost_bps + self.slippage_bps,
            predictions=prediction_records
        )
