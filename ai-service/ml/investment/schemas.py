from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


# ==================================================
# 1. RISK & USER FINANCIAL PROFILE SCHEMAS
# ==================================================

class RiskProfile(BaseModel):
    risk_level: Literal["conservative", "moderate", "aggressive"] = "moderate"
    risk_score: int = Field(default=50, ge=0, le=100)
    reason: str = "Default moderate risk profile based on financial metrics"


class UserInvestmentProfile(BaseModel):
    monthly_income: float = 0.0
    monthly_spending: float = 0.0
    savings_rate: float = 0.0
    financial_health_score: int = 0
    recurring_expenses: float = 0.0
    estimated_investable_surplus: float = 0.0
    risk_profile: RiskProfile = Field(default_factory=RiskProfile)
    investment_readiness: Literal["READY", "CAUTION", "NOT_READY"] = "READY"


# ==================================================
# 2. MARKET DATA SCHEMAS
# ==================================================

class HistoricalPrice(BaseModel):
    symbol: str
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


class MarketSnapshot(BaseModel):
    symbol: str
    latest_price: float
    price_change_24h: float = 0.0
    price_change_pct_24h: float = 0.0
    volume_24h: float = 0.0
    last_updated: datetime = Field(default_factory=datetime.now)


class FundamentalSnapshot(BaseModel):
    symbol: str
    pe_ratio: Optional[float] = None
    eps: Optional[float] = None
    pb_ratio: Optional[float] = None
    roe: Optional[float] = None
    debt_to_equity: Optional[float] = None
    market_cap: Optional[float] = None
    revenue_growth: Optional[float] = None
    profit_margin: Optional[float] = None


class NewsSignal(BaseModel):
    symbol: str
    headline: str
    sentiment: Literal["positive", "neutral", "negative"] = "neutral"
    sentiment_score: float = Field(default=0.0, ge=-1.0, le=1.0)
    source: Optional[str] = None
    published_at: Optional[datetime] = None


# ==================================================
# 3. PREDICTION & SCORING SCHEMAS
# ==================================================

class ExpectedReturnRange(BaseModel):
    low: float
    high: float


class PredictionResult(BaseModel):
    symbol: str
    horizon_days: int = 60
    predicted_return: float
    expected_return_range: ExpectedReturnRange
    risk_score: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0.0, le=1.0)
    direction: Literal["positive", "neutral", "negative"]


class ScoreComponents(BaseModel):
    return_score: float
    risk_score: float
    technical_score: float
    fundamental_score: float
    sentiment_score: float


class InvestmentScore(BaseModel):
    symbol: str
    investment_score: int = Field(ge=0, le=100)
    risk_level: Literal["LOW", "MEDIUM", "HIGH"] = "MEDIUM"
    confidence: float = Field(ge=0.0, le=1.0)
    components: ScoreComponents


class PersonalizationResult(BaseModel):
    symbol: str
    suitability: Literal["HIGH", "MODERATE", "LOW", "UNSUITABLE"]
    suitability_score: int = Field(ge=0, le=100)
    reason_codes: list[str] = Field(default_factory=list)


class InvestmentCandidate(BaseModel):
    symbol: str
    prediction: PredictionResult
    investment_score: InvestmentScore
    personalization: PersonalizationResult


# ==================================================
# 4. PORTFOLIO & API SCHEMAS
# ==================================================

class AllocationItem(BaseModel):
    symbol: str
    percentage: float
    amount: float
    risk_level: str


class PortfolioAllocation(BaseModel):
    investable_amount: float
    cash_reserved: float
    cash_percentage: float
    allocation: list[AllocationItem]
    diversification_score: int = Field(ge=0, le=100)


class PredictRequest(BaseModel):
    symbols: list[str] = Field(default_factory=lambda: ["RELIANCE", "TCS", "INFY"])
    horizon_days: int = 60


class AnalyzeInvestmentRequest(BaseModel):
    symbols: list[str] = Field(default_factory=lambda: ["RELIANCE", "TCS", "INFY"])
    transactions: list = Field(default_factory=list)
    budgets: dict[str, float] = Field(default_factory=dict)
    investable_amount: Optional[float] = None


class PortfolioRequest(BaseModel):
    symbols: list[str] = Field(default_factory=lambda: ["RELIANCE", "TCS", "INFY"])
    investable_amount: float = 10000.0
    user_profile: Optional[UserInvestmentProfile] = None


class AIExplainRequest(BaseModel):
    user_profile: Optional[dict] = None
    market_prediction: Optional[dict] = None
    investment_score: Optional[dict] = None
    question: Optional[str] = None


class AIChatRequest(BaseModel):
    message: str
    financial_context: Optional[dict] = None


class AIChatResponse(BaseModel):
    answer: str
    disclaimer: str = (
        "FinMitra Investment Intelligence provides probabilistic research insights. "
        "It does not guarantee future financial returns or execute automatic trades."
    )
