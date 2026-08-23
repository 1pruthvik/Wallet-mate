import math
import numpy as np
from typing import Optional

from ml.investment.schemas import (
    HistoricalPrice,
    FundamentalSnapshot,
)


def compute_sma(prices: list[float], window: int) -> float:
    if len(prices) < window:
        return prices[-1] if prices else 0.0
    return float(np.mean(prices[-window:]))


def compute_ema(prices: list[float], window: int) -> float:
    if not prices:
        return 0.0
    multiplier = 2.0 / (window + 1)
    ema = prices[0]
    for price in prices[1:]:
        ema = (price - ema) * multiplier + ema
    return float(ema)


def compute_rsi(prices: list[float], window: int = 14) -> float:
    if len(prices) <= window:
        return 50.0

    gains = []
    losses = []
    for i in range(1, len(prices)):
        change = prices[i] - prices[i - 1]
        if change >= 0:
            gains.append(change)
            losses.append(0.0)
        else:
            gains.append(0.0)
            losses.append(abs(change))

    if len(gains) < window:
        return 50.0

    avg_gain = float(np.mean(gains[-window:]))
    avg_loss = float(np.mean(losses[-window:]))

    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100.0 - (100.0 / (1.0 + rs)), 2)


def compute_log_return(prices: list[float]) -> float:
    if len(prices) < 2 or prices[-2] <= 0 or prices[-1] <= 0:
        return 0.0
    return float(np.log(prices[-1] / prices[-2]))


def compute_atr(historical_prices: list[HistoricalPrice], window: int = 14) -> float:
    """Compute Average True Range (ATR) over historical prices."""
    if len(historical_prices) < 2:
        return 0.0
    
    tr_list = []
    for i in range(1, len(historical_prices)):
        high = historical_prices[i].high
        low = historical_prices[i].low
        prev_close = historical_prices[i - 1].close
        
        tr = max(high - low, abs(high - prev_close), abs(low - prev_close))
        tr_list.append(tr)
        
    if not tr_list:
        return 0.0
    if len(tr_list) < window:
        return float(np.mean(tr_list))
    return float(np.mean(tr_list[-window:]))


