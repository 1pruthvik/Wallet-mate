import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Any, Dict, List

from dotenv import load_dotenv

load_dotenv()

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
    HistoricalPrice,
    MarketQuote,
    MarketStatusResponse,
    ModelStatusResponse,
    LivePredictRequest,
    LivePredictResponse,
)
from ml.investment.market_data import MockMarketDataProvider, YFinanceMarketDataProvider, MarketDataService
from ml.investment.models.predictor import StockMarketPredictor
from ml.investment.models.foundation_predictor import FinancialFoundationPredictor
from ml.investment.models.ensemble_predictor import EnsembleStockPredictor
from ml.investment.model_registry import ModelRegistry
from ml.investment.investment_score import calculate_investment_score
from ml.investment.user_profile import build_user_investment_profile
from ml.investment.personalization import evaluate_personalization
from ml.investment.portfolio import generate_portfolio_allocation
from ml.investment.sentiment import SentimentProvider
from ai.explanation_service import AIExplanationService
from fastapi.responses import FileResponse

# RAG Intelligence Imports
from rag.models import (
    RAGQueryRequest,
    RAGQueryResult,
    IngestRequest,
    IngestResponse,
    RAGHealthResponse,
)
from rag.service import RAGService

# Auth & Personal Data Ingestion Imports
from auth.models import User, UserRegisterRequest, VerifyPhoneRequest, VerifyEmailRequest
from auth.otp import OTPManager, MockOTPProvider
from auth.email import EmailVerificationService
from auth.consent import UserConsentManager
from auth.auth_service import AuthService
from ingestion.gmail_provider import GmailOAuthManager
from ingestion.service import PersonalDataIngestionService
from privacy.service import PrivacyService


# Global Service Singletons
market_service = MarketDataService()
market_provider = market_service.provider
model_registry = ModelRegistry()

stock_predictor = StockMarketPredictor(provider=market_provider)
stock_predictor.train()
foundation_predictor = FinancialFoundationPredictor(provider=market_provider)
ensemble_predictor = EnsembleStockPredictor(
    gradient_predictor=stock_predictor,
    foundation_predictor=foundation_predictor,
    provider=market_provider
)
sentiment_provider = SentimentProvider()

rag_service = RAGService()
ai_service = AIExplanationService()

# Auth & Personal Data Ingestion Singletons
otp_manager = OTPManager()
email_service = EmailVerificationService()
user_consent_manager = UserConsentManager()
auth_service = AuthService(otp_manager, email_service, user_consent_manager)

gmail_oauth_manager = GmailOAuthManager()
ingestion_service = PersonalDataIngestionService(gmail_oauth_manager)
privacy_service = PrivacyService(user_consent_manager, gmail_oauth_manager, ingestion_service)

# Market Instrument Resolver & Quote Service Singletons
from ml.investment.resolver import InstrumentResolver
from ai.quote_service import MarketQuoteService

instrument_resolver = InstrumentResolver(market_provider)
quote_service = MarketQuoteService(market_provider)




def get_predictor(model_name: Optional[str] = "ensemble"):
    clean = (model_name or "ensemble").lower().strip()
    if clean in ["gradient_boosting", "gradientboosting", "gb"]:
        return stock_predictor
    elif clean in ["foundation", "foundation_model", "chronos"]:
        return foundation_predictor
    else:
        return ensemble_predictor


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/investment/models")
def list_investment_models():
    """
    Return list of available forecasting models, capability status, and versions.
    """
    from ml.investment.tournament import ModelTournament
    cand_models = ModelTournament.instantiate_models()
    meta_list = [m.get_model_metadata() for m in cand_models.values()]

    prod_file = "./data/model_registry/production_model.json"
    prod_data = None
    if os.path.exists(prod_file):
        try:
            with open(prod_file, "r") as f:
                prod_data = json.load(f)
        except Exception:
            pass

    return {
        "models": [
            {
                "name": "gradient_boosting",
                "available": True,
                "version": "1.0.0",
                "type": "Scikit-Learn GradientBoostingRegressor + RandomForestClassifier"
            },
            {
                "name": "foundation",
                "available": foundation_predictor.is_available,
                "version": "1.0.0 (Chronos-Bolt)",
                "type": "Zero-shot Time-Series Foundation Model"
            },
            {
                "name": "ensemble",
                "available": True,
                "version": "1.0.0",
                "type": "Weighted Ensemble (GradientBoosting + Foundation Model)"
            }
        ],
        "candidate_models": meta_list,
        "active_production_model": prod_data.get("production_model", "Ensemble") if prod_data else "Ensemble",
        "production_metadata": prod_data
    }


