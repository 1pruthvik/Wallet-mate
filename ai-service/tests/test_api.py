from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_root():

    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["service"] == "FinMitra AI Service"
    assert data["status"] == "running"


def test_health():

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"


def test_parse_sms():

    response = client.post(
        "/parse/sms",
        json={
            "sms": (
                "Rs.799 debited via UPI "
                "to Swiggy India Pvt Ltd "
                "on 22-08-2026"
            )
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["amount"] == 799.0
    assert data["transaction_type"] == "debit"
    assert data["merchant"] == "SWIGGY"
    assert data["category"] == "Food"
    assert data["channel"] == "UPI"
    assert data["recurring"] is False


def test_parse_amazon_sms():

    response = client.post(
        "/parse/sms",
        json={
            "sms": (
                "Rs.1299 debited via UPI "
                "to Amazon India "
                "on 22-08-2026"
            )
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["amount"] == 1299.0
    assert data["merchant"] == "AMAZON"
    assert data["category"] == "Shopping"
    assert data["channel"] == "UPI"
def test_analyze_endpoint():

    response = client.post(
        "/analyze",
        json={
            "transactions": [
                {
                    "transaction_id": "TXN001",
                    "amount": 50000,
                    "transaction_type": "credit",
                    "merchant": "EMPLOYER",
                    "counterparty": None,
                    "category": "Salary",
                    "channel": "BANK",
                    "date": "2026-08-01T00:00:00",
                    "description": "Monthly salary credited",
                    "account_id": None,
                    "reference_number": None,
                    "recurring": False,
                    "confidence": 1.0
                },
                {
                    "transaction_id": "TXN002",
                    "amount": 799,
                    "transaction_type": "debit",
                    "merchant": "SWIGGY",
                    "counterparty": None,
                    "category": "Food",
                    "channel": "UPI",
                    "date": "2026-08-22T00:00:00",
                    "description": "Food order",
                    "account_id": None,
                    "reference_number": None,
                    "recurring": False,
                    "confidence": 1.0
                },
                {
                    "transaction_id": "TXN003",
                    "amount": 1299,
                    "transaction_type": "debit",
                    "merchant": "AMAZON",
                    "counterparty": None,
                    "category": "Shopping",
                    "channel": "UPI",
                    "date": "2026-08-20T00:00:00",
                    "description": "Online shopping purchase",
                    "account_id": None,
                    "reference_number": None,
                    "recurring": False,
                    "confidence": 1.0
                }
            ],
            "budgets": {
                "Food": 3000,
                "Shopping": 5000,
                "Travel": 2000
            }
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["summary"]["total_income"] == 50000
    assert data["summary"]["total_spending"] == 2098
    assert data["summary"]["balance"] == 47902

    assert (
        data["budget_analysis"]["Food"]["status"]
        == "WITHIN_BUDGET"
    )

    assert (
        data["budget_analysis"]["Shopping"]["status"]
        == "WITHIN_BUDGET"
    )

    assert (
        data["financial_health"]["score"]
        == 100
    )

    assert (
        data["financial_health"]["status"]
        == "Excellent"
    )


def test_analyze_empty_transactions():

    response = client.post(
        "/analyze",
        json={
            "transactions": [],
            "budgets": {}
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["summary"]["total_income"] == 0
    assert data["summary"]["total_spending"] == 0
    assert data["summary"]["balance"] == 0    
def test_parse_sms_missing_sms():

    response = client.post(
        "/parse/sms",
        json={}
    )

    assert response.status_code == 422


def test_analyze_invalid_amount():

    response = client.post(
        "/analyze",
        json={
            "transactions": [
                {
                    "transaction_id": "TXN001",
                    "amount": -500,
                    "transaction_type": "debit",
                    "merchant": "SWIGGY",
                    "counterparty": None,
                    "category": "Food",
                    "channel": "UPI",
                    "date": "2026-08-22T00:00:00",
                    "description": "Food order",
                    "account_id": None,
                    "reference_number": None,
                    "recurring": False,
                    "confidence": 1.0
                }
            ],
            "budgets": {
                "Food": 3000
            }
        }
    )

    assert response.status_code == 422


def test_analyze_missing_transaction_field():

    response = client.post(
        "/analyze",
        json={
            "transactions": [
                {
                    "transaction_id": "TXN001",
                    "amount": 500,
                    "transaction_type": "debit",
                    "merchant": "SWIGGY",
                    "category": "Food",
                    "date": "2026-08-22T00:00:00"
                }
            ],
            "budgets": {
                "Food": 3000
            }
        }
    )

    assert response.status_code == 422


def test_analyze_invalid_confidence():

    response = client.post(
        "/analyze",
        json={
            "transactions": [
                {
                    "transaction_id": "TXN001",
                    "amount": 500,
                    "transaction_type": "debit",
                    "merchant": "SWIGGY",
                    "counterparty": None,
                    "category": "Food",
                    "channel": "UPI",
                    "date": "2026-08-22T00:00:00",
                    "description": "Food order",
                    "account_id": None,
                    "reference_number": None,
                    "recurring": False,
                    "confidence": 2.0
                }
            ],
            "budgets": {
                "Food": 3000
            }
        }
    )

    assert response.status_code == 422


def test_analyze_missing_transaction_field():

    response = client.post(
        "/analyze",
        json={
            "transactions": [
                {
                    "amount": 500,
                    "transaction_type": "debit",
                    "merchant": "SWIGGY",
                    "category": "Food",
                    "date": "2026-08-22T00:00:00"
                }
            ],
            "budgets": {
                "Food": 3000
            }
        }
    )

    assert response.status_code == 422