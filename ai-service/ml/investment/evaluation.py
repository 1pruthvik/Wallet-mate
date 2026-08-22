import numpy as np
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, accuracy_score, f1_score

from ml.investment.models.predictor import StockMarketPredictor


def evaluate_stock_predictor(predictor: StockMarketPredictor) -> dict[str, float]:
    """
    Evaluate stock market predictor performance on time-ordered validation set.
    Calculates MAE, RMSE, Directional Accuracy, and F1 Score.
    """
    X, y_ret, y_dir = predictor._generate_synthetic_training_dataset(num_samples=200)

    # Time-ordered validation split (last 20% of chronological dataset)
    split_idx = int(len(X) * 0.8)
    X_test, y_ret_test, y_dir_test = X[split_idx:], y_ret[split_idx:], y_dir[split_idx:]

    if not predictor.trained:
        predictor.train()

    pred_returns = predictor.regressor.predict(X_test)
    pred_dirs = predictor.classifier.predict(X_test)

    mae = float(mean_absolute_error(y_ret_test, pred_returns))
    rmse = float(root_mean_squared_error(y_ret_test, pred_returns))
    acc = float(accuracy_score(y_dir_test, pred_dirs))
    f1 = float(f1_score(y_dir_test, pred_dirs, average="weighted", zero_division=0))

    return {
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "directional_accuracy": round(acc, 4),
        "f1_score": round(f1, 4),
    }
