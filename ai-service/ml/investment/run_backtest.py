import argparse
import logging
from datetime import datetime, timedelta
import numpy as np

from ml.investment.market_data.yfinance_provider import YFinanceMarketDataProvider
from ml.investment.dataset import TimeSeriesDataset
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.models.ensemble_predictor import EnsembleStockPredictor
from ml.investment.backtest import WalkForwardBacktester, BacktestResult

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("run_backtest")


def evaluate_baseline_zero(dataset: TimeSeriesDataset, start_idx: int, step_days: int) -> dict:
    """Baseline 1: Always predict future return = 0.0."""
    actual_returns = []
    predicted_returns = []

    for i in range(start_idx, len(dataset.X), step_days):
        act_ret = dataset.y_return[i]
        actual_returns.append(act_ret)
        predicted_returns.append(0.0)

    pred_arr = np.array(predicted_returns)
    act_arr = np.array(actual_returns)

    errors = pred_arr - act_arr
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    dir_acc = float(np.mean(np.sign(pred_arr) == np.sign(act_arr)))

    strategy_returns = np.where(pred_arr > 0.0, act_arr, 0.0)
    cum_ret = float(np.prod(1.0 + strategy_returns) - 1.0)
    benchmark_ret = float(np.prod(1.0 + act_arr) - 1.0)

    return {
        "name": "Baseline 1 (Zero Return)",
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "directional_accuracy": round(dir_acc, 4),
        "mean_predicted_return": 0.0,
        "mean_actual_return": round(float(np.mean(act_arr)), 4),
        "cumulative_strategy_return": round(cum_ret, 4),
        "benchmark_return": round(benchmark_ret, 4),
    }


def evaluate_baseline_mean(dataset: TimeSeriesDataset, start_idx: int, step_days: int) -> dict:
    """Baseline 2: Predict future return using rolling historical mean return."""
    actual_returns = []
    predicted_returns = []

    for i in range(start_idx, len(dataset.X), step_days):
        past_returns = dataset.y_return[:i]
        pred_mean = float(np.mean(past_returns)) if past_returns else 0.0
        act_ret = dataset.y_return[i]

        predicted_returns.append(pred_mean)
        actual_returns.append(act_ret)

    pred_arr = np.array(predicted_returns)
    act_arr = np.array(actual_returns)

    errors = pred_arr - act_arr
    mae = float(np.mean(np.abs(errors)))
    rmse = float(np.sqrt(np.mean(errors ** 2)))
    dir_acc = float(np.mean(np.sign(pred_arr) == np.sign(act_arr)))

    strategy_returns = np.where(pred_arr > 0.0, act_arr, 0.0)
    cum_ret = float(np.prod(1.0 + strategy_returns) - 1.0)
    benchmark_ret = float(np.prod(1.0 + act_arr) - 1.0)

    return {
        "name": "Baseline 2 (Historical Mean)",
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "directional_accuracy": round(dir_acc, 4),
        "mean_predicted_return": round(float(np.mean(pred_arr)), 4),
        "mean_actual_return": round(float(np.mean(act_arr)), 4),
        "cumulative_strategy_return": round(cum_ret, 4),
        "benchmark_return": round(benchmark_ret, 4),
    }


