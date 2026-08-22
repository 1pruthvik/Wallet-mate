def generate_budget_insights(
    budget_results: dict[str, dict]
) -> list[str]:
    """
    Generate human-readable financial insights
    from budget analysis results.
    """

    insights = []

    for category, result in budget_results.items():

        status = result["status"]

        spent = result["spent"]
        budget = result["budget"]
        remaining = result["remaining"]

        if status == "OVER_BUDGET":

            exceeded_by = abs(remaining)

            insights.append(
                f"You have exceeded your "
                f"{category} budget by "
                f"₹{exceeded_by:.2f}."
            )

        elif status == "NEAR_LIMIT":

            insights.append(
                f"Your {category} spending is "
                f"at {result['usage_percent']:.0f}% "
                f"of your budget. "
                f"₹{remaining:.2f} remains."
            )

        elif status == "WITHIN_BUDGET":

            insights.append(
                f"Your {category} spending is "
                f"within budget with "
                f"₹{remaining:.2f} remaining."
            )

        elif status == "NO_BUDGET":

            insights.append(
                f"You have no budget set "
                f"for {category}. "
                f"Current spending is "
                f"₹{spent:.2f}."
            )

    return insights