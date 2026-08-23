from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

from ml.ml_classifier import TransactionMLClassifier
from ml.evaluation_data import EVALUATION_TRANSACTIONS


def evaluate_classifier():
    """
    Train the ML classifier and evaluate it
    using unseen evaluation transactions.
    """

    classifier = TransactionMLClassifier()

    # Train only on training data
    classifier.train()

    actual_categories = []
    predicted_categories = []

    for transaction in EVALUATION_TRANSACTIONS:

        prediction = classifier.predict(
            transaction["merchant"],
            transaction["description"]
        )

        actual_categories.append(
            transaction["category"]
        )

        predicted_categories.append(
            prediction
        )

    accuracy = accuracy_score(
        actual_categories,
        predicted_categories
    )

    precision = precision_score(
        actual_categories,
        predicted_categories,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        actual_categories,
        predicted_categories,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        actual_categories,
        predicted_categories,
        average="weighted",
        zero_division=0
    )

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1
    }