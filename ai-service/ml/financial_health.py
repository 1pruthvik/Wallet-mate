def calculate_financial_health_score(
    savings_rate: float,
    budget_results: dict[str, dict],
    recurring_count: int,
    total_transactions: int
) -> dict:
    """
    Calculate a transparent financial health score
    from 0 to 100.
    """

    # ------------------------------------------
    # 1. Savings score — 40 points
    # ------------------------------------------

    if savings_rate >= 30:
        savings_score = 40

    elif savings_rate >= 20:
        savings_score = 32

    elif savings_rate >= 10:
        savings_score = 24

    elif savings_rate > 0:
        savings_score = 15

    else:
        savings_score = 0

    # ------------------------------------------
    # 2. Budget score — 30 points
    # ------------------------------------------

    if budget_results:

        total_categories = len(
            budget_results
        )

        healthy_categories = sum(
            1
            for result in budget_results.values()
            if result["status"] == "WITHIN_BUDGET"
        )

        budget_score = (
            healthy_categories
            / total_categories
        ) * 30

    else:

        budget_score = 15

    # ------------------------------------------
    # 3. Recurring commitments — 20 points
    # ------------------------------------------

    if total_transactions == 0:

        recurring_score = 20

    else:

        recurring_ratio = (
            recurring_count
            / total_transactions
        )

        if recurring_ratio <= 0.20:
            recurring_score = 20

        elif recurring_ratio <= 0.40:
            recurring_score = 15

        elif recurring_ratio <= 0.60:
            recurring_score = 10

        else:
            recurring_score = 5

    # ------------------------------------------
    # 4. Spending balance — 10 points
    # ------------------------------------------

    if savings_rate >= 20:
        spending_score = 10

    elif savings_rate >= 10:
        spending_score = 7

    elif savings_rate > 0:
        spending_score = 4

    else:
        spending_score = 0

    # ------------------------------------------
    # Final score
    # ------------------------------------------

    total_score = round(
        savings_score
        + budget_score
        + recurring_score
        + spending_score
    )

    # ------------------------------------------
    # Health label
    # ------------------------------------------

    if total_score >= 80:
        status = "Excellent"

    elif total_score >= 65:
        status = "Good"

    elif total_score >= 50:
        status = "Fair"

    else:
        status = "Needs Attention"

    return {
        "score": total_score,
        "status": status,
        "components": {
            "savings": round(
                savings_score,
                2
            ),
            "budget": round(
                budget_score,
                2
            ),
            "recurring": round(
                recurring_score,
                2
            ),
            "spending": round(
                spending_score,
                2
            )
        }
    }