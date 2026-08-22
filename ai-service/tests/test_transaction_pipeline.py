from datetime import datetime

from parsing.transaction_model import Transaction
from ml.transaction_pipeline import TransactionPipeline


def test_pipeline_categorizes_transactions():

    transactions = [
        Transaction(
            transaction_id="TXN001",
            amount=799,
            transaction_type="debit",
            merchant="SWIGGY",
            category="Other",
            channel="UPI",
            date=datetime(2026, 8, 22),
            description="Food order"
        ),

        Transaction(
            transaction_id="TXN002",
            amount=1299,
            transaction_type="debit",
            merchant="AMAZON",
            category="Other",
            channel="UPI",
            date=datetime(2026, 8, 21),
            description="Online shopping purchase"
        )
    ]

    pipeline = TransactionPipeline()

    processed = pipeline.process_transactions(
        transactions
    )

    assert processed[0].category == "Food"
    assert processed[1].category == "Shopping"


def test_pipeline_adds_confidence():

    transactions = [
        Transaction(
            transaction_id="TXN001",
            amount=799,
            transaction_type="debit",
            merchant="SWIGGY",
            category="Other",
            channel="UPI",
            date=datetime(2026, 8, 22),
            description="Food order"
        )
    ]

    pipeline = TransactionPipeline()

    processed = pipeline.process_transactions(
        transactions
    )

    assert 0.0 <= processed[0].confidence <= 1.0