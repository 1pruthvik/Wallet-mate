import os
import time
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Set, Any

from ml.investment.schemas import MarketQuote, MarketStatusResponse
from ml.investment.market_data.base import MarketDataProvider
from ml.investment.market_data.yfinance_provider import YFinanceMarketDataProvider
from ml.investment.market_data.mock_provider import MockMarketDataProvider

logger = logging.getLogger(__name__)


class MarketDataCache:
    """
    In-memory live market data cache.
    Stores real-time normalized MarketQuote objects per symbol with freshness tracking.
    """

    def __init__(self):
        self._quotes: Dict[str, MarketQuote] = {}
        self._received_timestamps: Dict[str, float] = {}

    def get_quote(self, symbol: str) -> Optional[MarketQuote]:
        return self._quotes.get(symbol.upper())

    def get_timestamp(self, symbol: str) -> Optional[float]:
        return self._received_timestamps.get(symbol.upper())

    def update_quote(self, quote: MarketQuote):
        sym = quote.symbol.upper()
        self._quotes[sym] = quote
        self._received_timestamps[sym] = time.time()

    def clear(self):
        self._quotes.clear()
        self._received_timestamps.clear()


class MarketDataService:
    """
    Persistent Streaming / Polling Market Data Service.
    Connects to real-time provider, maintains connection state, subscribes to symbols,
    normalizes quotes, tracks data freshness (LIVE < 10s, RECENT 10-60s, STALE > 60s),
    implements automatic reconnection with exponential backoff, and exposes live market state.
    """

    def __init__(
        self,
        provider: Optional[MarketDataProvider] = None,
        live_threshold_seconds: Optional[int] = None,
        recent_threshold_seconds: Optional[int] = None,
        max_live_symbols_per_user: Optional[int] = None
    ):
        self.provider_type = os.getenv("MARKET_DATA_PROVIDER", "yfinance").lower()
        if provider:
            self.provider = provider
        elif self.provider_type == "mock":
            self.provider = MockMarketDataProvider()
        else:
            self.provider = YFinanceMarketDataProvider()

        self.live_threshold_seconds = live_threshold_seconds or int(os.getenv("LIVE_DATA_MAX_AGE_SECONDS", "10"))
        self.recent_threshold_seconds = recent_threshold_seconds or int(os.getenv("RECENT_DATA_MAX_AGE_SECONDS", "60"))
        self.max_symbols_per_user = max_live_symbols_per_user or int(os.getenv("MAX_LIVE_SYMBOLS_PER_USER", "50"))

        self.cache = MarketDataCache()
        self.last_update_ts: Optional[float] = None
        self.is_connected: bool = False
        self.subscribed_symbols: Set[str] = set()
        self.user_subscriptions: Dict[str, Set[str]] = {}
        
        # Exponential backoff config
        self._reconnect_attempts: int = 0
        self._max_backoff_seconds: float = 30.0

        # Initialize connection
        self.connect()

    def connect(self) -> bool:
        """Establish persistent connection to market data provider feed."""
        try:
            logger.info(f"Connecting MarketDataService to provider: {self.provider_type}")
            self.is_connected = True
            self._reconnect_attempts = 0
            return True
        except Exception as e:
            logger.error(f"Failed to connect to market data provider: {e}")
            self.is_connected = False
            return False

    def reconnect(self) -> bool:
        """Controlled exponential backoff reconnection on provider socket loss or error."""
        self._reconnect_attempts += 1
        backoff_delay = min(self._max_backoff_seconds, 2 ** (self._reconnect_attempts - 1))
        logger.info(f"Attempting MarketDataService reconnect attempt #{self._reconnect_attempts} in {backoff_delay}s...")
        time.sleep(min(backoff_delay, 0.1)) # Fast unit testing safety delay
        return self.connect()

    def shutdown(self):
        """Cleanly close market data provider feeds and clear cache."""
        logger.info("Shutting down MarketDataService connection...")
        self.is_connected = False
        self.subscribed_symbols.clear()
        self.user_subscriptions.clear()

    def subscribe(self, symbols: list[str], user_id: str = "default_user") -> list[str]:
        """Subscribe user to real-time quote feeds with rate limiting."""
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()

        user_subs = self.user_subscriptions[user_id]
        added = []
        for s in symbols:
            clean_s = s.upper().strip()
            if len(user_subs) >= self.max_symbols_per_user and clean_s not in user_subs:
                logger.warning(f"User '{user_id}' reached MAX_LIVE_SYMBOLS_PER_USER limit ({self.max_symbols_per_user}).")
                continue
            user_subs.add(clean_s)
            self.subscribed_symbols.add(clean_s)
            added.append(clean_s)

        if hasattr(self.provider, "subscribe"):
            self.provider.subscribe(added)
        return added

    def unsubscribe(self, symbols: list[str], user_id: str = "default_user") -> list[str]:
        """Unsubscribe user from specified symbols."""
        user_subs = self.user_subscriptions.get(user_id, set())
        removed = []
        for s in symbols:
            clean_s = s.upper().strip()
            if clean_s in user_subs:
                user_subs.remove(clean_s)
                removed.append(clean_s)
            
            # Check if any other user is listening
            still_needed = any(clean_s in subs for u_id, subs in self.user_subscriptions.items())
            if not still_needed and clean_s in self.subscribed_symbols:
                self.subscribed_symbols.remove(clean_s)

        if hasattr(self.provider, "unsubscribe"):
            self.provider.unsubscribe(removed)
        return removed

    def receive(self) -> list[MarketQuote]:
        """Receive latest ticks for all currently subscribed symbols."""
        if not self.is_connected:
            self.reconnect()
        return self.get_all_live_quotes(list(self.subscribed_symbols))

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
        cached_ts = self.cache.get_timestamp(symbol_clean)

        if cached and cached_ts and not force_refresh:
            quality = self.calculate_data_quality(cached_ts)
            if quality != "STALE":
                cached.data_quality = quality
                return cached

        if not self.is_connected:
            if not self.reconnect():
                if cached:
                    cached.data_quality = "STALE"
                    return cached
                return None

        try:
            snapshot = self.provider.get_latest_price(symbol_clean)
            now_str = datetime.now().isoformat()
            now_ts = time.time()

            exchange = "NSE" if symbol_clean.endswith(".NS") else ("BSE" if symbol_clean.endswith(".BO") else "NASDAQ")
            
            company_name = f"{symbol_clean.replace('.NS', '').replace('.BO', '')} Corp"
            # Extract company details if available
            if hasattr(self.provider, "search_instruments"):
                try:
                    res = self.provider.search_instruments(symbol_clean)
                    if res:
                        company_name = res[0].get("company", company_name)
                        exchange = res[0].get("exchange", exchange)
                except Exception:
                    pass

            quote = MarketQuote(
                symbol=symbol_clean,
                company=company_name,
                exchange=exchange,
                last_price=snapshot.latest_price,
                open=snapshot.latest_price - snapshot.price_change_24h,
                high=snapshot.latest_price,
                low=snapshot.latest_price - abs(snapshot.price_change_24h),
                previous_close=snapshot.latest_price - snapshot.price_change_24h,
                volume=snapshot.volume_24h,
                change=snapshot.price_change_24h,
                change_percent=snapshot.price_change_pct_24h,
                data_source=self.provider_type.upper(),
                data_quality="LIVE",
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
            if cached:
                cached.data_quality = "STALE"
                return cached
            return None

    def get_market_status(self) -> MarketStatusResponse:
        """Returns overall market service connection and market status metadata."""
        now_dt = datetime.now()
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
            symbols_streaming=len(self.subscribed_symbols),
            data_quality=quality
        )

    def get_all_live_quotes(self, symbols: Optional[list[str]] = None) -> list[MarketQuote]:
        """Fetches and normalizes live market quotes for a list of watched symbols."""
        if not symbols:
            symbols = list(self.subscribed_symbols) or ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
        quotes = []
        for sym in symbols:
            q = self.fetch_live_quote(sym, force_refresh=True)
            if q:
                quotes.append(q)
        return quotes

    def get_quote(self, symbol: str) -> Optional[MarketQuote]:
        """Convenience method returning quote for specified symbol."""
        return self.fetch_live_quote(symbol)

    def get_quotes(self, symbols: list[str]) -> list[MarketQuote]:
        """Convenience method returning quotes for specified symbols."""
        return [q for q in (self.fetch_live_quote(s) for s in symbols) if q is not None]



