# FinMitra — Personal Finance Management Platform

FinMitra is a personal finance application that helps users understand their spending, savings, investments, and overall financial health in one place.

The system can import bank statements, analyze transactions, calculate financial health metrics, show market prices, simulate stock trading, and provide financial learning content based on the user's financial situation.

The main goal is simple: **help users understand where their money is going and make better financial decisions.**

---

## Project Architecture

FinMitra is split into three main parts:

```text
                ┌──────────────────────────────────┐
                │       React + Vite Frontend      │
                │                                  │
                │ Dashboard | Health | Trading     │
                │ Academy | Mentor | Profile       │
                └────────────────┬─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
          ┌─────────▼─────────┐     ┌────────▼─────────┐
          │ Node.js / Express │     │ Python / FastAPI │
          │                   │     │                  │
          │ Authentication    │     │ Financial Health │
          │ User Management   │     │ Market Data      │
          │ Transactions      │     │ AI Features      │
          │ PDF Processing    │     │                  │
          └─────────┬─────────┘     └──────────────────┘
                    │
            ┌───────▼────────┐
            │    MongoDB     │
            │                │
            │ Users          │
            │ Transactions   │
            │ Portfolio      │
            └────────────────┘
```

### Frontend

Built using React, Vite and TypeScript. It provides the main interface where users can view their financial data, health score, portfolio, learning progress and other features.

### Node.js Backend

The Express backend handles authentication, users, transactions, bank statement uploads and communication with MongoDB.

### Python AI Service

The FastAPI service handles the more calculation-heavy and AI-related parts of the application, including financial health calculations, market data and Gemini-based analysis.

### Database

MongoDB stores user accounts, transactions and portfolio-related information.

---

# Main Features

## 1. Financial Health Dashboard

FinMitra calculates a financial health score using eight areas:

1. Savings & Accumulation — 25 points
2. Expense Control — 20 points
3. Spending Balance — 15 points
4. Cashflow Buffer — 15 points
5. Liquidity & Safety Net — 10 points
6. Debt & Obligations — 5 points
7. Income Stability — 5 points
8. Goal Alignment — 5 points

This gives the user a score out of 100 and shows which areas are doing well and which areas need attention.

### Dashboard Metrics

The dashboard includes:

* Monthly surplus
* Savings rate
* Expense ratio
* Number of transactions
* Average daily spending
* Emergency fund runway
* Net cashflow trend

The calculations are based on the transactions available for the logged-in user rather than using predefined demo numbers.

### Spending Analysis

Transactions are grouped into categories such as:

* Needs
* Wants
* Savings

The application also compares spending against the commonly used **50/30/20 budgeting guideline**.

---

## 2. Financial Education Academy

The Academy is designed to help users learn personal finance while using the application.

It currently contains 11 learning areas:

* Money Foundations
* Cashflow Mastery
* Budgeting Systems
* Transaction Intelligence
* Emergency Funds
* Debt & Credit
* Saving Systems
* Investing Fundamentals
* Tax-Aware Money
* Behavioral Finance
* Wealth & Financial Independence

There are 24 initial lessons covering practical topics such as budgeting, emergency funds, debt management, saving and investing.

Each lesson can include:

* Short summary
* Learning objectives
* Explanation of the topic
* Relevant formulas
* Indian examples using ₹
* Do/Don't recommendations
* Multiple-choice questions
* Practical actions

Users need to score at least 80% in a lesson quiz to mark it as mastered.

Completing practical actions can also give the user XP and contribute to their learning progress.

---

## 3. Personalized Learning Recommendations

The Academy is connected to the Financial Health Engine.

This means the application can suggest learning topics based on the user's financial data.

For example:

| Financial Situation         | Suggested Topic                       |
| --------------------------- | ------------------------------------- |
| Low savings rate            | Pay Yourself First                    |
| High EMI/debt burden        | Debt-to-Income Ratio & Debt Avalanche |
| High discretionary spending | Needs vs Wants                        |
| Frequent impulse purchases  | 48-Hour Cooling Rule                  |

The idea is to make the learning content more relevant instead of showing the same lessons to every user.

---

# 4. Financial Calculators

FinMitra includes several basic financial calculators:

* 50/30/20 Budget Calculator
* Emergency Fund Calculator
* SIP & Compound Growth Calculator
* Debt-to-Income Ratio Calculator
* 48-Hour Impulse Purchase Calculator

There is also a searchable glossary containing common financial terms and formulas.

---

# 5. Market Data & Trading Simulator

FinMitra also includes a stock market section where users can experiment with investing without using real money.

The application receives market price updates through WebSockets and displays prices for selected Indian stocks.

Users can:

* View stock prices
* Buy stocks in the simulator
* Sell stocks
* Track their holdings
* View their simulated portfolio
* Use their calculated surplus as the basis for simulated trading capital

### AI Stock Analysis

Gemini is used to provide AI-based analysis using information available to the application.

The AI can consider factors such as:

* User's savings rate
* Available cash surplus
* Existing portfolio
* Portfolio allocation

The trading module is intended as a **simulation and learning feature**, not as a platform for executing real stock trades.

---

# 6. Bank Statement Processing

Users can upload supported bank statement PDFs.

The backend extracts transaction information and converts it into a format that can be stored and analyzed by the application.

The processing pipeline includes:

```text
Bank Statement PDF
        ↓
PDF Text Extraction
        ↓
Transaction Detection
        ↓
Date / Amount / Description
        ↓
Category Assignment
        ↓
Self-Transfer Detection
        ↓
MongoDB
        ↓
Financial Analysis
```

Self-transfers are identified where possible so that moving money between a user's own accounts does not incorrectly appear as income or additional spending.

---

# Technology Stack

### Frontend

* React 18
* Vite
* TypeScript
* Lucide Icons
* CSS

### Backend

* Node.js
* Express.js
* Mongoose
* JWT
* Multer
* PDF parsing libraries

### AI & Data Service

* Python
* FastAPI
* Uvicorn
* Pandas
* NumPy
* Scikit-learn
* PyTorch
* yfinance
* Google GenAI SDK
* Pytest

### Database

* MongoDB
* MongoDB Atlas or local MongoDB

---

# Running the Project

## Requirements

Make sure you have:

* Node.js 18+
* Python 3.10+
* MongoDB
* Git

---

## 1. Start the Node.js Backend

```powershell
cd backend\api

npm install

# Configure your .env file
# MONGODB_URI=...
# JWT_SECRET=...

npm start
```

The backend runs on:

```text
http://localhost:5000
```

---

## 2. Start the Python Service

```powershell
cd ai-service

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python main.py
```

The FastAPI service runs on:

```text
http://127.0.0.1:8000
```

---

## 3. Start the Frontend

```powershell
cd frontend

npm install

npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

Open the address in your browser to use FinMitra.

---

# Testing

### Frontend Build

```powershell
cd frontend
npm run build
```

### Python Tests

```powershell
cd ai-service

venv\Scripts\pytest tests/
```

---

# Project Goal

FinMitra brings together several parts of personal finance that are usually spread across different applications.

Instead of only showing transactions or stock prices, the application connects:

**Bank Data → Spending Analysis → Financial Health → Learning Recommendations → Investment Simulation**

The project is mainly focused on making personal finance easier to understand and giving users a practical way to learn from their own financial data.

---

# License

This project is developed as a personal project. All rights reserved.
