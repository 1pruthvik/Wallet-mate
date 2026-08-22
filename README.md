# FinMitra — AI Money Mentor, Real-Time Stock Engine & RAG Intelligence Platform

FinMitra is an advanced, production-grade personal financial intelligence, risk-aware investment research, and Retrieval-Augmented Generation (RAG) platform built with **FastAPI**, **Machine Learning**, **Amazon Chronos-Bolt TSFM**, **Local Vector Store**, and **Google Gemini Generative AI**.

---

## 🏛️ System Architecture

```text
                    FINMITRA PLATFORM
                            |
                            v
                   FINANCIAL INTELLIGENCE
            (SMS/CSV Parsing, Health Score, Budgets)
                            |
       +--------------------+--------------------+
       |                                         |
       v                                         v
USER FINANCIAL PROFILE                      MARKET DATA SERVICE
(Income, Surplus, Risk)                 (Cache, Polling/Streaming, Quality Tags)
       |                                         |
       +--------------------+--------------------+
                            |
                            v
                   FEATURE ENGINEERING & ML
            (EMA, BB, ATR, Mom, Zero Look-Ahead Bias)
                            |
                            v
                     MODEL REGISTRY
             (Walk-Forward Validation, Joblib Artifacts)
                            |
                            +--------------------+
                            |                    |
                            v                    v
                   RAG RETRIEVAL SYSTEM      GEMINI GENERATIVE AI
                (Embeddings, Vector Store,       (Context Grounding &
                 Metadata Filter, Reranker)       Fact Verification)
                            |                    |
                            +---------+----------+
                                      |
                                      v
                             GROUNDED RESPONSE
                        (Answers & Source Citations)
                                      |
                                      v
                               FASTAPI SERVICE
```

---

## ✨ Key Capabilities

1. **Transaction Intelligence Pipeline**: SMS parser, ML transaction categorizer, budget analyzer, financial health score (0–100), recurring bill detector.
2. **Real-Time Market Data Layer**: Persistent `MarketDataService` & `MarketDataCache` with data quality headers (`LIVE` <10s, `RECENT` 10–60s, `STALE` >60s, `HISTORICAL`, `UNAVAILABLE`).
3. **Multi-Year Training & Model Registry**: `WalkForwardValidator` with chronological splits (Train 60%, Val 20%, Test 20%), zero look-ahead bias, point-in-time fundamental rules, model registry disk persistence.
4. **Ensemble Stock Predictor**: Combines `GradientBoostingStockPredictor` and `ChronosFoundationPredictor` (`amazon/chronos-bolt-tiny`).
5. **RAG & Gemini Integration**: Grounded AI explanations using RAG trust vector store + Gemini 1.5/2.0 API.

---

## 🚀 Quick Start Instructions

### 1. Environment Setup
```powershell
cd ai-service
.\venv\Scripts\Activate.ps1
```

### 2. Run Test Suite (130 Tests Passing)
```powershell
pytest -v
```

### 3. Run Multi-Year Model Training CLI
```powershell
python -m ml.investment.train --symbol ICICIBANK.NS --years 10 --horizon 20
```

### 4. Start FastAPI Server & Web Interface
```powershell
uvicorn main:app --reload --port 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📡 API Endpoints

- `GET /investment/market-status`: Connection status & provider data quality.
- `GET /investment/model-status`: Active model version & validation metrics.
- `GET /investment/quote/{symbol}`: Real-time stock quote with quality tags.
- `POST /investment/live-predict`: Pure inference prediction with Gemini RAG explanation.
- `POST /ai/chat`: Gemini RAG financial advice chat with citations.
- `POST /ai/explain`: Gemini financial report explanation.
