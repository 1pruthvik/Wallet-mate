# FinMitra — AI-Powered Personal Financial Intelligence Platform

FinMitra is a personal financial operating system that helps ordinary people understand, protect, and grow their money. Built with **React 19 + TypeScript**, **Express API + MongoDB**, **FastAPI AI Microservice**, **Quant Machine Learning Models (GradientBoosting, Chronos-Bolt, TimesFM)**, **Local RAG Vector Store**, and **Google Gemini Generative AI**.

---

## 🏛️ System Architecture

```text
                    FINMITRA
                       |
          ┌────────────┼────────────┐
          |            |            |
       UNDERSTAND    PROTECT       GROW
          |            |            |
     Transactions     Scam       Investments
     Budgets          Alerts     Stock Analysis
     Cashflow         Fraud      Ranking
     Subscriptions    Risk       Portfolio
     Financial Health            Goals
          |            |            |
          └────────────┼────────────┘
                       |
                 PERSONAL AI
                       |
             ┌─────────┴─────────┐
             |                   |
            RAG                GEMINI
             |                   |
      Verified knowledge    Explanation/chat
             |                   |
             └─────────┬─────────┘
                       |
                QUANT ENGINE
                       |
          ┌────────────┼────────────┐
          |            |            |
    GradientBoost   Chronos-Bolt  TimesFM
                       |
                Stock Ranking
                       |
                Portfolio Engine
```

---

## ✨ Key Capabilities

1. **Transaction Intelligence Pipeline**: In-memory PDF/CSV bank statement parser, SMS transaction extractor, merchant normalizer, and spending categorizer.
2. **Financial Health Intelligence**: Multi-factor scoring engine (0–100) assessing Savings Velocity, Expense Discipline, Category Balance, and Cashflow Buffer.
3. **Spending Analytics**: Category breakdown with rupee values and percentage shares, monthly outflow trends, and top counterparty burn tracking.
4. **AI Money Mentor**: Interactive financial advisor grounded in user cashflow with scenario evaluation (*Buy / Wait / Avoid*).
5. **Simulated Paper Trading**: Virtual portfolio (₹1,00,000 capital) with quant signals, confidence indicators, and risk management.
6. **Financial Education Curriculum**: Structured modular lessons on Budgeting, Saving, Debt, and Investing.

---

## 🚀 Services & Quick Start

### 1. Frontend Web App (Port 5173)
```bash
cd fintech/frontend
npm install
npm run dev
```

### 2. Express API Backend (Port 5000)
```bash
cd fintech/backend/api
npm install
npm run dev
```

### 3. FastAPI AI & Quant Service (Port 8000)
```bash
cd fintech/ai-service
pytest -v
uvicorn main:app --reload --port 8000
```
