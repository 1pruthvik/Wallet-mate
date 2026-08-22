from datetime import datetime
from fastapi.testclient import TestClient

from main import app
from parsing.transaction_model import Transaction
from ml.investment.schemas import (
    UserInvestmentProfile,
    RiskProfile,
    PredictionResult,
    InvestmentScore,
    ScoreComponents,
    InvestmentCandidate,
)
from ml.investment.user_profile import build_user_investment_profile
from ml.investment.risk_profile import evaluate_risk_profile
from ml.investment.market_data import MockMarketDataProvider
from ml.investment.features import extract_market_features
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.evaluation import evaluate_stock_predictor
from ml.investment.investment_score import calculate_investment_score
from ml.investment.personalization import evaluate_personalization
from ml.investment.portfolio import generate_portfolio_allocation
from ml.investment.sentiment import SentimentProvider
from ai.mock_provider import MockAIProvider
from ai.explanation_service import AIExplanationService

client = TestClient(app)


# ==================================================
# 1. USER PROFILE & RISK ENGINE TESTS
# ==================================================

def test_user_investment_profile():
    transactions = [
        Transaction(
            transaction_id="T001",
            amount=50000,
            transaction_type="credit",
            merchant="EMPLOYER",
            category="Salary",
            date=datetime(2026, 8, 1)
        ),
        Transaction(
            transaction_id="T002",
            amount=5000,
            transaction_type="debit",
            merchant="SWIGGY",
            category="Food",
            date=datetime(2026, 8, 10)
        )
    ]
    budgets = {"Food": 10000}
    profile = build_user_investment_profile(transactions, budgets)

    assert profile.monthly_income == 50000
    assert profile.monthly_spending == 5000
    assert profile.estimated_investable_surplus == 45000
    assert profile.investment_readiness == "READY"


def test_risk_profile_evaluation():
    risk = evaluate_risk_profile(
        assessment={"declared_risk_tolerance": "conservative", "investment_horizon_years": 2},
        savings_rate=10.0,
        health_score=50.0
    )
    assert risk.risk_level == "conservative"
    assert risk.risk_score <= 40


# ==================================================
# 2. MARKET DATA & FEATURE ENGINEERING TESTS
# ==================================================

def test_mock_market_data_provider():
    provider = MockMarketDataProvider()
    prices = provider.get_historical_prices("RELIANCE", datetime(2026, 1, 1), datetime(2026, 1, 10))
    snapshot = provider.get_latest_price("RELIANCE")
    fundamentals = provider.get_fundamentals("RELIANCE")

    assert len(prices) == 10
    assert snapshot.latest_price > 0
    assert fundamentals.pe_ratio is not None


def test_feature_extraction():
    provider = MockMarketDataProvider()
    prices = provider.get_historical_prices("TCS", datetime(2026, 1, 1), datetime(2026, 3, 1))
    fundamentals = provider.get_fundamentals("TCS")

    features = extract_market_features(prices, fundamentals)
    assert "daily_return" in features
    assert "rsi_14" in features
    assert "sma_20_ratio" in features


# ==================================================
# 3. PREDICTOR & EVALUATOR TESTS
# ==================================================

def test_stock_market_predictor():
    provider = MockMarketDataProvider()
    predictor = StockMarketPredictor(provider=provider)
    predictor.train()

    pred = predictor.predict("INFY", horizon_days=60)
    assert pred.symbol == "INFY"
    assert pred.horizon_days == 60
    assert 0.0 <= pred.confidence <= 1.0
    assert pred.expected_return_range.low <= pred.expected_return_range.high


def test_evaluator():
    predictor = StockMarketPredictor()
    predictor.train()

    metrics = evaluate_stock_predictor(predictor)
    assert "mae" in metrics
    assert "directional_accuracy" in metrics
    assert metrics["directional_accuracy"] >= 0.0


# ==================================================
# 4. SCORING, PERSONALIZATION & PORTFOLIO TESTS
# ==================================================

