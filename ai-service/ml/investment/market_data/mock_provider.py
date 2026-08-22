import math
from datetime import datetime, timedelta
from typing import Optional

from ml.investment.schemas import (
    HistoricalPrice,
    MarketSnapshot,
    FundamentalSnapshot,
)
from ml.investment.market_data.base import MarketDataProvider


class MockMarketDataProvider(MarketDataProvider):
    """
    Deterministic Mock Market Data Provider for offline unit testing and development.
    Requires no internet connection.
    """

    DEFAULT_BASE_PRICES = {
        "RELIANCE": 2500.0,
        "TCS": 3800.0,
        "INFY": 1600.0,
        "HDFCBANK": 1550.0,
        "ICICIBANK": 1050.0,
        "NIFTY50": 22000.0,
    }

    DEFAULT_FUNDAMENTALS = {
        "RELIANCE": FundamentalSnapshot(
            symbol="RELIANCE",
            pe_ratio=24.5,
            eps=102.0,
            pb_ratio=2.3,
            roe=11.2,
            debt_to_equity=0.42,
            market_cap=17000000.0,
            revenue_growth=0.085,
            profit_margin=0.092,
        ),
        "TCS": FundamentalSnapshot(
            symbol="TCS",
            pe_ratio=29.1,
            eps=130.5,
            pb_ratio=11.8,
            roe=44.2,
            debt_to_equity=0.08,
            market_cap=13800000.0,
            revenue_growth=0.072,
            profit_margin=0.185,
        ),
        "INFY": FundamentalSnapshot(
            symbol="INFY",
            pe_ratio=22.8,
            eps=70.2,
            pb_ratio=7.1,
            roe=31.5,
            debt_to_equity=0.09,
            market_cap=6600000.0,
            revenue_growth=0.065,
            profit_margin=0.162,
        ),
    }

    def __init__(self, seed_offset: int = 0):
        self.seed_offset = seed_offset

    def get_historical_prices(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime,
        interval: str = "1d"
    ) -> list[HistoricalPrice]:
        clean_symbol = symbol.upper().strip()
        base_price = self.DEFAULT_BASE_PRICES.get(clean_symbol, 1000.0)

        prices = []
        current_date = start_date
        day_index = 0

        while current_date <= end_date:
            # Generate pseudo-deterministic sin wave + trend
            trend = 1.0 + (0.0003 * day_index)
            cycle = 0.05 * math.sin((day_index + self.seed_offset) * 0.1)
            noise = 0.01 * math.cos(day_index * 0.3)

            close_price = base_price * trend * (1.0 + cycle + noise)
            open_price = close_price * (1.0 - 0.002 * math.sin(day_index))
            high_price = max(open_price, close_price) * 1.01
            low_price = min(open_price, close_price) * 0.99
            volume = 1000000.0 + (500000.0 * math.sin(day_index))

            prices.append(
                HistoricalPrice(
                    symbol=clean_symbol,
                    date=current_date,
                    open=round(open_price, 2),
                    high=round(high_price, 2),
                    low=round(low_price, 2),
                    close=round(close_price, 2),
                    volume=round(volume, 2),
                )
            )

            current_date += timedelta(days=1)
            day_index += 1

        return prices

    def get_latest_price(self, symbol: str) -> MarketSnapshot:
        clean_symbol = symbol.upper().strip()
        base_price = self.DEFAULT_BASE_PRICES.get(clean_symbol, 1000.0)
        return MarketSnapshot(
            symbol=clean_symbol,
            latest_price=base_price,
            price_change_24h=15.5,
            price_change_pct_24h=0.62,
            volume_24h=1250000.0,
            last_updated=datetime.now(),
        )

    def get_fundamentals(self, symbol: str) -> FundamentalSnapshot:
        clean_symbol = symbol.upper().strip()
        if clean_symbol in self.DEFAULT_FUNDAMENTALS:
            return self.DEFAULT_FUNDAMENTALS[clean_symbol]

        return FundamentalSnapshot(
            symbol=clean_symbol,
            pe_ratio=20.0,
            eps=50.0,
            pb_ratio=3.0,
            roe=15.0,
            debt_to_equity=0.20,
            market_cap=5000000.0,
            revenue_growth=0.05,
            profit_margin=0.10,
        )

    def get_market_index_data(
        self,
        symbol: str = "NIFTY50",
        days: int = 60
    ) -> list[HistoricalPrice]:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        return self.get_historical_prices(symbol, start_date, end_date)
