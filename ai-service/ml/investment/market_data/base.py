from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Optional

from ml.investment.schemas import (
    HistoricalPrice,
    MarketSnapshot,
    FundamentalSnapshot,
)


class MarketDataProvider(ABC):
    """
    Abstract Interface for Market Data Providers.
    Supports historical prices, snapshots, fundamentals, and market indices.
    """

    @abstractmethod
    def get_historical_prices(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime,
        interval: str = "1d"
    ) -> list[HistoricalPrice]:
        pass

    @abstractmethod
    def get_latest_price(self, symbol: str) -> MarketSnapshot:
        pass

    @abstractmethod
    def get_fundamentals(self, symbol: str) -> FundamentalSnapshot:
        pass

    @abstractmethod
    def get_market_index_data(
        self,
        symbol: str = "NIFTY50",
        days: int = 60
    ) -> list[HistoricalPrice]:
        pass

    def supports_market(self, exchange: str) -> bool:
        """Check if provider supports specified exchange (e.g. NSE, BSE, NASDAQ, NYSE)."""
        return True

    def supports_asset_type(self, asset_type: str) -> bool:
        """Check if provider supports asset type (e.g. EQUITY, INDEX, ETF)."""
        return asset_type.upper() in ["EQUITY", "STOCK", "INDEX", "ETF"]

    def supports_symbol_search(self) -> bool:
        """Check if provider supports dynamic symbol search."""
        return True

    def supports_realtime_quotes(self) -> bool:
        """Check if provider supports real-time quotes."""
        return True

    def supports_intraday_history(self) -> bool:
        """Check if provider supports intraday history."""
        return True

    def supports_historical_data(self) -> bool:
        """Check if provider supports daily historical data."""
        return True

    @abstractmethod
    def search_instruments(self, query: str) -> list[dict]:
        """Search instruments dynamically across provider dataset."""
        pass

