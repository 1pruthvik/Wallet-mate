import pytest
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from main import app
from ml.investment.schemas import PredictionResult, HistoricalPrice
from ml.investment.models.base_predictor import BaseStockPredictor
from ml.investment.models.predictor import GradientBoostingPredictor
from ml.investment.models.foundation_predictor import ChronosBoltPredictor
from ml.investment.models.chronos2_predictor import Chronos2Predictor
from ml.investment.models.timesfm_predictor import TimesFM25Predictor
from ml.investment.models.moirai_predictor import Moirai2Predictor
from ml.investment.models.ensemble_predictor import EnsembleStockPredictor
from ml.investment.tournament import ModelTournament


@pytest.fixture
def sample_historical_prices():
    prices = []
    base_date = datetime.now() - timedelta(days=200)
    price = 100.0
    for i in range(200):
        dt = base_date + timedelta(days=i)
        price += (1.0 if i % 2 == 0 else -0.8)
        prices.append(HistoricalPrice(
            symbol="TEST.NS",
            date=dt,
            open=price - 0.5,
            high=price + 1.0,
            low=price - 1.0,
            close=price,
            volume=10000 + i * 10
        ))
    return prices


def test_model_adapters_metadata():
    gb = GradientBoostingPredictor()
    chronos_bolt = ChronosBoltPredictor()
    chronos2 = Chronos2Predictor()
    timesfm = TimesFM25Predictor()
    moirai = Moirai2Predictor()

    assert gb.get_model_metadata()["status"] == "AVAILABLE"
    assert chronos_bolt.get_model_metadata()["status"] in ["AVAILABLE", "FALLBACK", "UNAVAILABLE"]
    assert chronos2.get_model_metadata()["status"] in ["AVAILABLE", "FALLBACK", "UNAVAILABLE"]
    assert timesfm.get_model_metadata()["status"] in ["AVAILABLE", "FALLBACK", "UNAVAILABLE"]
    assert moirai.get_model_metadata()["status"] in ["AVAILABLE", "FALLBACK", "UNAVAILABLE"]


def test_ensemble_validation_weighting_and_abstention(sample_historical_prices):
    gb = GradientBoostingPredictor()
    chronos_bolt = ChronosBoltPredictor()
    chronos2 = Chronos2Predictor()

    ensemble = EnsembleStockPredictor(
        predictors=[gb, chronos_bolt, chronos2]
    )

    ensemble.fit_ensemble_weights(sample_historical_prices[:100], horizon_days=20)
    metadata = ensemble.get_model_metadata()
    assert metadata["status"] == "AVAILABLE"
    assert len(metadata["sub_models"]) > 0

    # Test prediction contract
    res = ensemble.predict("TEST.NS", horizon_days=20, historical_prices=sample_historical_prices)
    assert isinstance(res, PredictionResult)
    assert res.symbol == "TEST.NS"
    assert res.model_agreement in ["HIGH", "MEDIUM", "LOW", "SINGLE_MODEL", "LOW_CONFIDENCE", "NO_CLEAR_SIGNAL"]


def test_model_tournament_mocked(sample_historical_prices):
    with patch("ml.investment.market_data.yfinance_provider.YFinanceMarketDataProvider.get_historical_prices") as mock_hist, \
         patch("ml.investment.market_data.yfinance_provider.YFinanceMarketDataProvider.get_fundamentals") as mock_fund:
        mock_hist.return_value = sample_historical_prices
        mock_fund.return_value = None

        tourney = ModelTournament(symbol="TEST.NS", years=1, horizon=20)
        res = tourney.run_tournament()

        assert res["symbol"] == "TEST.NS"
        assert "winning_model" in res
        assert res["winning_model"] in res["scores"]
        assert len(res["results"]) == 6  # 5 candidates + Ensemble


def test_api_tournament_endpoints():
    client = TestClient(app)

    # 1. GET /investment/models
    resp = client.get("/investment/models")
    assert resp.status_code == 200
    data = resp.json()
    assert "candidate_models" in data
    assert len(data["candidate_models"]) >= 5

    # 2. GET /investment/model-status
    resp_stat = client.get("/investment/model-status")
    assert resp_stat.status_code == 200
    stat_data = resp_stat.json()
    assert ("model_version" in stat_data or "status" in stat_data)
