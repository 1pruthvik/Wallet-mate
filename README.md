# FinMitra — AI Money Mentor, Investment & RAG Intelligence Platform

FinMitra is an advanced AI-powered personal financial intelligence, risk-aware investment research, and Retrieval-Augmented Generation (RAG) platform built with **FastAPI**, **Machine Learning**, **Local Vector Store**, and **Google Gemini Generative AI**.

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
USER FINANCIAL PROFILE                      MARKET DATA LAYER
(Income, Surplus, Risk)                 (Prices, Fundamentals, News)
       |                                         |
       +--------------------+--------------------+
                            |
                            v
                   FEATURE ENGINEERING & ML
              (SMA, RSI, MACD, PE, Regressors)
                            |
                            v
             PERSONALIZATION & PORTFOLIO ALLOCATION
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

## ✨ System Features

### 1. Financial Intelligence Engine
- **SMS & CSV Parsing**: Automatically parse bank SMS alerts and CSV transaction statements into standardized `Transaction` models.
- **Categorization**: Multi-stage classification combining rule-based heuristics and TF-IDF ML classifiers.
- **Recurring Commitment Detector**: Automatically detects periodic bills, EMIs, and SIP investments.
- **Financial Health Score**: Calculates a transparent 0–100 health score spanning savings rates, budget adherence, and recurring burdens.

### 2. Investment Intelligence Engine
- **User Financial Profile**: Evaluates net monthly surplus and investment capacity directly from user transactions.
- **Risk Profiling**: Assesses conservative, moderate, or aggressive risk tolerance based on capacity and horizon.
- **Market Data Layer**: Provider abstraction supporting real market data (`yfinance`) with in-memory caching, and deterministic `MockMarketDataProvider` for offline development.
- **Feature Engineering**: Calculates technical indicators (SMA20, SMA50, RSI, MACD, Volatility) and fundamental metrics (P/E, ROE, Debt/Equity).
- **ML Stock Predictor**: Time-ordered split scikit-learn models predicting expected returns, uncertainty ranges, and directional probabilities.
- **Multi-Factor Investment Score**: Transparent 0–100 score combining return outlook, risk, technical momentum, fundamentals, and market sentiment.
- **Portfolio Allocation Engine**: Computes hypothetical diversified asset allocations enforcing single-stock limits and cash reserves.

### 3. RAG Intelligence Layer (Retrieval-Augmented Generation)
- **Document Ingestion**: Supports ingestion from Markdown, TXT, PDF, and HTML documents with section and paragraph-aware chunking.
- **Local Persistent Vector Store**: Lightweight, zero-cloud JSON vector database (`LocalPersistentVectorStore`) with content-hash deduplication and metadata filtering (topic, symbol, company, source_type).
- **Semantic & Keyword Hybrid Retrieval**: Embeds queries and boosts exact matches for financial terms, stock symbols, and regulations.
- **Reranker & Source Authority Priority**: Prioritizes regulatory filings (`regulatory` > `company_filing` > `financial_education` > `general_web`).
- **Grounded AI Answers & Citations**: Returns verified source citations (`SourceCitation`), ensuring the Generative AI engine never hallucinates stock prices or return guarantees.

---

## 🚀 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Service root and status |
| `GET` | `/health` | Health check endpoint |
| `POST` | `/parse/sms` | Parse bank SMS into standardized Transaction |
| `POST` | `/analyze` | Generate complete financial report & health score |
| `POST` | `/investment/predict` | Predict risk-aware probabilistic returns across symbols |
| `POST` | `/investment/analyze` | Personalized candidate analysis matching user financial profile |
| `POST` | `/investment/rank` | Rank candidates by suitability and investment score |
| `POST` | `/investment/portfolio` | Generate hypothetical risk-aware portfolio allocation |
| `POST` | `/rag/query` | Perform semantic + keyword retrieval & reranking against RAG store |
| `POST` | `/rag/ingest` | Ingest document text or file into RAG vector database |
| `GET` | `/rag/health` | Return RAG vector store health status and document counts |
| `POST` | `/ai/explain` | Generate RAG-grounded AI investment explanations |
| `POST` | `/ai/chat` | Interactive RAG-grounded AI Financial Assistant & Money Mentor |

---

## 🛠️ Setup & Running

### 1. Environment Setup
```powershell
cd ai-service
.\venv\Scripts\activate
```

### 2. Environment Variables
Copy `.env.example` to `.env` and set your configuration:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
RAG_VECTOR_STORE_PATH=./data/vectorstore
```

### 3. Start API Service
```powershell
uvicorn main:app --reload --port 8000
```
Interactive OpenAPI documentation will be available at `http://localhost:8000/docs`.

---

## 🧪 Testing

Run the automated test suite (89+ tests):
```powershell
pytest -v
```

All tests execute offline using local vector stores and mock providers, requiring zero internet connection.

---

## ⚠️ Responsible Investment Disclaimer

FinMitra Investment Intelligence provides educational and research research insights. It does **not** provide guaranteed investment advice or execute automated trades.
