from typing import Optional
from ml.investment.schemas import RiskProfile


def evaluate_risk_profile(
    assessment: Optional[dict] = None,
    savings_rate: float = 0.0,
    health_score: float = 0.0
) -> RiskProfile:
    """
    Evaluate user risk profile based on explicit questionnaire inputs or financial capacity metrics.
    Does not infer risk tolerance solely from income.
    """
    base_score = 50
    reasons = []

    if assessment:
        declared_level = assessment.get("declared_risk_tolerance", "").lower()
        if declared_level == "conservative":
            base_score = 30
            reasons.append("User declared conservative risk preference")
        elif declared_level == "aggressive":
            base_score = 80
            reasons.append("User declared aggressive growth preference")
        elif declared_level == "moderate":
            base_score = 50
            reasons.append("User declared moderate risk preference")

        horizon_years = assessment.get("investment_horizon_years", 5)
        if horizon_years > 10:
            base_score += 10
            reasons.append("Long-term investment horizon (>10 years)")
        elif horizon_years < 3:
            base_score -= 15
            reasons.append("Short-term investment horizon (<3 years)")

    if savings_rate > 30:
        base_score += 10
        reasons.append("Strong savings rate (>30%) boosts risk absorption capacity")
    elif savings_rate < 10:
        base_score -= 15
        reasons.append("Low savings rate (<10%) reduces risk absorption capacity")

    if health_score >= 80:
        base_score += 5
        reasons.append("Excellent financial health score")
    elif health_score < 50:
        base_score -= 15
        reasons.append("Financial health score requires attention")

    # Clamp score to [0, 100]
    final_score = max(0, min(100, base_score))

    if final_score >= 70:
        risk_level = "aggressive"
    elif final_score <= 35:
        risk_level = "conservative"
    else:
        risk_level = "moderate"

    reason_str = "; ".join(reasons) if reasons else "Standard moderate risk capacity"

    return RiskProfile(
        risk_level=risk_level,
        risk_score=final_score,
        reason=reason_str
    )