@app.post("/investment/predict", response_model=dict[str, list[PredictionResult]])
def predict_stocks(request: PredictRequest):
    """
    Predict risk-aware, probabilistic stock returns across specified symbols, horizon, and selected model.
    """
    if not request.symbols:
        raise HTTPException(status_code=400, detail="Symbols list cannot be empty")

    predictor = get_predictor(request.model_name)
    results = []
    for symbol in request.symbols:
        try:
            pred = predictor.predict(symbol, horizon_days=request.horizon_days)
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

    predictor = get_predictor(request.model_name)
    candidates = []
    for symbol in request.symbols:
        pred = predictor.predict(symbol)
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
    predictor = get_predictor(request.model_name)
    candidates = []

    for symbol in request.symbols:
        pred = predictor.predict(symbol)
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


# ==================================================
# GROWW OAUTH AUTHENTICATION ENDPOINTS
# ==================================================

@app.get("/dashboard")
@app.get("/")
def dashboard_endpoint():
    """Serve the interactive glassmorphic Real-Time Market & AI Stock Prediction Dashboard UI."""
    static_html = Path(__file__).parent / "static" / "index.html"
    if static_html.exists():
        return FileResponse(static_html)
    return {"message": "FinMitra AI Service Running", "dashboard": "static/index.html not found"}


# ==================================================
# REAL-TIME MARKET DATA & LIVE INFERENCE ENDPOINTS
# ==================================================

@app.get("/investment/market-status", response_model=MarketStatusResponse)
def investment_market_status_endpoint():
    """
    Returns active market data provider connection state, market status (OPEN/CLOSED), and data quality headers.
    """
    return market_service.get_market_status()


@app.get("/investment/model-status", response_model=ModelStatusResponse)
def investment_model_status_endpoint():
    """
    Returns active production ML model status, version, training row counts, and validation metrics from ModelRegistry.
    """
    return model_registry.get_model_status()


@app.get("/investment/quote/{symbol}", response_model=MarketQuote)
def market_quote_endpoint(symbol: str):
    """
    Fetch normalized real-time market quote for specified symbol with exact timestamp and data quality tracking.
    """
    quote = market_service.fetch_live_quote(symbol=symbol)
    if not quote:
        raise HTTPException(
            status_code=503,
            detail={"status": "LIVE_DATA_UNAVAILABLE", "message": f"Unable to fetch real-time quote for symbol '{symbol}'."}
        )
    return quote