def run_historical_validation(
    symbol: str,
    days: int = 730,
    horizon: int = 20,
    test_step: int = 10,
    cost_bps: float = 0.0
):
    logger.info(f"Fetching real market data for {symbol} (Last {days} days, Horizon={horizon}d, Cost={cost_bps}bps)...")
    provider = YFinanceMarketDataProvider(raise_on_error=True)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    try:
        prices = provider.get_historical_prices(symbol, start_date, end_date)
        fundamentals = provider.get_fundamentals(symbol)
    except Exception as e:
        logger.error(f"REAL MARKET DATA FETCH FAILED FOR {symbol}: {str(e)}")
        print("\n" + "!" * 70)
        print(f"REAL MARKET DATA ACCESS FAILURE FOR {symbol}")
        print(f"Error Details: {str(e)}")
        print("Backtest aborted: Strict real market data requirement failed.")
        print("!" * 70 + "\n")
        raise

    dataset = TimeSeriesDataset(
        historical_prices=prices,
        horizon_days=horizon,
        lookback_days=60,
        fundamentals=fundamentals
    )

    (X_tr, y_tr, _), (X_val, y_val, _), (X_te, y_te, _) = dataset.split_chronological(train_ratio=0.70, val_ratio=0.15)

    gb_predictor = StockMarketPredictor(provider=provider)
    foundation_predictor = FinancialFoundationPredictor(provider=provider)
    ensemble_predictor = EnsembleStockPredictor(
        gradient_predictor=gb_predictor,
        foundation_predictor=foundation_predictor,
        provider=provider
    )

    backtester_gb = WalkForwardBacktester(predictor=gb_predictor, train_window_days=60, test_step_days=test_step, horizon_days=horizon, transaction_cost_bps=cost_bps)
    backtester_fn = WalkForwardBacktester(predictor=foundation_predictor, train_window_days=60, test_step_days=test_step, horizon_days=horizon, transaction_cost_bps=cost_bps)
    backtester_ens = WalkForwardBacktester(predictor=ensemble_predictor, train_window_days=60, test_step_days=test_step, horizon_days=horizon, transaction_cost_bps=cost_bps)

    gb_result = backtester_gb.run_backtest(symbol, prices, fundamentals)
    fn_result = backtester_fn.run_backtest(symbol, prices, fundamentals)
    ens_result = backtester_ens.run_backtest(symbol, prices, fundamentals)

    start_idx = int(len(dataset.X) * 0.5)
    b1_result = evaluate_baseline_zero(dataset, start_idx, test_step)
    b2_result = evaluate_baseline_mean(dataset, start_idx, test_step)

    features_list = [
        "daily_return", "weekly_return", "monthly_return", "volatility",
        "sma_20_ratio", "sma_50_ratio", "rsi_14", "macd", "volume_change",
        "relative_strength_vs_market", "pe_ratio", "roe", "debt_to_equity",
        "log_return", "atr_14", "relative_volume"
    ]

    fn_status = "ACTIVE" if foundation_predictor.foundation_model_active else "FALLBACK"
    print("\n" + "=" * 80)
    print(f"FINMITRA MULTI-MODEL BACKTEST VALIDATION REPORT — {symbol.upper()} (Horizon: {horizon}d, Friction: {cost_bps}bps)")
    print("=" * 80)
    print(f"Symbol                       : {symbol.upper()}")
    print(f"Data Start / End Date        : {prices[0].date.strftime('%Y-%m-%d')} to {prices[-1].date.strftime('%Y-%m-%d')}")
    print(f"Total OHLCV Observations     : {len(prices)}")
    print(f"Time-Series Samples          : {len(dataset.X)} (Train: {len(X_tr)}, Val: {len(X_val)}, Test: {len(X_te)})")
    print(f"Forecast Horizon / Step      : {horizon} trading days / {test_step} days")
    print(f"Transaction Cost Friction    : {cost_bps} bps")
    print(f"Foundation Model             : Chronos-Bolt ({foundation_predictor.model_id})")
    print(f"Status                       : {fn_status}")
    if not foundation_predictor.foundation_model_active:
        print(f"Reason                       : {foundation_predictor.load_error}")
    print("-" * 80)

    print("\nMULTI-MODEL VS. BASELINES COMPARISON TABLE:")
    print("-" * 80)
    header = f"{'Metric':<25} | {'GradientBoosting':<16} | {'Foundation Model':<16} | {'Ensemble Model':<16} | {'Baseline 2 (Mean)':<16}"
    print(header)
    print("-" * 80)
    print(f"{'MAE':<25} | {gb_result.mae:<16.4f} | {fn_result.mae:<16.4f} | {ens_result.mae:<16.4f} | {b2_result['mae']:<16.4f}")
    print(f"{'RMSE':<25} | {gb_result.rmse:<16.4f} | {fn_result.rmse:<16.4f} | {ens_result.rmse:<16.4f} | {b2_result['rmse']:<16.4f}")
    print(f"{'Directional Accuracy':<25} | {gb_result.directional_accuracy:<16.4f} | {fn_result.directional_accuracy:<16.4f} | {ens_result.directional_accuracy:<16.4f} | {b2_result['directional_accuracy']:<16.4f}")
    print(f"{'Mean Predicted Return':<25} | {gb_result.mean_predicted_return:<16.4f} | {fn_result.mean_predicted_return:<16.4f} | {ens_result.mean_predicted_return:<16.4f} | {b2_result['mean_predicted_return']:<16.4f}")
    print(f"{'Mean Actual Return':<25} | {gb_result.mean_actual_return:<16.4f} | {fn_result.mean_actual_return:<16.4f} | {ens_result.mean_actual_return:<16.4f} | {b2_result['mean_actual_return']:<16.4f}")
    print(f"{'Cumulative Return':<25} | {gb_result.cumulative_strategy_return:<16.4f} | {fn_result.cumulative_strategy_return:<16.4f} | {ens_result.cumulative_strategy_return:<16.4f} | {b2_result['cumulative_strategy_return']:<16.4f}")
    print(f"{'Benchmark (Buy & Hold)':<25} | {gb_result.benchmark_return:<16.4f} | {fn_result.benchmark_return:<16.4f} | {ens_result.benchmark_return:<16.4f} | {b2_result['benchmark_return']:<16.4f}")
    print(f"{'Max Drawdown':<25} | {gb_result.max_drawdown:<16.4f} | {fn_result.max_drawdown:<16.4f} | {ens_result.max_drawdown:<16.4f} | {'N/A':<16}")
    print(f"{'Sharpe Ratio':<25} | {gb_result.sharpe_ratio:<16.2f} | {fn_result.sharpe_ratio:<16.2f} | {ens_result.sharpe_ratio:<16.2f} | {'N/A':<16}")
    print(f"{'Correct / Incorrect':<25} | {f'{gb_result.num_correct_directions}/{gb_result.num_incorrect_directions}':<16} | {f'{fn_result.num_correct_directions}/{fn_result.num_incorrect_directions}':<16} | {f'{ens_result.num_correct_directions}/{ens_result.num_incorrect_directions}':<16} | {'N/A':<16}")
    print("=" * 80 + "\n")

    return {
        "symbol": symbol.upper(),
        "gb": gb_result,
        "foundation": fn_result,
        "ensemble": ens_result,
        "baseline1": b1_result,
        "baseline2": b2_result,
    }


