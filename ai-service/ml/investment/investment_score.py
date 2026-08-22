import numpy as np
from typing import Optional

from ml.investment.schemas import (
    PredictionResult,
    FundamentalSnapshot,
    NewsSignal,
    InvestmentScore,
    ScoreComponents,
)


def calculate_investment_score(
    prediction: PredictionResult,
    fundamentals: Optional[FundamentalSnapshot] = None,
    sentiment: Optional[NewsSignal] = None,
    technical_rsi: float = 50.0,
    technical_sma_ratio: float = 1.0,
) -> InvestmentScore:
    """
    Calculate transparent, multi-factor Investment Score (0 to 100).
    Components: Return Score (30%), Risk Score (20%), Technical Score (20%), Fundamental Score (20%), Sentiment Score (10%).
    """
    # 1. Return Score (0 to 100) based on 60-day predicted return
    predicted_ret = prediction.predicted_return
    return_score = np.clip((predicted_ret + 0.10) / 0.25 * 100.0, 0.0, 100.0)

    # 2. Risk Score component (100 - risk_score so lower risk = higher score)
    risk_score_component = float(100 - prediction.risk_score)

    # 3. Technical Score (RSI optimal 45-65, SMA momentum)
    rsi_score = 100.0 - abs(technical_rsi - 55.0) * 1.8
    sma_score = 50.0 + (technical_sma_ratio - 1.0) * 500.0
    technical_score = np.clip(0.6 * rsi_score + 0.4 * sma_score, 0.0, 100.0)

    # 4. Fundamental Score
    if fundamentals:
        pe = fundamentals.pe_ratio or 20.0
        roe = fundamentals.roe or 15.0
        debt = fundamentals.debt_to_equity or 0.3

        pe_score = np.clip(100.0 - (pe - 15.0) * 2.0, 20.0, 100.0)
        roe_score = np.clip(roe * 3.0, 0.0, 100.0)
        debt_score = np.clip(100.0 - (debt * 50.0), 10.0, 100.0)
        fundamental_score = 0.4 * pe_score + 0.4 * roe_score + 0.2 * debt_score
    else:
        fundamental_score = 55.0

    # 5. Sentiment Score
    if sentiment:
        sentiment_score = np.clip(50.0 + (sentiment.sentiment_score * 50.0), 0.0, 100.0)
    else:
        sentiment_score = 50.0

    # Weighted Overall Score
    overall_score = (
        0.30 * return_score
        + 0.20 * risk_score_component
        + 0.20 * technical_score
        + 0.20 * fundamental_score
        + 0.10 * sentiment_score
    )

    final_score = int(np.clip(round(overall_score), 0, 100))

    # Risk level classification
    if prediction.risk_score >= 65:
        risk_level = "HIGH"
    elif prediction.risk_score <= 40:
        risk_level = "LOW"
    else:
        risk_level = "MEDIUM"

    return InvestmentScore(
        symbol=prediction.symbol,
        investment_score=final_score,
        risk_level=risk_level,
        confidence=prediction.confidence,
        components=ScoreComponents(
            return_score=round(float(return_score), 1),
            risk_score=round(float(risk_score_component), 1),
            technical_score=round(float(technical_score), 1),
            fundamental_score=round(float(fundamental_score), 1),
            sentiment_score=round(float(sentiment_score), 1),
        ),
    )
