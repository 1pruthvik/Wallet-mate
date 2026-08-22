from datetime import datetime

from parsing.transaction_model import Transaction
from ml.financial_report import generate_financial_report


def create_test_transactions():

    return [
        Transaction(
            transaction_id="TXN001",
            amount=50000,
            transaction_type="credit",
            merchant="EMPLOYER",
            category="Salary",
            date=datetime(2026, 8, 1),
            description="Monthly salary credited",
            recurring=False
        ),

        Transaction(
            transaction_id="TXN002",
            amount=799,
            transaction_type="debit",
            merchant="SWIGGY",
            category="Food",
            date=datetime(2026, 8, 22),
            description="Food order",
            recurring=False
        ),

        Transaction(
            transaction_id="TXN003",
            amount=1299,
            transaction_type="debit",
            merchant="AMAZON",
            category="Shopping",
            date=datetime(2026, 8, 20),
            description="Online shopping purchase",
            recurring=False
        )
    ]


def test_financial_report_summary():

    transactions = create_test_transactions()

    budgets = {
        "Food": 3000,
        "Shopping": 5000
    }

    report = generate_financial_report(
        transactions,
        budgets
    )

    assert report["summary"]["total_income"] == 50000
    assert report["summary"]["total_spending"] == 2098
    assert report["summary"]["balance"] == 47902


def test_financial_report_budget():

    transactions = create_test_transactions()

    budgets = {
        "Food": 3000,
        "Shopping": 5000
    }

    report = generate_financial_report(
        transactions,
        budgets
    )

    assert (
        report["budget_analysis"]["Food"]["status"]
        == "WITHIN_BUDGET"
    )

    assert (
        report["budget_analysis"]["Shopping"]["status"]
        == "WITHIN_BUDGET"
    )


def test_financial_report_insights():

    transactions = create_test_transactions()

    budgets = {
        "Food": 3000,
        "Shopping": 5000
    }

    report = generate_financial_report(
        transactions,
        budgets
    )

    assert len(report["insights"]) == 2

    assert any(
        "Food" in insight
        for insight in report["insights"]
    )


def test_financial_report_health():

    transactions = create_test_transactions()

    budgets = {
        "Food": 3000,
        "Shopping": 5000
    }

    report = generate_financial_report(
        transactions,
        budgets
    )

    health = report["financial_health"]

    assert health["score"] == 100
    assert health["status"] == "Excellent"