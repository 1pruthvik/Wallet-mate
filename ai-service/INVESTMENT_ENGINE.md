# FinMitra Investment Engine & Forecasting Architecture

## Overview
The FinMitra Investment Engine provides a quantitative, time-series research and forecasting pipeline combined with open-source foundation models, ensemble predictors, model agreement analysis, multi-factor stock ranking (0–100), transaction cost friction analysis, walk-forward backtesting, RAG knowledge retrieval, and Google Gemini AI explanations.

---

## System Architecture

```
Market Data (yfinance / Mock)
            ↓
Data Validation & Cleaning (OHLC integrity, deduplication, volume checks)
            ↓
    +-------+-------+
    |               |
    v               v
GradientBoosting   FinancialFoundationPredictor (Chronos-Bolt TSFM)
Predictor (Model A)               (Model B)
    |               |
    +-------+-------+
            ↓
    EnsembleStockPredictor (Weighted Combination + Model Agreement Analysis)
            ↓
Multi-Factor Stock Ranking (Investment Score 0–100: Return 35%, Risk 25%, Agreement 20%, Reliability 20%)
            ↓
Walk-Forward Backtesting (5, 20, 60d Horizons, 0-20 bps Friction, MAE, RMSE, Sharpe, Max Drawdown)
            ↓
Personalization & Portfolio Allocation (Risk Level Matching, Surplus Budgeting)
            ↓
RAG Knowledge Base Grounding (Regulatory Filings & Trust Registry Context)
            ↓
Google Gemini Explanation Engine (Grounded natural-language explanations)
```

---

## Key Pipeline Components

### 1. Model Provider Abstraction & Foundation Model (`ml/investment/models/`)
- **`BaseStockPredictor`**: Abstract interface enforcing standardized probabilistic return, direction, and expected price contract.
- **`GradientBoostingStockPredictor`**: Scikit-Learn baseline ensemble regressor and direction classifier.
- **`FinancialFoundationPredictor`**: Open-source time-series foundation model (`amazon/chronos-bolt-tiny` TSFM). Pretrained zero-shot forecasting engine operating locally on CPU with zero lookahead future-data leakage.
- **`EnsembleStockPredictor`**: Weighted combination of Model A and Model B with configurable weights (`gradient_weight=0.5, foundation_weight=0.5`) and automatic fallback to Model A if Model B dependencies are offline.

### 2. Model Agreement Analysis (`ml/investment/models/ensemble_predictor.py`)
- **`HIGH` Agreement**: Both models predict same direction and predicted returns are within 1.5% margin. Confidence boosted by +0.10.
- **`MEDIUM` Agreement**: Both models predict same direction but return gap > 1.5%.
- **`LOW` Agreement**: Models predict opposite directions (one UP, one DOWN). Confidence penalized by -0.15.
- **`SINGLE_MODEL`**: Single model operating in fallback mode.

### 3. Multi-Factor Stock Ranking System (0–100) (`ml/investment/investment_score.py`)
Mathematical Score Formula:
- $\text{Prediction Score} = \text{clamp}(50 + \text{return} \cdot 1000 \cdot \text{confidence}, 0, 100)$
- $\text{Risk Score} = 100 - \text{asset\_risk\_score}$
- $\text{Agreement Score} = 100 \text{ (HIGH)}, 65 \text{ (MEDIUM)}, 20 \text{ (LOW)}$
- $\text{Reliability Score} = \text{clamp}(\text{directional\_accuracy} \cdot 100, 0, 100)$
- $\text{Final Investment Score} = 0.35 \cdot \text{Prediction} + 0.25 \cdot \text{Risk} + 0.20 \cdot \text{Agreement} + 0.20 \cdot \text{Reliability}$

### 4. Walk-Forward Backtesting & Transaction Friction (`ml/investment/backtest.py`)
- **Walk-Forward Evaluation**: Trains on past window $\rightarrow$ Predicts next period $\rightarrow$ Rolls window forward $\rightarrow$ Retrains $\rightarrow$ Repeats.
- **Multi-Horizon Support**: Evaluated across 5, 20, and 60 trading days horizons.
- **Transaction Costs & Slippage**: Evaluates strategy performance under $0 \text{ bps}, 5 \text{ bps}, 10 \text{ bps}, 20 \text{ bps}$ friction.
- **Metrics Calculated**: MAE, RMSE, Directional Accuracy, Correct / Incorrect Directions Count, Cumulative Strategy Return, Buy & Hold Benchmark Return, Max Drawdown, Volatility, Sharpe Ratio.

### 5. API Endpoints & Model Selection (`main.py`)
- `GET /investment/models`: Lists model availability, versions, and capabilities.
- `POST /investment/predict`, `/analyze`, `/rank`, `/portfolio`: Accepts optional `model_name` parameter (`"gradient_boosting"`, `"foundation"`, `"ensemble"`).

### 6. Google Gemini AI Integration (`ai/gemini_provider.py`)
- **Role of Gemini**: Gemini strictly generates natural-language explanations of quantitative model outputs, Model Agreement, and backtest results.
- **Anti-Fabrication Guarantee**: Gemini does **NOT** generate price targets or stock predictions independently. All numbers originate from quantitative models.
- **API Key Security**: `GEMINI_API_KEY` is loaded from environment variables and is never logged or exposed in API outputs.

---

## Disclaimers & Terminology
- **Terminology**: The system uses terms such as *"model prediction"*, *"expected return range"*, *"estimated risk score"*, and *"historical walk-forward backtest"*.
- **No Financial Guarantees**: Predictions are probabilistic research estimates and do not guarantee future stock returns or execute automatic trades.