@app.post("/investment/live-predict", response_model=LivePredictResponse)
def live_predict_endpoint(request: LivePredictRequest):
    """
    Executes real-time stock inference using MarketDataService live quote + historical dataset + Ensemble (GradientBoosting + Chronos-Bolt).
    Strictly separates inference from training (uses pre-trained model from ModelRegistry).
    """
    live_quote = market_service.fetch_live_quote(symbol=request.symbol)

    if not live_quote or live_quote.data_quality in ["STALE", "UNAVAILABLE"]:
        # Fallback check or error
        if not live_quote:
            raise HTTPException(
                status_code=400,
                detail={"status": "LIVE_DATA_UNAVAILABLE", "message": f"Real-time data unavailable for symbol '{request.symbol}'."}
            )

    predictor = get_predictor(request.model_name)

    # Historical prices base dataset
    start_date = datetime.now() - timedelta(days=365)
    hist_prices = market_provider.get_historical_prices(request.symbol, start_date, datetime.now())

    # Update latest real-time quote point if available
    if live_quote and len(hist_prices) > 0:
        latest_hp = HistoricalPrice(
            symbol=request.symbol.upper(),
            date=datetime.now(),
            open=live_quote.open,
            high=live_quote.high,
            low=live_quote.low,
            close=live_quote.last_price,
            volume=live_quote.volume
        )
        hist_prices.append(latest_hp)

    # Pure inference call
    pred_res = predictor.predict(
        symbol=request.symbol,
        horizon_days=request.horizon_days,
        historical_prices=hist_prices
    )

    # Generate Gemini RAG-grounded natural language explanation
    rag_res = rag_service.query(RAGQueryRequest(query=f"Analysis for {request.symbol}", symbol=request.symbol, top_k=2))
    gemini_explain = ai_service.explain_investment_candidate(
        market_prediction=pred_res.model_dump(),
        rag_chunks=rag_res.chunks
    )

    return LivePredictResponse(
        symbol=request.symbol.upper(),
        prediction=pred_res,
        live_quote=live_quote,
        data_quality=live_quote.data_quality if live_quote else "UNAVAILABLE",
        gemini_explanation=gemini_explain
    )


class TournamentRequest(BaseModel):
    symbol: str = "RELIANCE.NS"
    years: int = 10
    horizon: int = 20
    friction_bps: float = 0.0


