from datetime import datetime, timedelta
import logging
from typing import Optional, Any

from ml.investment.schemas import (
    HistoricalPrice,
    MarketSnapshot,
    FundamentalSnapshot,
)
from ml.investment.market_data.base import MarketDataProvider
from ml.investment.market_data.mock_provider import MockMarketDataProvider

logger = logging.getLogger(__name__)


class YFinanceMarketDataProvider(MarketDataProvider):
    """
    Market Data Provider using yfinance with in-memory caching.
    Falls back gracefully to MockMarketDataProvider if offline or network unavailable.
    """

    def __init__(self, cache_ttl_seconds: int = 3600, raise_on_error: bool = False):
        self.cache_ttl_seconds = cache_ttl_seconds
        self.raise_on_error = raise_on_error
        self._price_cache: dict[str, tuple[datetime, list[HistoricalPrice]]] = {}
        self._snapshot_cache: dict[str, tuple[datetime, MarketSnapshot]] = {}
        self._fundamental_cache: dict[str, tuple[datetime, FundamentalSnapshot]] = {}
        self._fallback_provider = MockMarketDataProvider()

    def _is_cache_valid(self, timestamp: datetime) -> bool:
        return (datetime.now() - timestamp).total_seconds() < self.cache_ttl_seconds

    def _format_ticker(self, symbol: str) -> str:
        clean = symbol.upper().strip()
        if clean in ["NIFTY50", "^NSEI"]:
            return "^NSEI"
        if not (clean.endswith(".NS") or clean.endswith(".BO") or clean.startswith("^")):
            return f"{clean}.NS"
        return clean

    def get_historical_prices(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime,
        interval: str = "1d"
    ) -> list[HistoricalPrice]:
        cache_key = f"{symbol.upper()}_{start_date.date()}_{end_date.date()}_{interval}"
        if cache_key in self._price_cache:
            cached_time, cached_data = self._price_cache[cache_key]
            if self._is_cache_valid(cached_time):
                return cached_data

        ticker_symbol = self._format_ticker(symbol)
        try:
            import yfinance as yf
            ticker = yf.Ticker(ticker_symbol)
            df = ticker.history(start=start_date, end=end_date, interval=interval)

            if df.empty:
                if self.raise_on_error:
                    raise RuntimeError(f"Real market data provider returned empty DataFrame for ticker '{ticker_symbol}'.")
                logger.warning(f"No yfinance data returned for {symbol}, falling back to mock provider.")
                return self._fallback_provider.get_historical_prices(symbol, start_date, end_date, interval)

            prices = []
            for idx, row in df.iterrows():
                prices.append(
                    HistoricalPrice(
                        symbol=symbol.upper(),
                        date=idx.to_pydatetime(),
                        open=round(float(row["Open"]), 2),
                        high=round(float(row["High"]), 2),
                        low=round(float(row["Low"]), 2),
                        close=round(float(row["Close"]), 2),
                        volume=round(float(row["Volume"]), 2),
                    )
                )

            self._price_cache[cache_key] = (datetime.now(), prices)
            return prices
        except Exception as e:
            if self.raise_on_error:
                raise RuntimeError(f"Real market data provider failed to fetch '{ticker_symbol}': {str(e)}") from e
            logger.warning(f"Failed to fetch yfinance data for {symbol} ({e}), using mock provider.")
            return self._fallback_provider.get_historical_prices(symbol, start_date, end_date, interval)

    def get_latest_price(self, symbol: str) -> MarketSnapshot:
        cache_key = symbol.upper()
        if cache_key in self._snapshot_cache:
            cached_time, cached_snapshot = self._snapshot_cache[cache_key]
            if self._is_cache_valid(cached_time):
                return cached_snapshot

        end_date = datetime.now()
        start_date = end_date - timedelta(days=5)
        prices = self.get_historical_prices(symbol, start_date, end_date)

        if not prices:
            return self._fallback_provider.get_latest_price(symbol)

        latest = prices[-1]
        prev = prices[-2] if len(prices) > 1 else latest
        change_24h = latest.close - prev.close
        change_pct = (change_24h / prev.close * 100.0) if prev.close else 0.0

        snapshot = MarketSnapshot(
            symbol=symbol.upper(),
            latest_price=latest.close,
            price_change_24h=round(change_24h, 2),
            price_change_pct_24h=round(change_pct, 2),
            volume_24h=latest.volume,
            last_updated=datetime.now(),
        )

        self._snapshot_cache[cache_key] = (datetime.now(), snapshot)
        return snapshot

    def get_fundamentals(self, symbol: str) -> FundamentalSnapshot:
        cache_key = symbol.upper()
        if cache_key in self._fundamental_cache:
            cached_time, cached_fund = self._fundamental_cache[cache_key]
            if self._is_cache_valid(cached_time):
                return cached_fund

        ticker_symbol = self._format_ticker(symbol)
        try:
            import yfinance as yf
            ticker = yf.Ticker(ticker_symbol)
            info = ticker.info or {}

            fund = FundamentalSnapshot(
                symbol=symbol.upper(),
                pe_ratio=info.get("trailingPE"),
                eps=info.get("trailingEps"),
                pb_ratio=info.get("priceToBook"),
                roe=info.get("returnOnEquity"),
                debt_to_equity=info.get("debtToEquity"),
                market_cap=info.get("marketCap"),
                revenue_growth=info.get("revenueGrowth"),
                profit_margin=info.get("profitMargins"),
            )

            self._fundamental_cache[cache_key] = (datetime.now(), fund)
            return fund
        except Exception as e:
            logger.warning(f"Failed to fetch yfinance fundamentals for {symbol} ({e}), using mock provider.")
            return self._fallback_provider.get_fundamentals(symbol)

    def get_market_index_data(
        self,
        symbol: str = "NIFTY50",
        days: int = 60
    ) -> list[HistoricalPrice]:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        return self.get_historical_prices(symbol, start_date, end_date)
