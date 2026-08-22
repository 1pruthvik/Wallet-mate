from parsing.transaction_model import Transaction

from ml.ml_classifier import TransactionMLClassifier
from ml.recurring_detector import detect_recurring_transactions


class TransactionPipeline:
    """
    Unified FinMitra transaction intelligence pipeline.

    Takes parsed Transaction objects and applies:
    1. ML categorization
    2. Confidence scoring
    3. Recurring transaction detection
    """

    def __init__(self):
        """
        Initialize and train the ML classifier.
        """

        self.classifier = TransactionMLClassifier()

        self.classifier.train()

    def process_transactions(
        self,
        transactions: list[Transaction]
    ) -> list[Transaction]:
        """
        Process all transactions through
        the FinMitra intelligence pipeline.
        """

        # ------------------------------------------
        # 1. ML categorization
        # ------------------------------------------

        for transaction in transactions:

            category, confidence = (
                self.classifier.predict_with_confidence(
                    transaction.merchant,
                    transaction.description
                )
            )

            transaction.category = category

            transaction.confidence = confidence

        # ------------------------------------------
        # 2. Recurring detection
        # ------------------------------------------

        detect_recurring_transactions(
            transactions
        )

        # ------------------------------------------
        # 3. Return processed transactions
        # ------------------------------------------

        return transactions