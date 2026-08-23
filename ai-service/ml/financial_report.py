from parsing.transaction_model import Transaction

from ml.monthly_summary import calculate_monthly_summary
from ml.budget_analyzer import analyze_budget
from ml.financial_insights import generate_budget_insights
from ml.financial_health import calculate_financial_health_score


def generate_financial_report(
    transactions: list[Transaction],
    budgets: dict[str, float]
) -> dict:
    """
    Generate a complete FinMitra financial report.
    """

    # ------------------------------------------
    # 1. Financial summary
    # ------------------------------------------

    summary = calculate_monthly_summary(
        transactions
    )

    # ------------------------------------------
    # 2. Budget analysis
    # ------------------------------------------

    budget_results = analyze_budget(
        summary["category_spending"],
        budgets
    )

    # ------------------------------------------
    # 3. Financial insights
    # ------------------------------------------

    insights = generate_budget_insights(
        budget_results
    )

    # ------------------------------------------
    # 4. Recurring transactions
    # ------------------------------------------

    recurring_count = sum(
        1
        for transaction in transactions
        if transaction.recurring
    )

    # ------------------------------------------
    # 5. Financial health
    # ------------------------------------------

    health = calculate_financial_health_score(
        savings_rate=summary["savings_rate"],
        budget_results=budget_results,
        recurring_count=recurring_count,
        total_transactions=len(transactions)
    )

    # ------------------------------------------
    # 6. Final report
    # ------------------------------------------

    return {
        "summary": summary,
        "budget_analysis": budget_results,
        "insights": insights,
        "financial_health": health
    }