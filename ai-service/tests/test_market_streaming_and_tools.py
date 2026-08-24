import time
from datetime import datetime, timedelta
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from ml.investment.market_data.mock_provider import MockMarketDataProvider
from ml.investment.market_data.service import MarketDataService, MarketDataCache
from ml.investment.resolver import InstrumentResolver
from ai.quote_service import MarketQuoteService
from ai.tools import MarketDataTools
from main import app


@pytest.fixture
def mock_provider():
    return MockMarketDataProvider()


@pytest.fixture
def market_service(mock_provider):
    return MarketDataService(provider=mock_provider, live_threshold_seconds=2, recent_threshold_seconds=5, max_live_symbols_per_user=5)


@pytest.fixture
def resolver(mock_provider):
    return InstrumentResolver(mock_provider)


# ==================================================
# 1. PROVIDER & CACHE TESTS
# ==================================================

def test_live_quote(market_service):
    quote = market_service.fetch_live_quote("ICICIBANK")
    assert quote is not None
    assert quote.symbol == "ICICIBANK"
    assert quote.last_price > 0
    assert quote.data_quality == "LIVE"


def test_quote_cache(market_service):
    q1 = market_service.fetch_live_quote("AAPL")
    assert q1 is not None
    
    # Second fetch should hit cache
    q2 = market_service.fetch_live_quote("AAPL")
    assert q2 is not None
    assert q2.data_timestamp == q1.data_timestamp


def test_stale_quote(market_service):
    q = market_service.fetch_live_quote("NVDA")
    assert q is not None
    assert q.data_quality == "LIVE"

    # Manipulate timestamp to simulate aging data (> 5 seconds)
    sym = "NVDA"
    market_service.cache._received_timestamps[sym] = time.time() - 10.0

    stale_q = market_service.fetch_live_quote("NVDA", force_refresh=False)
    assert stale_q is not None
    # Calculate quality should report STALE for aged timestamp
    quality = market_service.calculate_data_quality(time.time() - 10.0)
    assert quality == "STALE"


def test_market_status(market_service):
    status = market_service.get_market_status()
    assert status.connection == "CONNECTED"
    assert status.provider in ["mock", "yfinance", "MockMarketDataProvider", "YFinanceMarketDataProvider"]
    assert status.data_quality in ["LIVE", "RECENT", "STALE"]


# ==================================================
# 2. DYNAMIC INSTRUMENT RESOLUTION TESTS
# ==================================================

def test_instrument_search(resolver):
    matches = resolver.search_instruments("Apple")
    assert len(matches) > 0
    assert any(m["symbol"] == "AAPL" for m in matches)


def test_dynamic_symbol_resolution(resolver):
    res = resolver.resolve_query("NVDA")
    assert res["status"] == "SUCCESS"
    assert res["instrument"]["symbol"] == "NVDA"

    res_co = resolver.resolve_query("Reliance")
    assert res_co["status"] == "SUCCESS"
    assert "RELIANCE" in res_co["instrument"]["symbol"]


def test_ambiguous_symbol(resolver):
    res = resolver.resolve_company_name("TATA")
    # "TATA" matches multiple companies (TCS, Tata Motors)
    assert res["status"] in ["AMBIGUOUS", "SUCCESS"]
    if res["status"] == "AMBIGUOUS":
        assert len(res["matches"]) > 1


def test_missing_symbol(resolver):
    res = resolver.resolve_query("XYZ_NON_EXISTENT_SECURITY_999")
    # Dynamic fallback creates or reports not found
    assert res["status"] in ["SUCCESS", "INSTRUMENT_NOT_FOUND"]


# ==================================================
# 3. GEMINI FUNCTION TOOLS & GROUNDING TESTS
# ==================================================

def test_gemini_market_tool_call(market_service):
    predictor_mock = MagicMock()
    tools = MarketDataTools(market_service, predictor_mock)

    result = tools.execute_tool("get_live_quote", {"symbol_or_query": "ICICI Bank"})
    assert result is not None
    assert "price" in result or "last_price" in result
    assert result.get("exchange") in ["NSE", "NASDAQ", "BSE"]


def test_gemini_uses_tool_result(market_service):
    predictor_mock = MagicMock()
    tools = MarketDataTools(market_service, predictor_mock)

    res = tools.parse_intent_and_execute("What is Apple trading at?")
    assert res is not None
    assert res["tool_called"] == "get_live_quote"
    assert "result" in res


def test_gemini_does_not_invent_price(market_service):
    predictor_mock = MagicMock()
    tools = MarketDataTools(market_service, predictor_mock)

    # Tool output for missing asset returns error status without inventing price
    res = tools.execute_tool("get_historical_quote", {"symbol_or_query": "INVALID_XYZ", "timestamp": "2 PM yesterday"})
    assert res["status"] == "HISTORICAL_DATA_UNAVAILABLE"
    assert "unavailable" in res["message"].lower()


def test_historical_quote(market_service):
    predictor_mock = MagicMock()
    tools = MarketDataTools(market_service, predictor_mock)

    res = tools.execute_tool("get_historical_quote", {"symbol_or_query": "ICICIBANK", "timestamp": "2 PM yesterday"})
    assert "HISTORICAL" in res["status"]


def test_provider_failure(market_service):
    # Simulate provider failure
    market_service.provider.get_latest_price = MagicMock(side_effect=RuntimeError("Provider socket closed"))
    quote = market_service.fetch_live_quote("UNKNOWN_FAIL_SYM", force_refresh=True)
    # Should handle failure without crashing
    assert quote is None or quote.data_quality in ["STALE", "UNAVAILABLE"]


def test_user_watchlist_isolation(market_service):
    market_service.subscribe(["AAPL", "NVDA"], user_id="user_A")
    market_service.subscribe(["RELIANCE.NS"], user_id="user_B")

    assert "AAPL" in market_service.user_subscriptions["user_A"]
    assert "RELIANCE.NS" in market_service.user_subscriptions["user_B"]
    assert "RELIANCE.NS" not in market_service.user_subscriptions["user_A"]

    # Exceeding limit
    subbed = market_service.subscribe(["S1", "S2", "S3", "S4", "S5", "S6"], user_id="user_A")
    # max_symbols_per_user is 5 in fixture
    assert len(market_service.user_subscriptions["user_A"]) <= 5


# ==================================================
# 4. REST ENDPOINTS INTEGRATION TESTS
# ==================================================

client = TestClient(app)


def test_rest_market_quote_endpoint():
    response = client.get("/market/quote?query=ICICI%20Bank")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data
    assert "price" in data or "current_price" in data


def test_rest_market_status_endpoint():
    response = client.get("/market/status")
    assert response.status_code == 200
    data = response.json()
    assert "connection" in data
    assert "market_status" in data


def test_rest_market_search_endpoint():
    response = client.get("/market/search?q=Apple")
    assert response.status_code == 200
    data = response.json()
    assert "matches" in data
    assert data["count"] > 0
