from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from parsing.sms_parser import parse_sms
from parsing.transaction_model import Transaction
from ml.financial_report import generate_financial_report

# Existing Investment Intelligence Imports
from ml.investment.schemas import (
    PredictRequest,
    AnalyzeInvestmentRequest,
    PortfolioRequest,
    AIExplainRequest,
    AIChatRequest,
    AIChatResponse,
    PredictionResult,
    InvestmentCandidate,
    PortfolioAllocation,
    UserInvestmentProfile,
)
from ml.investment.market_data import MockMarketDataProvider
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.investment_score import calculate_investment_score
from ml.investment.user_profile import build_user_investment_profile
from ml.investment.personalization import evaluate_personalization
from ml.investment.portfolio import generate_portfolio_allocation
from ml.investment.sentiment import SentimentProvider
from ai.explanation_service import AIExplanationService

# RAG Intelligence Imports
from rag.models import (
    RAGQueryRequest,
    RAGQueryResult,
    IngestRequest,
    IngestResponse,
    RAGHealthResponse,
)
from rag.service import RAGService


# Global Service Singletons
market_provider = MockMarketDataProvider()
stock_predictor = StockMarketPredictor(provider=market_provider)
stock_predictor.train()
sentiment_provider = SentimentProvider()

rag_service = RAGService()
ai_service = AIExplanationService()


from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-ingest sample knowledge base documents on startup if store is empty
    if rag_service.vector_store.count() == 0:
        base_dir = Path(__file__).parent / "knowledge"
        if base_dir.exists():
            for filepath in base_dir.glob("**/*.*"):
                if filepath.suffix.lower() in [".md", ".txt", ".html", ".pdf"]:
                    parent_name = filepath.parent.name
                    if parent_name == "regulations":
                        stype = "regulatory"
                    elif parent_name == "companies":
                        stype = "company_filing"
                    else:
                        stype = "financial_education"

                    rag_service.ingest_file(
                        file_path=filepath,
                        source_type=stype,
                        topic=parent_name
                    )
    yield

app = FastAPI(
    title="FinMitra AI Service",
    description="Financial Intelligence, Investment Intelligence, RAG System, and AI services for FinMitra",
    version="0.3.0",
    lifespan=lifespan
)


# ==================================================
# EXISTING REQUEST MODELS (PRESERVED)
# ==================================================

class SMSRequest(BaseModel):
    sms: str


class AnalyzeRequest(BaseModel):
    transactions: list[Transaction]
    budgets: dict[str, float]


# ==================================================
# BASIC ENDPOINTS (PRESERVED)
# ==================================================

