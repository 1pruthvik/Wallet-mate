from parsing.transaction_model import Transaction

from ml.spending_aggregator import (
    calculate_category_spending,
    calculate_total_spending,
    calculate_total_income
)


def calculate_monthly_summary(
    transactions: list[Transaction]
) -> dict:
    """
    Generate a financial summary from transactions.
    """

    total_income = calculate_total_income(
        transactions
    )

    total_spending = calculate_total_spending(
        transactions
    )

    balance = total_income - total_spending

    if total_income > 0:
        savings_rate = (
            balance / total_income
        ) * 100
    else:
        savings_rate = 0.0

    category_spending = calculate_category_spending(
        transactions
    )

    return {
        "total_income": round(
            total_income,
            2
        ),
        "total_spending": round(
            total_spending,
            2
        ),
        "balance": round(
            balance,
            2
        ),
        "savings_rate": round(
            savings_rate,
            2
        ),
        "category_spending": category_spending
    }
def filter_transactions_by_month(
    transactions: list[Transaction],
    year: int,
    month: int
) -> list[Transaction]:
    """
    Return only transactions belonging
    to the specified year and month.
    """

    return [
        transaction
        for transaction in transactions
        if (
            transaction.date.year == year
            and transaction.date.month == month
        )
    ]   
def calculate_summary_for_month(
    transactions: list[Transaction],
    year: int,
    month: int
) -> dict:
    """
    Generate a financial summary for
    one specific month.
    """

    monthly_transactions = filter_transactions_by_month(
        transactions,
        year,
        month
    )

    summary = calculate_monthly_summary(
        monthly_transactions
    )

    summary["year"] = year
    summary["month"] = month
    summary["transaction_count"] = len(
        monthly_transactions
    )

    return summary    