import logging
from datetime import datetime
from typing import Optional

from ml.investment.schemas import HistoricalPrice

logger = logging.getLogger(__name__)


class InsufficientDataError(ValueError):
    """Raised when historical price series contains fewer rows than min_history_length."""
    pass


class InvalidMarketDataError(ValueError):
    """Raised when historical price data contains unrecoverable structural corruption."""
    pass


def validate_and_clean_historical_prices(
    prices: list[HistoricalPrice],
    min_history_length: int = 30
) -> list[HistoricalPrice]:
    """
    Data validation and cleaning pipeline for OHLCV time-series:
    1. Check non-empty input.
    2. Sort chronologically by date.
    3. Deduplicate timestamps (keep last recorded price for each timestamp).
    4. Validate OHLC price boundaries (ensure high >= low, open > 0, close > 0, high >= max(open, close), low <= min(open, close)).
    5. Handle zero/negative volume (replace with forward/average volume or floor value).
    6. Interpolate or fill missing zero/negative prices.
    7. Enforce min_history_length constraint (raises InsufficientDataError).
    """
    if not prices:
        raise InsufficientDataError(f"Market data series is empty. Minimum required: {min_history_length} records.")

    # Helper to convert any datetime to naive for comparison
    def to_naive(dt: datetime) -> datetime:
        return dt.replace(tzinfo=None) if hasattr(dt, "tzinfo") and dt.tzinfo is not None else dt

    # 1. Sort chronologically by date
    sorted_prices = sorted(prices, key=lambda p: to_naive(p.date))

    # 2. Deduplicate timestamps (keep last encountered entry for each timestamp date/second)
    unique_map: dict[datetime, HistoricalPrice] = {}
    for p in sorted_prices:
        unique_map[to_naive(p.date)] = p

    cleaned_prices: list[HistoricalPrice] = []
    
    # Calculate non-zero volume fallback
    valid_volumes = [p.volume for p in unique_map.values() if p.volume > 0]
    default_volume = sum(valid_volumes) / len(valid_volumes) if valid_volumes else 100000.0

    last_valid_close: Optional[float] = None

    for date, p in unique_map.items():
        # Validate or fix close price
        close = p.close if p.close > 0 else (last_valid_close or 1.0)
        open_price = p.open if p.open > 0 else close
        high = p.high if p.high > 0 else max(open_price, close)
        low = p.low if p.low > 0 else min(open_price, close)
        volume = p.volume if p.volume > 0 else default_volume

        # Enforce OHLC consistency
        high = max(high, open_price, close)
        low = min(low, open_price, close)

        last_valid_close = close

        cleaned_prices.append(
            HistoricalPrice(
                symbol=p.symbol,
                date=date,
                open=round(open_price, 2),
                high=round(high, 2),
                low=round(low, 2),
                close=round(close, 2),
                volume=round(volume, 2),
            )
        )

    if len(cleaned_prices) < min_history_length:
        raise InsufficientDataError(
            f"Historical price data for {prices[0].symbol if prices else 'asset'} contains "
            f"only {len(cleaned_prices)} valid entries, but minimum required is {min_history_length}."
        )

    return cleaned_prices


def validate_and_clean_dataset(prices: list[HistoricalPrice], min_observations: int = 30) -> tuple[list[HistoricalPrice], dict]:
    """Alias for validate_and_clean_historical_prices returning cleaned dataset and report."""
    cleaned = validate_and_clean_historical_prices(prices, min_history_length=min_observations)
    report = {
        "raw_count": len(prices),
        "cleaned_count": len(cleaned),
        "data_start": cleaned[0].date.strftime("%Y-%m-%d") if cleaned else None,
        "data_end": cleaned[-1].date.strftime("%Y-%m-%d") if cleaned else None,
    }
    return cleaned, report

