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
        end_date: datetime
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
