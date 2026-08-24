from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any

from ml.investment.schemas import (
    HistoricalPrice,
    MarketSnapshot,
    FundamentalSnapshot,
    MarketQuote,
    MarketStatusResponse,
)


class RealTimeMarketDataProvider(ABC):
    """Abstract interface for continuous real-time market data providers."""

    @abstractmethod
    def get_quote(self, symbol: str) -> MarketQuote:
        pass

    @abstractmethod
    def get_quotes(self, symbols: list[str]) -> list[MarketQuote]:
        pass

    def subscribe(self, symbols: list[str]) -> None:
        pass

    def unsubscribe(self, symbols: list[str]) -> None:
        pass

    def stream(self):
        pass


class HistoricalMarketDataProvider(ABC):
    """Abstract interface for historical and intraday market data providers."""

    @abstractmethod
    def get_historical_data(
        self,
        symbol: str,
        start: datetime,
        end: datetime,
        interval: str = "1d"
    ) -> list[HistoricalPrice]:
        pass

    @abstractmethod
    def get_intraday_data(
        self,
        symbol: str,
        start: datetime,
        end: datetime
    ) -> list[HistoricalPrice]:
        pass


class MarketDataProvider(RealTimeMarketDataProvider, HistoricalMarketDataProvider, ABC):
    """
    Unified Abstract Interface for Market Data Providers.
    Supports historical prices, real-time quotes, fundamentals, instrument search, and market status.
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

    def get_historical_data(
        self,
        symbol: str,
        start: datetime,
        end: datetime,
        interval: str = "1d"
    ) -> list[HistoricalPrice]:
        return self.get_historical_prices(symbol, start, end, interval)

    def get_intraday_data(
        self,
        symbol: str,
        start: datetime,
        end: datetime
    ) -> list[HistoricalPrice]:
        return self.get_historical_prices(symbol, start, end, interval="5m")

    @abstractmethod
    def get_latest_price(self, symbol: str) -> MarketSnapshot:
        pass

    def get_quote(self, symbol: str) -> MarketQuote:
        snapshot = self.get_latest_price(symbol)
        now_str = datetime.now().isoformat()
        return MarketQuote(
            symbol=symbol.upper().strip(),
            company=f"{symbol.upper()} Corp",
            exchange="NSE" if symbol.upper().endswith(".NS") else "NASDAQ",
            last_price=snapshot.latest_price,
            open=snapshot.latest_price - snapshot.price_change_24h,
            high=snapshot.latest_price,
            low=snapshot.latest_price - abs(snapshot.price_change_24h),
            previous_close=snapshot.latest_price - snapshot.price_change_24h,
            volume=snapshot.volume_24h,
            change=snapshot.price_change_24h,
            change_percent=snapshot.price_change_pct_24h,
            data_source="PROVIDER",
            data_quality="LIVE",
            data_timestamp=now_str,
            received_at=now_str
        )

    def get_quotes(self, symbols: list[str]) -> list[MarketQuote]:
        return [self.get_quote(s) for s in symbols]

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

    def get_market_status(self) -> MarketStatusResponse:
        return MarketStatusResponse(
            provider=self.__class__.__name__,
            connection="CONNECTED",
            market_status="OPEN",
            last_update=datetime.now().isoformat(),
            symbols_streaming=0,
            data_quality="LIVE"
        )

    def get_instrument_details(self, symbol: str) -> Optional[dict]:
        results = self.search_instruments(symbol)
        for res in results:
            if res.get("symbol", "").upper() == symbol.upper().strip():
                return res
        return results[0] if results else None

    def supports_market(self, exchange: str) -> bool:
        return True

    def supports_asset_type(self, asset_type: str) -> bool:
        return asset_type.upper() in ["EQUITY", "STOCK", "INDEX", "ETF"]

    def supports_symbol_search(self) -> bool:
        return True

    def supports_realtime_quotes(self) -> bool:
        return True

    def supports_intraday_history(self) -> bool:
        return True

    def supports_historical_data(self) -> bool:
        return True

    @abstractmethod
    def search_instruments(self, query: str) -> list[dict]:
        pass