@app.get("/")
def root():
    return {
        "service": "FinMitra AI Service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ==================================================
# SMS PARSER (PRESERVED)
# ==================================================

@app.post("/parse/sms")
def parse_sms_endpoint(request: SMSRequest):
    """
    Parse a bank SMS into a standardized transaction.
    """
    transaction = parse_sms(request.sms)

    if transaction is None:
        return {
            "success": False,
            "message": "Unable to parse SMS"
        }

    return transaction.model_dump()


# ==================================================
# FINANCIAL ANALYSIS (PRESERVED)
# ==================================================

@app.post("/analyze")
def analyze_transactions(request: AnalyzeRequest):
    """
    Generate a complete FinMitra financial report.
    """
    report = generate_financial_report(
        request.transactions,
        request.budgets
    )

    return report


# ==================================================
# INVESTMENT INTELLIGENCE ENDPOINTS (PRESERVED)
# ==================================================

@app.post("/investment/predict", response_model=dict[str, list[PredictionResult]])
def predict_stocks(request: PredictRequest):
    """
    Predict risk-aware, probabilistic stock returns across specified symbols and horizon.
    """
    if not request.symbols:
        raise HTTPException(status_code=400, detail="Symbols list cannot be empty")

    results = []
    for symbol in request.symbols:
        try:
            pred = stock_predictor.predict(symbol, horizon_days=request.horizon_days)
            results.append(pred)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to predict symbol {symbol}: {str(e)}")

    return {"predictions": results}


@app.post("/investment/analyze")
def analyze_investments(request: AnalyzeInvestmentRequest):
    """
    Analyze investment candidates personalized against user's financial profile.
    """
    user_prof = build_user_investment_profile(
        transactions=request.transactions,
        budgets=request.budgets
    )

    candidates = []
    for symbol in request.symbols:
        pred = stock_predictor.predict(symbol)
        fund = market_provider.get_fundamentals(symbol)
        sentiment = sentiment_provider.get_sentiment(symbol)
        score = calculate_investment_score(prediction=pred, fundamentals=fund, sentiment=sentiment)
        pers = evaluate_personalization(user_profile=user_prof, investment_score=score, prediction=pred)

        candidates.append(
            InvestmentCandidate(
                symbol=symbol,
                prediction=pred,
                investment_score=score,
                personalization=pers
            )
        )

    investable = request.investable_amount or user_prof.estimated_investable_surplus
    portfolio = generate_portfolio_allocation(
        candidates=candidates,
        investable_amount=investable,
        user_profile=user_prof
    )

    return {
        "financial_profile": user_prof.model_dump(),
        "candidates": [c.model_dump() for c in candidates],
        "suggested_portfolio": portfolio.model_dump()
    }


@app.post("/investment/rank")
def rank_investments(request: AnalyzeInvestmentRequest):
    """
    Rank investment candidates by suitability and investment score.
    """
    analysis_res = analyze_investments(request)
    candidates = analysis_res["candidates"]
    sorted_candidates = sorted(
        candidates,
        key=lambda c: (c["personalization"]["suitability_score"], c["investment_score"]["investment_score"]),
        reverse=True
    )
    return {
        "ranked_candidates": sorted_candidates
    }


@app.post("/investment/portfolio", response_model=PortfolioAllocation)
def generate_portfolio_endpoint(request: PortfolioRequest):
    """
    Generate a hypothetical, risk-aware portfolio asset allocation.
    """
    user_prof = request.user_profile or UserInvestmentProfile()
    candidates = []

    for symbol in request.symbols:
        pred = stock_predictor.predict(symbol)
        fund = market_provider.get_fundamentals(symbol)
        sentiment = sentiment_provider.get_sentiment(symbol)
        score = calculate_investment_score(prediction=pred, fundamentals=fund, sentiment=sentiment)
        pers = evaluate_personalization(user_profile=user_prof, investment_score=score, prediction=pred)

        candidates.append(
            InvestmentCandidate(
                symbol=symbol,
                prediction=pred,
                investment_score=score,
                personalization=pers
            )
        )

    portfolio = generate_portfolio_allocation(
        candidates=candidates,
        investable_amount=request.investable_amount,
        user_profile=user_prof
    )
    return portfolio


# ==================================================
# NEW RAG ENDPOINTS
# ==================================================

@app.post("/rag/query", response_model=RAGQueryResult)
def rag_query_endpoint(request: RAGQueryRequest):
    """
    Execute semantic + keyword retrieval & reranking against RAG vector store.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty")

    return rag_service.query(request)


@app.post("/rag/ingest", response_model=IngestResponse)
def rag_ingest_endpoint(request: IngestRequest):
    """
    Ingest document text into RAG vector store with metadata & deduplication.
    """
    return rag_service.ingest_document_text(request)


@app.get("/rag/health", response_model=RAGHealthResponse)
def rag_health_endpoint():
    """
    Return operational health status & document counts for RAG vector store.
    """
    return rag_service.get_health()


# ==================================================
# RAG-INTEGRATED GENERATIVE AI ENDPOINTS
# ==================================================

@app.post("/ai/explain")
def ai_explain_endpoint(request: AIExplainRequest):
    """
    Generate natural-language investment explanations using RAG retrieval + Generative AI.
    """
    symbol = (request.market_prediction or {}).get("symbol")
    query_str = request.question or f"Investment analysis for {symbol or 'stock'}"

    # Perform RAG retrieval for relevant context
    rag_res = rag_service.query(RAGQueryRequest(query=query_str, symbol=symbol, top_k=3))

    explanation = ai_service.explain_investment_candidate(
        user_profile=request.user_profile,
        market_prediction=request.market_prediction,
        investment_score=request.investment_score,
        question=request.question,
        rag_chunks=rag_res.chunks
    )
    return explanation


@app.post("/ai/chat")
def ai_chat_endpoint(request: AIChatRequest):
    """
    Interactive RAG-grounded AI Financial Assistant & Money Mentor.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message string cannot be empty")

    # Perform RAG retrieval for message query
    rag_res = rag_service.query(RAGQueryRequest(query=request.message, top_k=3))

    res = ai_service.answer_financial_chat(
        message=request.message,
        financial_context=request.financial_context,
        rag_chunks=rag_res.chunks
    )

    return res