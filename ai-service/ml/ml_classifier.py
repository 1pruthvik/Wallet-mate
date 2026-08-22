from sklearn.linear_model import LogisticRegression

from ml.feature_extractor import TransactionFeatureExtractor
from ml.training_data import TRAINING_TRANSACTIONS


class TransactionMLClassifier:
    """
    Machine-learning based transaction categorizer.
    """

    def __init__(self):
        self.feature_extractor = TransactionFeatureExtractor()

        self.model = LogisticRegression(
            max_iter=1000
        )

        self.trained = False

    def train(self):
        """
        Train the classifier using the
        prepared transaction dataset.
        """

        merchants = [
            transaction["merchant"]
            for transaction in TRAINING_TRANSACTIONS
        ]

        descriptions = [
            transaction["description"]
            for transaction in TRAINING_TRANSACTIONS
        ]

        categories = [
            transaction["category"]
            for transaction in TRAINING_TRANSACTIONS
        ]

        features = self.feature_extractor.fit_transform(
            merchants,
            descriptions
        )

        self.model.fit(
            features,
            categories
        )

        self.trained = True

    def predict(
        self,
        merchant: str | None,
        description: str | None = None
    ) -> str:
        """
        Predict the category of a transaction.
        """

        if not self.trained:
            raise RuntimeError(
                "Model has not been trained yet."
            )

        features = self.feature_extractor.transform(
            [merchant],
            [description]
        )

        prediction = self.model.predict(
            features
        )

        return prediction[0]

    def predict_with_confidence(
        self,
        merchant: str | None,
        description: str | None = None
    ) -> tuple[str, float]:
        """
        Predict the category and return
        the model's confidence.
        """

        if not self.trained:
            raise RuntimeError(
                "Model has not been trained yet."
            )

        features = self.feature_extractor.transform(
            [merchant],
            [description]
        )

        probabilities = self.model.predict_proba(
            features
        )[0]

        best_index = probabilities.argmax()

        category = self.model.classes_[best_index]

        confidence = float(
            probabilities[best_index]
        )

        return category, confidence

    def predict_with_status(
        self,
        merchant: str | None,
        description: str | None = None,
        threshold: float = 0.50
    ) -> tuple[str, float, str]:
        """
        Predict category, confidence, and
        confidence status.
        """

        category, confidence = self.predict_with_confidence(
            merchant,
            description
        )

        if confidence >= threshold:
            status = "high_confidence"
        else:
            status = "low_confidence"

        return category, confidence, status