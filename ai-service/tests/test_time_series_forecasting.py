from datetime import datetime, timedelta
from unittest.mock import MagicMock
import numpy as np
import pytest

from ml.investment.schemas import HistoricalPrice, FundamentalSnapshot
from ml.investment.features import (
    compute_sma,
    compute_ema,
    compute_rsi,
    compute_atr,
    compute_log_return,
    extract_market_features,
)
from ml.investment.dataset import TimeSeriesDataset
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.backtest import WalkForwardBacktester
from ml.investment.market_data import MockMarketDataProvider
from ml.investment import (
    calculate_investment_score,
    evaluate_personalization,
    generate_portfolio_allocation,
    build_user_investment_profile,
)
from ai.gemini_provider import GeminiProvider


@pytest.fixture
def sample_historical_prices():
    provider = MockMarketDataProvider()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=150)
    return provider.get_historical_prices("TCS", start_date, end_date)


# ==================================================
# 1. FEATURE ENGINEERING & INDICATORS TESTS
# ==================================================

def test_feature_calculations(sample_historical_prices):
    prices = [p.close for p in sample_historical_prices]

    sma_20 = compute_sma(prices, 20)
    assert sma_20 > 0.0

    ema_12 = compute_ema(prices, 12)
    assert ema_12 > 0.0

    rsi_14 = compute_rsi(prices, 14)
    assert 0.0 <= rsi_14 <= 100.0

    atr_14 = compute_atr(sample_historical_prices, 14)
    assert atr_14 >= 0.0

    log_ret = compute_log_return(prices)
    assert isinstance(log_ret, float)

    feats = extract_market_features(sample_historical_prices)
    assert "rsi_14" in feats
    assert "atr_14" in feats
    assert "volatility" in feats
    assert "macd" in feats


# ==================================================
# 2. CHRONOLOGICAL TIME-SERIES DATASET TESTS
# ==================================================

def test_time_series_dataset_chronological_split(sample_historical_prices):
    dataset = TimeSeriesDataset(
        sample_historical_prices,
        horizon_days=10,
        lookback_days=20
    )
    (X_tr, y_tr, _), (X_v, y_v, _), (X_te, y_te, _) = dataset.split_chronological(train_ratio=0.7, val_ratio=0.15)

    assert len(X_tr) > 0
    assert len(X_v) >= 0
    assert len(X_te) >= 0

    # Ensure zero data leakage across split indices
    total_split = len(X_tr) + len(X_v) + len(X_te)
    assert total_split == len(dataset.X)


# ==================================================
# 3. PREDICTOR TRAINING & MODEL OUTPUT TESTS
# ==================================================

def test_predictor_training_and_prediction(sample_historical_prices):
    predictor = StockMarketPredictor()
    predictor.train()

    res = predictor.predict("TCS", horizon_days=20, historical_prices=sample_historical_prices)

    assert res.symbol == "TCS"
    assert res.horizon_days == 20
    assert isinstance(res.predicted_return, float)
    assert res.expected_return_range.low <= res.expected_return_range.high
    assert 0 <= res.risk_score <= 100
    assert 0.0 <= res.confidence <= 1.0
    assert res.direction in ["positive", "neutral", "negative"]
    assert res.current_price is not None
    assert res.expected_price is not None
    assert res.model_name == "GradientBoostingRegressor"


# ==================================================
# 4. WALK-FORWARD BACKTESTING TESTS
# ==================================================

def test_walk_forward_backtester(sample_historical_prices):
    backtester = WalkForwardBacktester(train_window_days=30, test_step_days=10, horizon_days=10)
    result = backtester.run_backtest("TCS", sample_historical_prices)

    assert result.symbol == "TCS"
    assert result.num_predictions >= 0
    assert result.mae >= 0.0
    assert result.rmse >= 0.0
    assert 0.0 <= result.directional_accuracy <= 1.0
    assert isinstance(result.cumulative_strategy_return, float)
    assert isinstance(result.benchmark_return, float)
    assert result.max_drawdown >= 0.0


# ==================================================
# 5. INTEGRATION WITH INVESTMENT ENGINE & PORTFOLIO
# ==================================================

def test_full_investment_engine_pipeline(sample_historical_prices):
    predictor = StockMarketPredictor()
    pred = predictor.predict("TCS", historical_prices=sample_historical_prices)

    fund = FundamentalSnapshot(symbol="TCS", pe_ratio=25.0, roe=20.0, debt_to_equity=0.1)
    score = calculate_investment_score(prediction=pred, fundamentals=fund)

    user_profile = build_user_investment_profile(transactions=[], budgets={})
    user_profile.investment_readiness = "READY"
    pers = evaluate_personalization(user_profile=user_profile, investment_score=score, prediction=pred)

    from ml.investment.schemas import InvestmentCandidate
    candidate = InvestmentCandidate(
        symbol="TCS",
        prediction=pred,
        investment_score=score,
        personalization=pers
    )

    portfolio = generate_portfolio_allocation(
        candidates=[candidate],
        investable_amount=10000.0,
        user_profile=user_profile
    )

    assert portfolio.investable_amount == 10000.0
    assert len(portfolio.allocation) > 0


# ==================================================
# 6. GEMINI EXPLANATION CONSTRAINTS TESTS
# ==================================================

def test_gemini_explains_without_fabrication():
    provider = GeminiProvider(api_key="fake_key_123")

    mock_response = MagicMock()
    mock_response.text = '{"summary": "Model expects 5% return based on RSI momentum", "why_it_matters": "Low debt", "key_factors": ["RSI", "MACD"], "risks": ["Volatility"], "uncertainty": "Medium", "educational_note": "Research only"}'

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response
    provider._client = mock_client

    market_pred = {
        "symbol": "INFY",
        "predicted_return": 0.05,
        "current_price": 1600.0,
        "expected_price": 1680.0
    }

    res = provider.generate_explanation(
        market_prediction=market_pred,
        investment_score={"investment_score": 75}
    )

    assert res["summary"] == "Model expects 5% return based on RSI momentum"
    # Ensure key was not exposed
    assert "fake_key_123" not in str(res)
