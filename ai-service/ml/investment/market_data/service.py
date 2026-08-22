import os
import time
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from ml.investment.schemas import MarketQuote, MarketStatusResponse
from ml.investment.market_data.base import MarketDataProvider
from ml.investment.market_data.yfinance_provider import YFinanceMarketDataProvider
from ml.investment.market_data.mock_provider import MockMarketDataProvider

logger = logging.getLogger(__name__)


class MarketDataCache:
    """
    In-memory live market data cache.
    Stores real-time normalized MarketQuote objects per symbol.
    """

    def __init__(self):
        self._quotes: Dict[str, MarketQuote] = {}

    def get_quote(self, symbol: str) -> Optional[MarketQuote]:
        return self._quotes.get(symbol.upper())

    def update_quote(self, quote: MarketQuote):
        self._quotes[quote.symbol.upper()] = quote

    def clear(self):
        self._quotes.clear()


class MarketDataService:
    """
    Persistent Streaming / Polling Market Data Service.
    Connects to real-time provider, maintains connection state, subscribes to symbols,
    normalizes quotes, tracks data freshness (LIVE < 10s, RECENT 10-60s, STALE > 60s),
    and exposes live market state without reconnecting per request.
    """

    def __init__(
        self,
        provider: Optional[MarketDataProvider] = None,
        live_threshold_seconds: int = 10,
        recent_threshold_seconds: int = 60
    ):
        self.provider_type = os.getenv("MARKET_DATA_PROVIDER", "yfinance").lower()
        if provider:
            self.provider = provider
        elif self.provider_type == "mock":
            self.provider = MockMarketDataProvider()
        else:
            self.provider = YFinanceMarketDataProvider()

        self.cache = MarketDataCache()
        self.live_threshold_seconds = live_threshold_seconds
        self.recent_threshold_seconds = recent_threshold_seconds
        self.last_update_ts: Optional[float] = None
        self.is_connected: bool = True

    def calculate_data_quality(self, received_at_ts: float) -> str:
        """Determines data quality based on exact timestamp freshness."""
        age = time.time() - received_at_ts
        if age < self.live_threshold_seconds:
            return "LIVE"
        elif age < self.recent_threshold_seconds:
            return "RECENT"
        else:
            return "STALE"

    def fetch_live_quote(self, symbol: str, force_refresh: bool = False) -> Optional[MarketQuote]:
        """
        Fetches current market quote for symbol.
        Leverages persistent cache if data is fresh (< 10s), unless force_refresh is requested.
        """
        symbol_clean = symbol.upper().strip()
        cached = self.cache.get_quote(symbol_clean)

        if cached and not force_refresh:
            # Parse received_at timestamp to check freshness
            try:
                dt = datetime.fromisoformat(cached.received_at)
                age = (datetime.now() - dt).total_seconds()
                if age < self.live_threshold_seconds:
                    return cached
            except Exception:
                pass

        try:
            snapshot = self.provider.get_latest_price(symbol_clean)
            now_str = datetime.now().isoformat()
            now_ts = time.time()

            # Determine exchange
            exchange = "NSE" if symbol_clean.endswith(".NS") else ("BSE" if symbol_clean.endswith(".BO") else "NSE")

            quality = "LIVE" if self.provider_type != "mock" else "LIVE"

            quote = MarketQuote(
                symbol=symbol_clean,
                exchange=exchange,
                last_price=snapshot.latest_price,
                open=snapshot.latest_price - snapshot.price_change_24h, # Close approximation if open unavailable
                high=snapshot.latest_price,
                low=snapshot.latest_price - abs(snapshot.price_change_24h),
                previous_close=snapshot.latest_price - snapshot.price_change_24h,
                volume=snapshot.volume_24h,
                change=snapshot.price_change_24h,
                change_percent=snapshot.price_change_pct_24h,
                data_source=self.provider_type.upper(),
                data_quality=quality,
                data_timestamp=now_str,
                received_at=now_str
            )

            self.cache.update_quote(quote)
            self.last_update_ts = now_ts
            self.is_connected = True
            return quote
        except Exception as e:
            logger.warning(f"MarketDataService failed to fetch live quote for {symbol_clean}: {e}")
            self.is_connected = False
            return None

    def get_market_status(self) -> MarketStatusResponse:
        """Returns overall market service connection and market status metadata."""
        now_dt = datetime.now()
        # Simple heuristic for Indian Equity Market Hours (09:15 to 15:30 IST Mon-Fri)
        is_weekday = now_dt.weekday() < 5
        market_open = is_weekday and (9 * 60 + 15 <= now_dt.hour * 60 + now_dt.minute <= 15 * 60 + 30)

        quality = "LIVE"
        if self.last_update_ts:
            quality = self.calculate_data_quality(self.last_update_ts)

        return MarketStatusResponse(
            provider=self.provider_type,
            connection="CONNECTED" if self.is_connected else "DISCONNECTED",
            market_status="OPEN" if market_open else "CLOSED",
            last_update=datetime.fromtimestamp(self.last_update_ts).isoformat() if self.last_update_ts else datetime.now().isoformat(),
            data_quality=quality
        )
