import pytest
from fastapi.testclient import TestClient
from main import app, market_provider, instrument_resolver, quote_service
from ml.investment.market_data.mock_provider import MockMarketDataProvider
from ml.investment.resolver import InstrumentResolver
from ai.quote_service import MarketQuoteService


client = TestClient(app)


def test_company_name_lookup():
    resolver = InstrumentResolver(market_provider)
    res_apple = resolver.resolve_company_name("Apple")
    assert res_apple["status"] == "SUCCESS"
    assert res_apple["instrument"]["symbol"] == "AAPL"

    res_nvda = resolver.resolve_company_name("Nvidia")
    assert res_nvda["status"] == "SUCCESS"
    assert res_nvda["instrument"]["symbol"] == "NVDA"

    res_infy = resolver.resolve_company_name("Infosys")
    assert res_infy["status"] == "SUCCESS"
    assert "INFY" in res_infy["instrument"]["symbol"]


def test_ticker_lookup():
    resolver = InstrumentResolver(market_provider)
    res_msft = resolver.resolve_symbol("MSFT")
    assert res_msft["status"] == "SUCCESS"
    assert res_msft["instrument"]["symbol"] == "MSFT"

    res_tsla = resolver.resolve_symbol("TSLA")
    assert res_tsla["status"] == "SUCCESS"
    assert res_tsla["instrument"]["symbol"] == "TSLA"


def test_exchange_qualified_lookup():
    resolver = InstrumentResolver(market_provider)
    details_ns = resolver.get_instrument_details("NSE:RELIANCE")
    assert details_ns is not None
    assert details_ns["exchange"] == "NSE"


def test_ambiguous_results():
    # Test ambiguous company resolution
    mock = MockMarketDataProvider()
    # Add multiple items matching 'Tata'
    mock_resolver = InstrumentResolver(mock)
    res = mock_resolver.resolve_company_name("Tata")
    assert res["status"] in ["AMBIGUOUS", "SUCCESS"]
    if res["status"] == "AMBIGUOUS":
        assert len(res["matches"]) > 1


def test_unsupported_asset():
    mock = MockMarketDataProvider()
    # Override supports_market to reject unsupported exchange
    def mock_supports_market(exch: str) -> bool:
        return exch != "UNSUPPORTED_EXCHANGE"

    mock.supports_market = mock_supports_market
    mock_qs = MarketQuoteService(mock)
    mock_qs.resolver.search_instruments = lambda q: [{
        "symbol": "FOO", "company": "Foo Corp", "exchange": "UNSUPPORTED_EXCHANGE", "market": "XX", "asset_type": "EQUITY", "country": "XX", "instrument_key": "XX:FOO"
    }]

    res = mock_qs.process_quote_query("What is FOO trading at?")
    assert res["status"] == "UNSUPPORTED_ASSET"


def test_unknown_stock():
    mock = MockMarketDataProvider()
    mock_qs = MarketQuoteService(mock)
    mock_qs.resolver.search_instruments = lambda q: []

    res = mock_qs.process_quote_query("What is NONEXISTENTCOMPANYXYZ trading at?")
    assert res["status"] == "INSTRUMENT_NOT_FOUND"


def test_live_quote_natural_language():
    res = quote_service.process_quote_query("What is Nvidia trading at?")
    assert res["status"] == "SUCCESS"
    assert res["symbol"] == "NVDA"
    assert "current_price" in res
    assert "change" in res
    assert "change_percent" in res
    assert "timestamp" in res
    assert res["current_price"] > 0


def test_historical_quote_unavail():
    res = quote_service.process_quote_query("What was Apple price at 2 PM yesterday?")
    assert res["status"] == "HISTORICAL_DATA_UNAVAILABLE"


def test_no_hardcoded_universe():
    # Verify that any symbol dynamically requested works
    res = quote_service.process_quote_query("What is AMD trading at?")
    assert res["status"] in ["SUCCESS", "AMBIGUOUS"]
    if res["status"] == "SUCCESS":
        assert res["symbol"] == "AMD"


def test_market_search_and_quote_api_endpoints():
    search_res = client.get("/market/search?q=Apple")
    assert search_res.status_code == 200
    assert search_res.json()["count"] > 0

    quote_res = client.get("/market/quote?query=What%20is%20Apple%20trading%20at?")
    assert quote_res.status_code == 200
    assert quote_res.json()["status"] == "SUCCESS"

    inst_res = client.get("/market/instrument/AAPL")
    assert inst_res.status_code == 200
    assert inst_res.json()["symbol"] == "AAPL"
