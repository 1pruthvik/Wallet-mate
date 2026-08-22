import pytest
from datetime import datetime, timedelta

from ml.investment.schemas import (
    HistoricalPrice,
    FundamentalSnapshot,
    PredictionResult,
    InvestmentCandidate,
    PredictRequest,
    AnalyzeInvestmentRequest,
    PortfolioRequest,
)
from ml.investment.market_data.mock_provider import MockMarketDataProvider
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.models.ensemble_predictor import EnsembleStockPredictor
from ml.investment.investment_score import calculate_investment_score
from ml.investment.backtest import WalkForwardBacktester
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)


@pytest.fixture
def sample_historical_prices():
    provider = MockMarketDataProvider()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=200)
    return provider.get_historical_prices("TCS", start_date, end_date)


def test_foundation_model_initialization(sample_historical_prices):
    predictor = FinancialFoundationPredictor()
    assert predictor is not None
    assert predictor.is_available is True
    assert predictor.model_id == "amazon/chronos-bolt-tiny"
    assert predictor.status_message in ["ACTIVE", "FALLBACK"]

    pred = predictor.predict("TCS", horizon_days=20, historical_prices=sample_historical_prices)
    assert isinstance(pred, PredictionResult)
    assert pred.symbol == "TCS"
    assert pred.horizon_days == 20
    assert pred.direction in ["positive", "negative", "neutral"]
    assert pred.confidence >= 0.0 and pred.confidence <= 1.0
    assert "Chronos-Bolt" in pred.model_name


def test_ensemble_predictor_weighting_and_agreement(sample_historical_prices):
    gb = StockMarketPredictor()
    fn = FinancialFoundationPredictor()
    ens = EnsembleStockPredictor(gradient_predictor=gb, foundation_predictor=fn, gradient_weight=0.5, foundation_weight=0.5)

    pred = ens.predict("TCS", horizon_days=20, historical_prices=sample_historical_prices)
    assert isinstance(pred, PredictionResult)
    assert pred.model_name.startswith("EnsembleStockPredictor")
    assert pred.selected_model == "ensemble"
    assert pred.model_agreement in ["HIGH", "MEDIUM", "LOW", "SINGLE_MODEL", "NO_CLEAR_SIGNAL", "LOW_CONFIDENCE"]
    assert "gradient_boosting" in pred.model_predictions
    assert "foundation_model" in pred.model_predictions


def test_ensemble_predictor_fallback_mode(sample_historical_prices):
    gb = StockMarketPredictor()
    fn = FinancialFoundationPredictor()
    fn.foundation_model_active = False # Simulate fallback mode
    ens = EnsembleStockPredictor(gradient_predictor=gb, foundation_predictor=fn)

    pred = ens.predict("TCS", horizon_days=20, historical_prices=sample_historical_prices)
    assert isinstance(pred, PredictionResult)
    assert pred.selected_model == "gradient_boosting"
    assert pred.model_agreement == "SINGLE_MODEL"


def test_investment_score_ranking_formula(sample_historical_prices):
    ens = EnsembleStockPredictor()
    pred = ens.predict("TCS", horizon_days=20, historical_prices=sample_historical_prices)
    fund = FundamentalSnapshot(symbol="TCS", pe_ratio=25.0, roe=20.0, debt_to_equity=0.1)

    score = calculate_investment_score(prediction=pred, fundamentals=fund)
    assert score.investment_score >= 0 and score.investment_score <= 100
    assert score.risk_level in ["LOW", "MEDIUM", "HIGH"]
    assert score.components.return_score >= 0.0


def test_backtest_transaction_friction(sample_historical_prices):
    gb = StockMarketPredictor()
    backtester_0 = WalkForwardBacktester(predictor=gb, horizon_days=20, transaction_cost_bps=0.0)
    backtester_20 = WalkForwardBacktester(predictor=gb, horizon_days=20, transaction_cost_bps=20.0)

    res_0 = backtester_0.run_backtest("TCS", sample_historical_prices)
    res_20 = backtester_20.run_backtest("TCS", sample_historical_prices)

    assert res_0.num_predictions > 0
    assert res_20.num_predictions > 0
    assert res_20.cumulative_strategy_return <= res_0.cumulative_strategy_return + 0.0001


def test_api_models_endpoint():
    response = client.get("/investment/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    model_names = [m["name"] for m in data["models"]]
    assert "gradient_boosting" in model_names
    assert "foundation" in model_names
    assert "ensemble" in model_names


def test_api_predict_endpoint_with_model_selection():
    response = client.post(
        "/investment/predict",
        json={"symbols": ["TCS"], "horizon_days": 20, "model_name": "ensemble"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 1
    pred = data["predictions"][0]
    assert pred["symbol"] == "TCS"
    assert "model_agreement" in pred
