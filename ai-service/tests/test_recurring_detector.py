from datetime import datetime

from parsing.transaction_model import Transaction
from ml.recurring_detector import detect_recurring_transactions


def test_monthly_recurring_transaction():

    transactions = [
        Transaction(
            transaction_id="EMI001",
            amount=8000,
            transaction_type="debit",
            merchant="HDFC BANK",
            category="EMI",
            channel="NACH",
            date=datetime(2026, 6, 1),
            description="Monthly home loan EMI"
        ),
        Transaction(
            transaction_id="EMI002",
            amount=8000,
            transaction_type="debit",
            merchant="HDFC BANK",
            category="EMI",
            channel="NACH",
            date=datetime(2026, 7, 1),
            description="Monthly home loan EMI"
        ),
        Transaction(
            transaction_id="EMI003",
            amount=8000,
            transaction_type="debit",
            merchant="HDFC BANK",
            category="EMI",
            channel="NACH",
            date=datetime(2026, 8, 1),
            description="Monthly home loan EMI"
        )
    ]

    recurring = detect_recurring_transactions(
        transactions
    )

    assert len(recurring) == 1
    assert recurring[0]["frequency"] == "Monthly"
    assert recurring[0]["average_amount"] == 8000
    assert recurring[0]["transaction_count"] == 3

    for transaction in transactions:
        assert transaction.recurring is True


def test_non_recurring_transactions():

    transactions = [
        Transaction(
            transaction_id="TXN001",
            amount=1200,
            transaction_type="debit",
            merchant="AMAZON",
            category="Shopping",
            channel="UPI",
            date=datetime(2026, 6, 5),
            description="Amazon purchase"
        ),
        Transaction(
            transaction_id="TXN002",
            amount=799,
            transaction_type="debit",
            merchant="SWIGGY",
            category="Food",
            channel="UPI",
            date=datetime(2026, 6, 19),
            description="Food order"
        ),
        Transaction(
            transaction_id="TXN003",
            amount=450,
            transaction_type="debit",
            merchant="UBER",
            category="Travel",
            channel="UPI",
            date=datetime(2026, 7, 7),
            description="Cab ride"
        )
    ]

    recurring = detect_recurring_transactions(
        transactions
    )

    assert len(recurring) == 0

    for transaction in transactions:
        assert transaction.recurring is False