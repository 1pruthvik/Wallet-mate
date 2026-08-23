from typing import Optional

from parsing.transaction_model import Transaction
from ml.financial_report import generate_financial_report
from ml.investment.schemas import UserInvestmentProfile, RiskProfile
from ml.investment.risk_profile import evaluate_risk_profile


def build_user_investment_profile(
    transactions: list[Transaction],
    budgets: dict[str, float],
    risk_assessment: Optional[dict] = None
) -> UserInvestmentProfile:
    """
    Build a structured User Investment Profile reusing existing FinMitra financial calculations.
    """
    if not transactions:
        risk_prof = evaluate_risk_profile(risk_assessment)
        return UserInvestmentProfile(
            monthly_income=0.0,
            monthly_spending=0.0,
            savings_rate=0.0,
            financial_health_score=35,
            recurring_expenses=0.0,
            estimated_investable_surplus=0.0,
            risk_profile=risk_prof,
            investment_readiness="NOT_READY"
        )

    # Re-use existing FinMitra report generator
    report = generate_financial_report(transactions, budgets)
    summary = report.get("summary", {})
    health = report.get("financial_health", {})

    income = summary.get("total_income", 0.0)
    spending = summary.get("total_spending", 0.0)
    savings_rate = summary.get("savings_rate", 0.0)
    health_score = health.get("score", 0)

    # Recurring expenses from transactions
    recurring_expenses = sum(
        t.amount for t in transactions if t.recurring and t.transaction_type == "debit"
    )

    # Calculate investable surplus
    net_monthly_surplus = max(0.0, income - spending)
    estimated_investable_surplus = max(0.0, net_monthly_surplus - (recurring_expenses * 0.5))

    # Evaluate risk profile
    risk_prof = evaluate_risk_profile(
        assessment=risk_assessment,
        savings_rate=savings_rate,
        health_score=health_score
    )

    # Determine readiness
    if health_score >= 65 and savings_rate >= 15 and estimated_investable_surplus > 0:
        readiness = "READY"
    elif health_score >= 45 and savings_rate > 0:
        readiness = "CAUTION"
    else:
        readiness = "NOT_READY"

    return UserInvestmentProfile(
        monthly_income=round(income, 2),
        monthly_spending=round(spending, 2),
        savings_rate=round(savings_rate, 2),
        financial_health_score=int(health_score),
        recurring_expenses=round(recurring_expenses, 2),
        estimated_investable_surplus=round(estimated_investable_surplus, 2),
        risk_profile=risk_prof,
        investment_readiness=readiness
    )
