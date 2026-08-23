from typing import Optional

from ml.investment.schemas import (
    UserInvestmentProfile,
    InvestmentScore,
    PredictionResult,
    PersonalizationResult,
)


def evaluate_personalization(
    user_profile: UserInvestmentProfile,
    investment_score: InvestmentScore,
    prediction: PredictionResult
) -> PersonalizationResult:
    """
    Personalizes investment candidates by matching user profile capacity & risk profile with stock attributes.
    High stock score does NOT automatically mean HIGH suitability.
    """
    reasons = []
    base_suitability_score = investment_score.investment_score

    user_risk = user_profile.risk_profile.risk_level
    stock_risk = investment_score.risk_level

    # 1. Risk Profile Matching
    if user_risk == "conservative":
        if stock_risk == "HIGH":
            base_suitability_score -= 35
            reasons.append("risk_profile_mismatch_high_stock_risk")
        elif stock_risk == "MEDIUM":
            base_suitability_score -= 10
            reasons.append("conservative_with_medium_risk_caution")
        else:
            base_suitability_score += 10
            reasons.append("conservative_risk_match")
    elif user_risk == "moderate":
        if stock_risk == "HIGH":
            base_suitability_score -= 15
            reasons.append("moderate_risk_high_stock_caution")
        else:
            base_suitability_score += 5
            reasons.append("moderate_risk_match")
    elif user_risk == "aggressive":
        base_suitability_score += 10
        reasons.append("aggressive_growth_match")

    # 2. Financial Readiness & Surplus Check
    if user_profile.investment_readiness == "NOT_READY":
        base_suitability_score -= 40
        reasons.append("low_financial_readiness")
    elif user_profile.investment_readiness == "CAUTION":
        base_suitability_score -= 15
        reasons.append("cautionary_financial_readiness")
    else:
        reasons.append("sufficient_financial_capacity")

    if user_profile.estimated_investable_surplus <= 0:
        base_suitability_score -= 30
        reasons.append("zero_investable_surplus")

    # 3. Model Outlook & Direction
    if prediction.direction == "positive":
        reasons.append("positive_model_outlook")
    elif prediction.direction == "negative":
        base_suitability_score -= 20
        reasons.append("negative_model_outlook")

    final_suitability_score = max(0, min(100, int(base_suitability_score)))

    if final_suitability_score >= 75:
        suitability = "HIGH"
    elif final_suitability_score >= 55:
        suitability = "MODERATE"
    elif final_suitability_score >= 35:
        suitability = "LOW"
    else:
        suitability = "UNSUITABLE"

    return PersonalizationResult(
        symbol=prediction.symbol,
        suitability=suitability,
        suitability_score=final_suitability_score,
        reason_codes=reasons,
    )
