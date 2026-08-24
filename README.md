# 💎 FINMITRA — Real-Time Personal Financial Intelligence & Education Academy

**FinMitra** is a full-stack, data-driven personal financial intelligence ecosystem. It integrates real-time bank statement diagnostics, algorithmic cashflow evaluation, live Indian stock market streaming, grounded Gemini AI investment advising, and a personalized Financial Education Academy.

---

## 🌟 Architectural Overview

FinMitra follows a decoupled microservices architecture designed for security, real-time performance, and user isolation:

```text
               ┌─────────────────────────────────────────┐
               │    React + Vite Frontend (Port 5173)    │
               │      Dashboard, Health Engine,          │
               │    Trading Simulator, Academy, Mentor   │
               └────────────────────┬────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
 ┌─────────────▼─────────────┐             ┌─────────────▼─────────────┐
 │ Node/Express API Gateway  │             │ Python FastAPI AI Engine  │
 │        (Port 5000)        │             │        (Port 8000)        │
 │  Auth, User Accounts,     │             │ Health Diagnostics,       │
 │  MongoDB Transactions,    │             │ WebSocket Market Stream,  │
 │  PDF Bank Statement Ingest│             │ Grounded Gemini Function  │
 └─────────────┬─────────────┘             └───────────────────────────┘
               │
 ┌─────────────▼─────────────┐
 │     MongoDB Database      │
 │  Users & Transactions     │
 └───────────────────────────┘
```

---

## 🚀 Key Modules & System Features

### 1. 📊 Dynamic Financial Health Engine
- **8 Financial Pillars (100-Point Model)**:
  1. *Savings & Accumulation* (25 pts)
  2. *Expense Control* (20 pts)
  3. *Spending Balance* (15 pts)
  4. *Cashflow Buffer* (15 pts)
  5. *Liquidity & Safety Net* (10 pts)
  6. *Debt & Obligations* (5 pts)
  7. *Income Stability* (5 pts)
  8. *Goal Alignment* (5 pts)
- **7 Hero KPIs**: Monthly Surplus, Savings Rate, Expense Ratio, Active Transactions, Average Daily Burn Rate, Emergency Runway (Months), Net Cashflow Trend.
- **Spending Taxonomy & 50/30/20 Benchmark**: Real-time evaluation of Needs (≤50%), Wants (≤30%), and Surplus Savings (≥20%).
- **10 Financial Constraints Engine**: Automated threshold rule evaluations (`OK`, `WATCH`, `BREACH`).
- **Zero Fake Data Policy**: 100% calculated from the logged-in user's actual MongoDB transactions.

### 2. 🎓 Financial Education Academy
- **11 Learning Paths**: Money Foundations, Cashflow Mastery, Budgeting Systems, Transaction Intelligence, Emergency Funds, Debt & Credit, Saving Systems, Investing Fundamentals, Tax-Aware Money, Behavioral Finance, Wealth & Financial Independence.
- **24 Launch Lessons**: Includes 60-second summary, learning objectives, core text, formula callout, ₹ Indian scenarios, Do/Don't lists, 3–5 MCQ quizzes (80%+ pass requirement for Mastered status), and "Apply to My Money" actions (+25 XP).
- **Personalized Recommendations Engine**: Tied directly to Financial Health Engine signals (e.g. low savings rate → *Pay Yourself First*; high EMI → *DTI & Debt Avalanche*; discretionary excess → *Needs vs Wants* & *48-Hour Cooling Rule*).
- **Interactive Financial Tools Suite**: 5 embedded calculators (50/30/20, Emergency Fund, SIP & Compound Growth, DTI Ratio, 48-Hour Impulse Purchase Delay).
- **Searchable Glossary & Formula Library**: 30+ A-Z terms and 10 essential financial formulas.

### 3. 📈 Real-Time Market Streaming & Trading Simulator
- **Live WebSocket Market Feed**: Full-duplex WebSocket stream broadcasting live price updates for 20 top Indian equities in INR (₹) with real-time price changes.
- **Gemini AI Stock Advisor**: Grounded Gemini function calling analyzing cash surplus, savings rate, and portfolio balance to recommend stock allocations.
- **Cash Surplus Synchronization**: Automatically syncs bank statement savings surplus into available trading cash balance.
- **Direct Action Buttons**: Instant Buy & Sell trading execution with portfolio holding trackers.

### 4. 📄 Bank Statement PDF Parser
- Automated ingestion of bank statement PDFs.
- Intelligent transaction extraction, category normalization, and self-transfer detection to prevent double-counting.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Lucide Icons, CSS Design System (Light Theme).
- **Node Backend**: Express.js, Mongoose, JWT Authentication, Multer, PDF Parser.
- **Python AI Engine**: FastAPI, Uvicorn, Pytest, Pandas, NumPy, Scikit-Learn, PyTorch, YFinance, Google GenAI SDK (Gemini Grounding).
- **Database**: MongoDB (Local or Atlas).

---

## 🛠️ Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 or higher
- **MongoDB**: Active local instance (`mongodb://localhost:27017`) or Atlas connection string

---

### Step 1: Clone Repository & Setup Backend API Gateway

```powershell
# Navigate to backend directory
cd backend\api

# Install dependencies
npm install

# Setup environment file (.env)
# Verify MONGODB_URI and JWT_SECRET are set

# Start Express API Server (Runs on http://localhost:5000)
npm start
```

---

### Step 2: Setup Python AI Service & Market Engine

```powershell
# Navigate to AI service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Start FastAPI AI Service (Runs on http://127.0.0.1:8000)
python main.py
```

---

### Step 3: Setup & Run React Frontend

```powershell
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server (Runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access **FinMitra**.

---

## 🧪 Running Tests

### Frontend Build & Type Check
```powershell
cd frontend
npm run build
```

### Python AI & Health Engine Tests
```powershell
cd ai-service
venv\Scripts\pytest tests/
```

---

## 📜 License

This project is personal intellectual property developed for financial intelligence management. All rights reserved.
