from datetime import datetime

from parsing.transaction_model import Transaction
from ml.monthly_summary import (
    calculate_monthly_summary,
    filter_transactions_by_month,
    calculate_summary_for_month
)


def create_transactions():

    return [
        Transaction(
            transaction_id="JUL001",
            amount=5000,
            transaction_type="debit",
            merchant="AMAZON",
            category="Shopping",
            channel="UPI",
            date=datetime(2026, 7, 15)
        ),

        Transaction(
            transaction_id="AUG001",
            amount=799,
            transaction_type="debit",
            merchant="SWIGGY",
            category="Food",
            channel="UPI",
            date=datetime(2026, 8, 22)
        ),

        Transaction(
            transaction_id="AUG002",
            amount=1299,
            transaction_type="debit",
            merchant="AMAZON",
            category="Shopping",
            channel="UPI",
            date=datetime(2026, 8, 20)
        ),

        Transaction(
            transaction_id="AUG003",
            amount=50000,
            transaction_type="credit",
            merchant="EMPLOYER",
            category="Salary",
            channel="NEFT",
            date=datetime(2026, 8, 1)
        ),

        Transaction(
            transaction_id="SEP001",
            amount=3000,
            transaction_type="debit",
            merchant="ZOMATO",
            category="Food",
            channel="UPI",
            date=datetime(2026, 9, 5)
        )
    ]


def test_month_filter():

    transactions = create_transactions()

    august = filter_transactions_by_month(
        transactions,
        2026,
        8
    )

    assert len(august) == 3

    for transaction in august:
        assert transaction.date.year == 2026
        assert transaction.date.month == 8


def test_monthly_summary():

    transactions = create_transactions()

    summary = calculate_summary_for_month(
        transactions,
        2026,
        8
    )

    assert summary["total_income"] == 50000
    assert summary["total_spending"] == 2098
    assert summary["balance"] == 47902

    assert summary["category_spending"]["Food"] == 799
    assert summary["category_spending"]["Shopping"] == 1299

    assert summary["transaction_count"] == 3


def test_savings_rate():

    transactions = create_transactions()

    summary = calculate_summary_for_month(
        transactions,
        2026,
        8
    )

    assert summary["savings_rate"] == 95.8
    