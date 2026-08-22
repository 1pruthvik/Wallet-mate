from fastapi import FastAPI
from pydantic import BaseModel

from parsing.sms_parser import parse_sms
from parsing.transaction_model import Transaction
from ml.financial_report import generate_financial_report


app = FastAPI(
    title="FinMitra AI Service",
    description="Financial Intelligence and AI services for FinMitra",
    version="0.1.0"
)


# ==================================================
# REQUEST MODELS
# ==================================================

class SMSRequest(BaseModel):
    sms: str


class AnalyzeRequest(BaseModel):
    transactions: list[Transaction]
    budgets: dict[str, float]


# ==================================================
# BASIC ENDPOINTS
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
# SMS PARSER
# ==================================================

@app.post("/parse/sms")
def parse_sms_endpoint(request: SMSRequest):
    """
    Parse a bank SMS into a standardized transaction.
    """

    transaction = parse_sms(
        request.sms
    )

    if transaction is None:
        return {
            "success": False,
            "message": "Unable to parse SMS"
        }

    return transaction.model_dump()


# ==================================================
# FINANCIAL ANALYSIS
# ==================================================

@app.post("/analyze")
def analyze_transactions(
    request: AnalyzeRequest
):
    """
    Generate a complete FinMitra financial report.
    """

    report = generate_financial_report(
        request.transactions,
        request.budgets
    )

    return report