def run_friction_analysis(symbol: str, days: int = 730, horizon: int = 20):
    print("\n" + "=" * 80)
    print(f"TRANSACTION FRICTION SENSITIVITY ANALYSIS — {symbol.upper()} (Horizon: {horizon}d)")
    print("=" * 80)
    header = f"{'Friction (bps)':<16} | {'GB Strategy Return':<20} | {'Ensemble Strategy Return':<25} | {'Sharpe Ratio':<15}"
    print(header)
    print("-" * 80)
    for cost in [0, 5, 10, 20]:
        res = run_historical_validation(symbol, days=days, horizon=horizon, cost_bps=float(cost))
        print(f"{cost:<16} | {res['gb'].cumulative_strategy_return:<20.4f} | {res['ensemble'].cumulative_strategy_return:<25.4f} | {res['ensemble'].sharpe_ratio:<15.2f}")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run FinMitra multi-model real walk-forward backtest validation.")
    parser.add_argument("--symbol", type=str, default="RELIANCE.NS", help="Stock ticker symbol (e.g. RELIANCE.NS, TCS.NS, INFY.NS)")
    parser.add_argument("--days", type=int, default=730, help="Days of historical data to fetch")
    parser.add_argument("--years", type=int, default=None, help="Years of historical data to fetch (overrides --days if specified)")
    parser.add_argument("--horizon", type=int, default=20, help="Forecast horizon in days (5, 10, 20)")
    parser.add_argument("--friction", action="store_true", help="Run transaction cost friction sensitivity analysis (0, 5, 10, 20 bps)")
    parser.add_argument("--multi_stock", action="store_true", help="Run backtest across top 5 liquid Indian stocks")

    args = parser.parse_args()
    fetch_days = args.years * 365 if args.years else args.days

    if args.multi_stock:
        stocks = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
        for s in stocks:
            run_historical_validation(symbol=s, days=fetch_days, horizon=args.horizon)
    elif args.friction:
        run_friction_analysis(symbol=args.symbol, days=fetch_days, horizon=args.horizon)
    else:
        run_historical_validation(symbol=args.symbol, days=fetch_days, horizon=args.horizon)
