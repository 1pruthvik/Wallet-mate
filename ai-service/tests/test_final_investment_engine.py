import os
import pytest
import time
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from main import app, market_service, model_registry
from ml.investment.market_data.service import MarketDataService, MarketDataCache
from ml.investment.market_data.mock_provider import MockMarketDataProvider
from ml.investment.schemas import MarketQuote, HistoricalPrice
from ml.investment.features import extract_market_features
from ml.investment.model_registry import ModelRegistry
from ml.investment.train import WalkForwardValidator, train_pipeline

client = TestClient(app)


def test_market_data_cache_and_service_freshness():
    service = MarketDataService(provider=MockMarketDataProvider(), live_threshold_seconds=2, recent_threshold_seconds=5)

    # 1. Fresh fetch (< 2s) -> LIVE
    quote = service.fetch_live_quote("ICICIBANK.NS")
    assert quote is not None
    assert quote.symbol == "ICICIBANK.NS"
    assert quote.data_quality == "LIVE"
    assert quote.last_price > 0

    # 2. Status endpoint returns CONNECTED
    status = service.get_market_status()
    assert status.connection == "CONNECTED"
    assert status.data_quality in ["LIVE", "RECENT"]


def test_point_in_time_fundamental_rules_no_lookahead_bias():
    now = datetime.now()
    historical_prices = [
        HistoricalPrice(symbol="TEST.NS", date=now - timedelta(days=i), open=100.0, high=105.0, low=95.0, close=100.0 + i, volume=10000.0)
        for i in range(30, 0, -1)
    ]

    # Historical training mode MUST ignore static current fundamentals to prevent look-ahead bias
    feats_train = extract_market_features(historical_prices, is_historical_training=True)
    assert feats_train["pe_ratio"] == 20.0
    assert feats_train["roe"] == 15.0
    assert feats_train["debt_to_equity"] == 0.3

    # Live prediction mode includes actual fundamentals
    class MockFund:
        pe_ratio = 45.0
        roe = 22.0
        debt_to_equity = 0.1

    feats_live = extract_market_features(historical_prices, fundamentals=MockFund(), is_historical_training=False)
    assert feats_live["pe_ratio"] == 45.0
    assert feats_live["roe"] == 22.0
    assert feats_live["debt_to_equity"] == 0.1


def test_walk_forward_chronological_splits():
    validator = WalkForwardValidator(train_ratio=0.6, val_ratio=0.2)
    dummy_prices = [
        HistoricalPrice(symbol="TEST.NS", date=datetime(2020, 1, 1) + timedelta(days=i), open=100.0, high=105.0, low=95.0, close=100.0 + i, volume=1000.0)
        for i in range(100)
    ]

    train, val, test = validator.split(dummy_prices)
    assert len(train) == 60
    assert len(val) == 20
    assert len(test) == 20

    # Strict chronological order check (no future leakage)
    assert train[-1].date < val[0].date
    assert val[-1].date < test[0].date


def test_model_registry_serialization(tmp_path):
    registry = ModelRegistry(registry_dir=str(tmp_path))

    version = registry.save_model(
        predictor_instance={"mock": "predictor_object"},
        model_version="v_test_100",
        symbol="RELIANCE.NS",
        training_start="2015-01-01",
        training_end="2025-01-01",
        training_rows=2500,
        validation_rows=500,
        test_rows=500,
        features=["daily_return", "volatility"],
        validation_metrics={"mae": 0.015, "directional_accuracy": 0.62}
    )

    assert version == "v_test_100"
    model_obj, meta = registry.load_active_model()
    assert meta is not None
    assert meta["model_version"] == "v_test_100"
    assert meta["symbol"] == "RELIANCE.NS"
    assert meta["training_rows"] == 2500
    assert meta["validation_metrics"]["directional_accuracy"] == 0.62


def test_api_quote_endpoint():
    res = client.get("/investment/quote/ICICIBANK.NS")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "ICICIBANK.NS"
    assert "last_price" in data
    assert "data_quality" in data
    assert "received_at" in data


def test_api_market_status_endpoint():
    res = client.get("/investment/market-status")
    assert res.status_code == 200
    data = res.json()
    assert "connection" in data
    assert "market_status" in data
    assert data["connection"] == "CONNECTED"


def test_api_model_status_endpoint():
    res = client.get("/investment/model-status")
    assert res.status_code == 200
    data = res.json()
    assert "loaded_model" in data
    assert "model_version" in data


def test_api_live_predict_endpoint():
    res = client.post(
        "/investment/live-predict",
        json={"symbol": "ICICIBANK.NS", "horizon_days": 20, "model_name": "ensemble"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "ICICIBANK.NS"
    assert "prediction" in data
    assert "predicted_return" in data["prediction"]
    assert "data_quality" in data
    assert "gemini_explanation" in data


def test_zero_groww_or_broker_routes_in_app():
    # Verify Groww endpoints return 404 Not Found
    res_groww1 = client.get("/auth/groww/connect")
    res_groww2 = client.get("/investment/user-portfolio")
    assert res_groww1.status_code == 404
    assert res_groww2.status_code == 404