def extract_market_features(
    historical_prices: list[HistoricalPrice],
    fundamentals: Optional[FundamentalSnapshot] = None,
    index_prices: Optional[list[HistoricalPrice]] = None,
    is_historical_training: bool = False,
) -> dict[str, float]:
    """
    Extract technical, price, market relative, and fundamental features from historical prices.
    Enforces point-in-time rules for historical training to eliminate look-ahead bias.
    """
    if not historical_prices or len(historical_prices) < 5:
        # Fallback default features
        return {
            "daily_return": 0.0,
            "weekly_return": 0.0,
            "monthly_return": 0.0,
            "volatility": 0.01,
            "sma_20_ratio": 1.0,
            "sma_50_ratio": 1.0,
            "rsi_14": 50.0,
            "macd": 0.0,
            "volume_change": 0.0,
            "relative_strength_vs_market": 0.0,
            "pe_ratio": fundamentals.pe_ratio if (fundamentals and fundamentals.pe_ratio and not is_historical_training) else 20.0,
            "roe": fundamentals.roe if (fundamentals and fundamentals.roe and not is_historical_training) else 15.0,
            "debt_to_equity": fundamentals.debt_to_equity if (fundamentals and fundamentals.debt_to_equity and not is_historical_training) else 0.3,
            "log_return": 0.0,
            "atr_14": 0.0,
            "relative_volume": 1.0,
            "ema_12_ratio": 1.0,
            "ema_26_ratio": 1.0,
            "momentum_10": 0.0,
            "bollinger_band_width": 0.05,
        }

    close_prices = [p.close for p in historical_prices]
    volumes = [p.volume for p in historical_prices]

    # Returns
    latest_close = close_prices[-1]
    prev_close = close_prices[-2] if len(close_prices) > 1 else latest_close
    daily_return = (latest_close - prev_close) / prev_close if prev_close else 0.0
    log_ret = compute_log_return(close_prices)

    week_idx = max(0, len(close_prices) - 6)
    weekly_return = (latest_close - close_prices[week_idx]) / close_prices[week_idx] if close_prices[week_idx] else 0.0

    month_idx = max(0, len(close_prices) - 22)
    monthly_return = (latest_close - close_prices[month_idx]) / close_prices[month_idx] if close_prices[month_idx] else 0.0

    # Volatility (std of returns)
    returns = np.diff(close_prices) / close_prices[:-1] if len(close_prices) > 1 else np.array([0.0])
    volatility = float(np.std(returns)) if len(returns) > 0 else 0.01

    # Moving Averages & EMAs
    sma_20 = compute_sma(close_prices, 20)
    sma_50 = compute_sma(close_prices, 50)
    sma_20_ratio = (latest_close / sma_20) if sma_20 else 1.0
    sma_50_ratio = (latest_close / sma_50) if sma_50 else 1.0

    ema_12 = compute_ema(close_prices, 12)
    ema_26 = compute_ema(close_prices, 26)
    ema_12_ratio = (latest_close / ema_12) if ema_12 else 1.0
    ema_26_ratio = (latest_close / ema_26) if ema_26 else 1.0

    # Bollinger Bands (20-day, 2 std dev)
    window_closes = close_prices[-20:] if len(close_prices) >= 20 else close_prices
    std_20 = float(np.std(window_closes)) if window_closes else 0.0
    bollinger_upper = sma_20 + (2.0 * std_20)
    bollinger_lower = sma_20 - (2.0 * std_20)
    bollinger_band_width = ((bollinger_upper - bollinger_lower) / sma_20) if sma_20 else 0.05

    # Momentum (10-day price difference ratio)
    mom_idx = max(0, len(close_prices) - 11)
    momentum_10 = (latest_close - close_prices[mom_idx]) / close_prices[mom_idx] if close_prices[mom_idx] else 0.0

    # Technical Indicators
    rsi_14 = compute_rsi(close_prices, 14)
    macd = ema_12 - ema_26
    atr_14 = compute_atr(historical_prices, 14)

    # Volume change & relative volume
    vol_prev = volumes[-2] if len(volumes) > 1 else volumes[-1]
    volume_change = (volumes[-1] - vol_prev) / vol_prev if vol_prev else 0.0
    vol_ma_20 = float(np.mean(volumes[-20:])) if len(volumes) >= 20 else float(np.mean(volumes))
    relative_volume = (volumes[-1] / vol_ma_20) if vol_ma_20 else 1.0

    # Relative strength vs market index
    relative_strength = 0.0
    if index_prices and len(index_prices) >= 5:
        idx_closes = [p.close for p in index_prices]
        idx_month_idx = max(0, len(idx_closes) - 22)
        idx_monthly_return = (idx_closes[-1] - idx_closes[idx_month_idx]) / idx_closes[idx_month_idx] if idx_closes[idx_month_idx] else 0.0
        relative_strength = monthly_return - idx_monthly_return

    # Fundamental values: strictly exclude current fundamentals during historical multi-year training to prevent look-ahead bias
    if is_historical_training:
        pe = 20.0
        roe = 15.0
        debt_equity = 0.3
    else:
        pe = fundamentals.pe_ratio if (fundamentals and fundamentals.pe_ratio is not None) else 20.0
        roe = fundamentals.roe if (fundamentals and fundamentals.roe is not None) else 15.0
        debt_equity = fundamentals.debt_to_equity if (fundamentals and fundamentals.debt_to_equity is not None) else 0.3

    return {
        "daily_return": round(float(daily_return), 4),
        "weekly_return": round(float(weekly_return), 4),
        "monthly_return": round(float(monthly_return), 4),
        "volatility": round(float(volatility), 4),
        "sma_20_ratio": round(float(sma_20_ratio), 4),
        "sma_50_ratio": round(float(sma_50_ratio), 4),
        "rsi_14": round(float(rsi_14), 2),
        "macd": round(float(macd), 4),
        "volume_change": round(float(volume_change), 4),
        "relative_strength_vs_market": round(float(relative_strength), 4),
        "pe_ratio": round(float(pe), 2),
        "roe": round(float(roe), 2),
        "debt_to_equity": round(float(debt_equity), 2),
        "log_return": round(float(log_ret), 4),
        "atr_14": round(float(atr_14), 2),
        "relative_volume": round(float(relative_volume), 4),
        "ema_12_ratio": round(float(ema_12_ratio), 4),
        "ema_26_ratio": round(float(ema_26_ratio), 4),
        "momentum_10": round(float(momentum_10), 4),
        "bollinger_band_width": round(float(bollinger_band_width), 4),
    }


def feature_dict_to_vector(features: dict[str, float]) -> np.ndarray:
    keys = [
        "daily_return", "weekly_return", "monthly_return", "volatility",
        "sma_20_ratio", "sma_50_ratio", "rsi_14", "macd", "volume_change",
        "relative_strength_vs_market", "pe_ratio", "roe", "debt_to_equity"
    ]
    return np.array([features.get(k, 0.0) for k in keys], dtype=np.float64)

