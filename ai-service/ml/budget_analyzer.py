from typing import Optional


def analyze_budget(
    spending: dict[str, float],
    budgets: dict[str, float]
) -> dict[str, dict]:
    """
    Compare actual category spending
    against user-defined budgets.
    """

    results = {}

    categories = set(spending) | set(budgets)

    for category in categories:

        spent = spending.get(
            category,
            0.0
        )

        budget = budgets.get(
            category,
            0.0
        )

        # No budget assigned
        if budget <= 0:

            results[category] = {
                "spent": round(spent, 2),
                "budget": 0.0,
                "remaining": 0.0,
                "usage_percent": None,
                "status": "NO_BUDGET"
            }

            continue

        usage_percent = (
            spent / budget
        ) * 100

        remaining = budget - spent

        if usage_percent > 100:

            status = "OVER_BUDGET"

        elif usage_percent >= 80:

            status = "NEAR_LIMIT"

        else:

            status = "WITHIN_BUDGET"

        results[category] = {
            "spent": round(spent, 2),
            "budget": round(budget, 2),
            "remaining": round(
                remaining,
                2
            ),
            "usage_percent": round(
                usage_percent,
                2
            ),
            "status": status
        }

    return results