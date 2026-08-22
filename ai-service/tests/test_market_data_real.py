from datetime import datetime, timedelta
import pytest

from ml.investment.schemas import HistoricalPrice
from ml.investment.market_data import MockMarketDataProvider, YFinanceMarketDataProvider
from ml.investment.market_data.validation import (
    validate_and_clean_historical_prices,
    InsufficientDataError,
)


def test_market_data_provider_initialization():
    mock_provider = MockMarketDataProvider()
    assert mock_provider is not None

    yf_provider = YFinanceMarketDataProvider()
    assert yf_provider is not None


def test_normalized_ohlcv_data():
    provider = MockMarketDataProvider()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=10)

    prices = provider.get_historical_prices("RELIANCE", start_date, end_date)
    assert len(prices) > 0

    first = prices[0]
    assert hasattr(first, "date")
    assert hasattr(first, "open")
    assert hasattr(first, "high")
    assert hasattr(first, "low")
    assert hasattr(first, "close")
    assert hasattr(first, "volume")

    assert first.open > 0
    assert first.close > 0
    assert first.high >= first.low
    assert first.volume >= 0


def test_data_validation_and_cleaning():
    dt1 = datetime(2026, 1, 1)
    dt2 = datetime(2026, 1, 2)
    dt3 = datetime(2026, 1, 3)

    raw_prices = []
    # Create 35 sample rows to pass min_history_length=30
    for i in range(35):
        d = dt1 + timedelta(days=i)
        raw_prices.append(
            HistoricalPrice(
                symbol="TEST",
                date=d,
                open=100.0 + i,
                high=105.0 + i,
                low=95.0 + i,
                close=102.0 + i,
                volume=1000.0
            )
        )

    # Insert out of order, zero volume, and duplicate date
    raw_prices.append(
        HistoricalPrice(
            symbol="TEST",
            date=dt2,
            open=101.0,
            high=106.0,
            low=96.0,
            close=103.0,
            volume=0.0
        )
    )

    cleaned = validate_and_clean_historical_prices(raw_prices, min_history_length=30)
    assert len(cleaned) == 35
    # Verify chronological ordering
    for i in range(len(cleaned) - 1):
        assert cleaned[i].date < cleaned[i + 1].date


def test_insufficient_history_detection():
    short_prices = [
        HistoricalPrice(
            symbol="SHORT",
            date=datetime(2026, 1, 1),
            open=100.0,
            high=105.0,
            low=95.0,
            close=102.0,
            volume=1000.0
        )
    ]
    with pytest.raises(InsufficientDataError):
        validate_and_clean_historical_prices(short_prices, min_history_length=30)
