from collections import defaultdict

from parsing.transaction_model import Transaction


def calculate_category_spending(
    transactions: list[Transaction]
) -> dict[str, float]:
    """
    Calculate total debit spending for each category.
    """

    spending = defaultdict(float)

    for transaction in transactions:

        # Only count money going out
        if transaction.transaction_type != "debit":
            continue

        spending[transaction.category] += transaction.amount

    return {
        category: round(amount, 2)
        for category, amount in spending.items()
    }


def calculate_total_spending(
    transactions: list[Transaction]
) -> float:
    """
    Calculate total debit spending.
    """

    total = 0.0

    for transaction in transactions:

        if transaction.transaction_type != "debit":
            continue

        total += transaction.amount

    return round(total, 2)


def calculate_total_income(
    transactions: list[Transaction]
) -> float:
    """
    Calculate total credited income.
    """

    total = 0.0

    for transaction in transactions:

        if transaction.transaction_type != "credit":
            continue

        total += transaction.amount

    return round(total, 2)
    