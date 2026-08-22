from datetime import datetime
from typing import Optional, Tuple
import numpy as np

from ml.investment.schemas import HistoricalPrice, FundamentalSnapshot
from ml.investment.features import extract_market_features, feature_dict_to_vector
from ml.investment.market_data.validation import validate_and_clean_historical_prices


class TimeSeriesDataset:
    """
    Chronological Time-Series Dataset generator.
    Strictly preserves temporal ordering (Train -> Validation -> Test).
    Eliminates future-data lookahead bias and random shuffling leakage.
    """

    def __init__(
        self,
        historical_prices: list[HistoricalPrice],
        horizon_days: int = 20,
        lookback_days: int = 30,
        fundamentals: Optional[FundamentalSnapshot] = None
    ):
        self.prices = validate_and_clean_historical_prices(historical_prices, min_history_length=lookback_days + horizon_days + 5)
        self.horizon_days = horizon_days
        self.lookback_days = lookback_days
        self.fundamentals = fundamentals

        self.dates: list[datetime] = []
        self.X: list[np.ndarray] = []
        self.y_return: list[float] = []
        self.y_direction: list[str] = []

        self._build_dataset()

    def _build_dataset(self):
        """Build feature vectors X and targets y using rolling lookback windows."""
        total_len = len(self.prices)
        
        for i in range(self.lookback_days, total_len - self.horizon_days):
            window = self.prices[i - self.lookback_days:i]
            target_price = self.prices[i + self.horizon_days].close
            current_price = window[-1].close

            # Target N-day return
            future_return = (target_price - current_price) / current_price if current_price else 0.0

            if future_return > 0.02:
                direction = "positive"
            elif future_return < -0.02:
                direction = "negative"
            else:
                direction = "neutral"

            feat_dict = extract_market_features(
                historical_prices=window,
                fundamentals=self.fundamentals
            )
            vec = feature_dict_to_vector(feat_dict)

            self.dates.append(window[-1].date)
            self.X.append(vec)
            self.y_return.append(future_return)
            self.y_direction.append(direction)

    def split_chronological(
        self,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15
    ) -> Tuple[
        Tuple[np.ndarray, np.ndarray, np.ndarray],
        Tuple[np.ndarray, np.ndarray, np.ndarray],
        Tuple[np.ndarray, np.ndarray, np.ndarray]
    ]:
        """
        Split dataset chronologically into (Train, Val, Test).
        No random shuffling.
        Returns ((X_train, y_ret_train, y_dir_train), (X_val, ...), (X_test, ...)).
        """
        n_samples = len(self.X)
        if n_samples == 0:
            empty_arr = np.array([])
            empty_2d = np.empty((0, 13))
            return (
                (empty_2d, empty_arr, empty_arr),
                (empty_2d, empty_arr, empty_arr),
                (empty_2d, empty_arr, empty_arr)
            )

        train_end = int(n_samples * train_ratio)
        val_end = int(n_samples * (train_ratio + val_ratio))

        X_arr = np.array(self.X)
        y_ret_arr = np.array(self.y_return)
        y_dir_arr = np.array(self.y_direction)

        X_train, y_ret_train, y_dir_train = X_arr[:train_end], y_ret_arr[:train_end], y_dir_arr[:train_end]
        X_val, y_ret_val, y_dir_val = X_arr[train_end:val_end], y_ret_arr[train_end:val_end], y_dir_arr[train_end:val_end]
        X_test, y_ret_test, y_dir_test = X_arr[val_end:], y_ret_arr[val_end:], y_dir_arr[val_end:]

        return (
            (X_train, y_ret_train, y_dir_train),
            (X_val, y_ret_val, y_dir_val),
            (X_test, y_ret_test, y_dir_test)
        )