@app.post("/investment/model-tournament")
def run_model_tournament_endpoint(request: TournamentRequest):
    """Execute model tournament walk-forward benchmarking on specified symbol."""
    from ml.investment.tournament import ModelTournament
    try:
        tourney = ModelTournament(
            symbol=request.symbol,
            years=request.years,
            horizon=request.horizon,
            friction_bps=request.friction_bps
        )
        res = tourney.run_tournament()
        return {
            "status": "SUCCESS",
            "symbol": res["symbol"],
            "winning_model": res["winning_model"],
            "scores": res["scores"],
            "models_metadata": res["models_metadata"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model tournament execution error: {str(e)}")


# ==================================================
# USER AUTHENTICATION ENDPOINTS
# ==================================================

@app.post("/auth/register")
def register_endpoint(request: UserRegisterRequest):
    success, result = auth_service.register_user(
        phone_number=request.phone_number,
        email=request.email,
        password=request.password
    )
    if not success:
        raise HTTPException(status_code=400, detail=result)
    return {
        "success": True,
        "message": "User registered successfully. Verification OTPs sent to phone and email.",
        "user": result.to_dict()
    }


class LoginRequest(BaseModel):
    identifier: str
    password: str


@app.post("/auth/login")
def login_endpoint(request: LoginRequest):
    success, result = auth_service.authenticate_user(request.identifier, request.password)
    if not success:
        raise HTTPException(status_code=401, detail=result)
    return {
        "success": True,
        "message": "Login successful.",
        "user": result.to_dict()
    }


@app.post("/auth/verify-phone")
def verify_phone_endpoint(request: VerifyPhoneRequest):
    success, message = auth_service.verify_phone(request.phone_number, request.otp)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {
        "success": True,
        "message": message,
        "phone_verified": True
    }


@app.post("/auth/verify-email")
def verify_email_endpoint(request: VerifyEmailRequest):
    success, message = auth_service.verify_email(request.email, request.code)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {
        "success": True,
        "message": message,
        "email_verified": True
    }


@app.get("/auth/gmail/connect")
def gmail_connect_endpoint(user_id: str, redirect_uri: str = "http://localhost:5173/auth/gmail/callback"):
    url = gmail_oauth_manager.get_authorization_url(redirect_uri, state=user_id)
    return {
        "authorization_url": url,
        "scope": gmail_oauth_manager.scope
    }


@app.get("/auth/gmail/callback")
def gmail_callback_endpoint(code: str, state: str):
    user_id = state
    token_info = gmail_oauth_manager.exchange_code_for_tokens(code, user_id)
    user_consent_manager.grant_consent(user_id, "GMAIL_READ", "https://www.googleapis.com/auth/gmail.readonly")
    return {
        "success": True,
        "message": "Gmail account connected and authorized successfully.",
        "status": token_info["status"]
    }


@app.get("/auth/gmail/status")
def gmail_status_endpoint(user_id: str):
    connected = gmail_oauth_manager.get_token_status(user_id)
    authorized = user_consent_manager.is_source_authorized(user_id, "GMAIL_READ")
    return {
        "user_id": user_id,
        "connected": connected and authorized,
        "scope": gmail_oauth_manager.scope
    }


@app.post("/auth/gmail/disconnect")
def gmail_disconnect_endpoint(user_id: str):
    res = privacy_service.revoke_data_source(user_id, "GMAIL_READ")
    return res


# ==================================================
# DATA INGESTION ENDPOINTS
# ==================================================

@app.post("/data/gmail/sync")
def gmail_sync_endpoint(user_id: str):
    if not user_consent_manager.is_source_authorized(user_id, "GMAIL_READ"):
        raise HTTPException(status_code=403, detail="Gmail access consent not granted or revoked.")
    res = ingestion_service.sync_gmail_data(user_id)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Gmail sync failed."))
    return res


class SMSImportPayload(BaseModel):
    user_id: str
    source: str = "android_sms"
    messages: list[dict[str, Any]]


@app.post("/data/sms/import")
def sms_import_endpoint(payload: SMSImportPayload):
    user_id = payload.user_id
    user_consent_manager.grant_consent(user_id, "SMS_FINANCIAL_MESSAGES", "local_sms_parsing")
    res = ingestion_service.import_sms_data(user_id, payload.model_dump())
    return res


@app.get("/data/connections")
def data_connections_endpoint(user_id: str):
    return privacy_service.get_data_sources(user_id)


@app.post("/data/sync-all")
def sync_all_endpoint(user_id: str):
    gmail_res = {}
    if user_consent_manager.is_source_authorized(user_id, "GMAIL_READ"):
        gmail_res = ingestion_service.sync_gmail_data(user_id)

    summary = privacy_service.get_data_summary(user_id)
    return {
        "success": True,
        "user_id": user_id,
        "gmail_sync": gmail_res,
        "summary": summary
    }


# ==================================================
# PRIVACY & DATA CONTROL ENDPOINTS
# ==================================================

@app.get("/privacy/data-sources")
def privacy_data_sources_endpoint(user_id: str):
    return privacy_service.get_data_sources(user_id)


@app.post("/privacy/revoke/{source}")
def privacy_revoke_source_endpoint(source: str, user_id: str):
    res = privacy_service.revoke_data_source(user_id, source)
    return res


@app.get("/privacy/data-summary")
def privacy_data_summary_endpoint(user_id: str):
    return privacy_service.get_data_summary(user_id)


@app.delete("/privacy/my-data")
def privacy_delete_my_data_endpoint(user_id: str):
    res = privacy_service.delete_all_user_data(user_id)
    return res


# ==================================================
# DYNAMIC MARKET & ASSET SEARCH ENDPOINTS
# ==================================================

@app.get("/market/search")
def market_search_endpoint(q: str):
    """
    Search any stock or instrument dynamically supported by the MarketDataProvider.
    """
    matches = instrument_resolver.search_instruments(q)
    return {
        "query": q,
        "count": len(matches),
        "matches": matches
    }


@app.get("/market/quote")
def market_quote_query_endpoint(query: str):
    """
    Get live quote or natural-language asset price resolution for ANY supported stock/security.
    """
    result = quote_service.process_quote_query(query)
    return result


@app.get("/market/instrument/{symbol}")
def market_instrument_endpoint(symbol: str):
    """
    Get detailed instrument specifications for specified symbol.
    """
    details = instrument_resolver.get_instrument_details(symbol)
    if not details:
        raise HTTPException(
            status_code=404,
            detail={"status": "INSTRUMENT_NOT_FOUND", "message": f"Instrument '{symbol}' not found."}
        )
    return details


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False)

