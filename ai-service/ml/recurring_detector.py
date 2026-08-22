from collections import defaultdict
from datetime import datetime
from statistics import mean

from parsing.transaction_model import Transaction


def detect_recurring_transactions(
    transactions: list[Transaction]
) -> list[dict]:
    """
    Detect transactions that appear repeatedly
    with similar merchants, categories, amounts,
    and time intervals.
    """

    # --------------------------------------------------
    # 1. Group transactions
    # --------------------------------------------------

    groups = defaultdict(list)

    for transaction in transactions:

        merchant = (
            transaction.merchant
            or transaction.category
            or "UNKNOWN"
        )

        key = (
            merchant.upper(),
            transaction.category
        )

        groups[key].append(transaction)

    recurring_transactions = []

    # --------------------------------------------------
    # 2. Analyze each group
    # --------------------------------------------------

    for key, group in groups.items():

        if len(group) < 3:
            continue

        # Sort by date
        group.sort(
            key=lambda transaction: transaction.date
        )

        # --------------------------------------------------
        # 3. Calculate date intervals
        # --------------------------------------------------

        intervals = []

        for i in range(1, len(group)):

            previous_date = group[i - 1].date
            current_date = group[i].date

            days = (
                current_date - previous_date
            ).days

            intervals.append(days)

        if not intervals:
            continue

        average_interval = mean(intervals)

        # --------------------------------------------------
        # 4. Detect frequency
        # --------------------------------------------------

        if 25 <= average_interval <= 35:

            frequency = "Monthly"

        elif 6 <= average_interval <= 8:

            frequency = "Weekly"

        elif 12 <= average_interval <= 16:

            frequency = "Biweekly"

        elif 85 <= average_interval <= 100:

            frequency = "Quarterly"

        else:

            continue

        # --------------------------------------------------
        # 5. Check amount consistency
        # --------------------------------------------------

        amounts = [
            transaction.amount
            for transaction in group
        ]

        average_amount = mean(amounts)

        amount_variation = max(
            amounts
        ) - min(
            amounts
        )

        # Allow small variations
        amount_consistent = (
            amount_variation
            <= average_amount * 0.10
        )

        if not amount_consistent:
            continue

        # --------------------------------------------------
        # 6. Mark transactions as recurring
        # --------------------------------------------------

        for transaction in group:

            transaction.recurring = True

        # --------------------------------------------------
        # 7. Calculate next expected date
        # --------------------------------------------------

        last_date = group[-1].date

        next_expected_date = (
            last_date
            + (group[-1].date - group[-2].date)
        )

        recurring_transactions.append({
            "merchant": key[0],
            "category": key[1],
            "frequency": frequency,
            "average_amount": round(
                average_amount,
                2
            ),
            "transaction_count": len(group),
            "average_interval_days": round(
                average_interval,
                2
            ),
            "next_expected_date": next_expected_date,
            "transactions": group
        })

    return recurring_transactions
    