def test_investment_scoring():
    pred = PredictionResult(
        symbol="RELIANCE",
        horizon_days=60,
        predicted_return=0.08,
        expected_return_range={"low": 0.04, "high": 0.12},
        risk_score=45,
        confidence=0.82,
        direction="positive"
    )
    score = calculate_investment_score(prediction=pred)
    assert score.symbol == "RELIANCE"
    assert 0 <= score.investment_score <= 100
    assert score.risk_level in ["LOW", "MEDIUM", "HIGH"]


def test_personalization():
    user_prof = UserInvestmentProfile(
        monthly_income=50000,
        monthly_spending=10000,
        savings_rate=80.0,
        financial_health_score=90,
        estimated_investable_surplus=40000,
        risk_profile=RiskProfile(risk_level="moderate", risk_score=50),
        investment_readiness="READY"
    )
    pred = PredictionResult(
        symbol="TCS",
        horizon_days=60,
        predicted_return=0.07,
        expected_return_range={"low": 0.03, "high": 0.11},
        risk_score=35,
        confidence=0.85,
        direction="positive"
    )
    score = calculate_investment_score(prediction=pred)
    pers = evaluate_personalization(user_prof, score, pred)

    assert pers.symbol == "TCS"
    assert pers.suitability in ["HIGH", "MODERATE", "LOW", "UNSUITABLE"]


def test_portfolio_allocation():
    user_prof = UserInvestmentProfile(estimated_investable_surplus=10000.0)
    pred = PredictionResult(
        symbol="TCS",
        horizon_days=60,
        predicted_return=0.07,
        expected_return_range={"low": 0.03, "high": 0.11},
        risk_score=35,
        confidence=0.85,
        direction="positive"
    )
    score = calculate_investment_score(prediction=pred)
    pers = evaluate_personalization(user_prof, score, pred)

    candidate = InvestmentCandidate(
        symbol="TCS",
        prediction=pred,
        investment_score=score,
        personalization=pers
    )
    portfolio = generate_portfolio_allocation([candidate], investable_amount=10000.0)

    assert portfolio.investable_amount == 10000.0
    assert portfolio.cash_reserved > 0
    assert len(portfolio.allocation) == 1


# ==================================================
# 5. SENTIMENT & AI SERVICE TESTS
# ==================================================

def test_sentiment_provider():
    provider = SentimentProvider()
    signal = provider.get_sentiment("RELIANCE")
    assert signal.symbol == "RELIANCE"
    assert signal.sentiment in ["positive", "neutral", "negative"]


def test_ai_explanation_service():
    mock_ai = MockAIProvider()
    service = AIExplanationService(provider=mock_ai)

    explanation = service.explain_investment_candidate(
        market_prediction={"symbol": "INFY"},
        investment_score={"investment_score": 82}
    )
    assert "summary" in explanation
    assert "why_it_matters" in explanation

    chat_reply = service.answer_financial_chat("How is my budget?")
    assert len(chat_reply) > 0


# ==================================================
# 6. API ENDPOINT TESTS
# ==================================================

def test_api_predict_endpoint():
    res = client.post("/investment/predict", json={"symbols": ["RELIANCE", "TCS"], "horizon_days": 60})
    assert res.status_code == 200
    data = res.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 2


def test_api_analyze_endpoint():
    res = client.post("/investment/analyze", json={"symbols": ["RELIANCE"], "transactions": [], "budgets": {}})
    assert res.status_code == 200
    data = res.json()
    assert "financial_profile" in data
    assert "candidates" in data


def test_api_rank_endpoint():
    res = client.post("/investment/rank", json={"symbols": ["RELIANCE", "TCS"], "transactions": [], "budgets": {}})
    assert res.status_code == 200
    data = res.json()
    assert "ranked_candidates" in data


def test_api_portfolio_endpoint():
    res = client.post("/investment/portfolio", json={"symbols": ["RELIANCE"], "investable_amount": 5000.0})
    assert res.status_code == 200
    data = res.json()
    assert data["investable_amount"] == 5000.0


def test_api_ai_explain_endpoint():
    res = client.post("/ai/explain", json={"market_prediction": {"symbol": "TCS"}, "investment_score": {"investment_score": 75}})
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data


def test_api_ai_chat_endpoint():
    res = client.post("/ai/chat", json={"message": "What is my investment readiness?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "disclaimer" in data
