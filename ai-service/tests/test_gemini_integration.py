from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from main import app
from ai.gemini_provider import GeminiProvider

client = TestClient(app)


# ==================================================
# 1. GEMINI SERVICE INITIALIZATION TESTS
# ==================================================

def test_gemini_service_initialization():
    provider = GeminiProvider(api_key="test_fake_api_key", model_name="gemini-3.6-flash")
    assert provider.api_key == "test_fake_api_key"
    assert provider.model_name == "gemini-3.6-flash"
    assert provider._client is not None


def test_gemini_missing_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    provider = GeminiProvider(api_key=None)
    assert provider.api_key is None
    assert provider._client is None
    # Falls back gracefully to MockAIProvider
    res = provider.chat("Hello")
    assert "answer" in res
    assert "FinMitra" in res["answer"]


# ==================================================
# 2. MOCKED GEMINI CLIENT SUCCESS & FAILURE TESTS
# ==================================================

def test_gemini_successful_response():
    provider = GeminiProvider(api_key="test_fake_key", model_name="gemini-3.6-flash")
    
    mock_response = MagicMock()
    mock_response.text = '{"summary": "Solid company", "why_it_matters": "Growth", "key_factors": ["Revenue"], "risks": ["Volatility"], "uncertainty": "Low", "educational_note": "Note"}'

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response
    provider._client = mock_client

    explanation = provider.generate_explanation(
        market_prediction={"symbol": "TCS"},
        investment_score={"investment_score": 85}
    )

    assert explanation["summary"] == "Solid company"
    assert mock_client.models.generate_content.called


@pytest.mark.parametrize("error_text", [
    "400 Invalid argument",
    "429 Resource Exhausted (Rate Limit)",
    "503 Service Unavailable",
    "Connection reset by peer (Network Error)"
])
def test_gemini_api_failure(error_text):
    provider = GeminiProvider(api_key="test_fake_key", model_name="gemini-3.6-flash")
    
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = Exception(error_text)
    provider._client = mock_client

    # Should fall back cleanly to MockAIProvider without crashing
    res = provider.chat("What is P/E?")
    assert "answer" in res
    assert res["answer"] is not None


# ==================================================
# 3. FASTAPI API ENDPOINT TESTS (/ai/chat & /ai/explain)
# ==================================================

def test_api_chat_success():
    response = client.post("/ai/chat", json={"message": "What is portfolio diversification?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "disclaimer" in data
    assert "sources" in data


def test_api_chat_validation_failure():
    # Empty message should trigger HTTP 400
    response = client.post("/ai/chat", json={"message": "   "})
    assert response.status_code == 400


def test_api_explain_success():
    response = client.post(
        "/ai/explain",
        json={
            "market_prediction": {"symbol": "INFY", "predicted_return": 0.08},
            "investment_score": {"investment_score": 80}
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data


def test_api_explain_validation_failure():
    # Invalid JSON schema format should trigger FastAPI HTTP 422
    response = client.post("/ai/explain", json={"market_prediction": "INVALID_FORMAT"})
    assert response.status_code == 422


# ==================================================
# 4. SECURITY & EXPOSURE VERIFICATION
# ==================================================

def test_api_key_never_exposed():
    fake_secret = "SECRET_GEMINI_KEY_999"
    provider = GeminiProvider(api_key=fake_secret)

    # Force failure containing secret key in error string
    mock_client = MagicMock()
    mock_client.models.generate_content.side_effect = Exception(f"Internal error with key {fake_secret}")
    provider._client = mock_client

    res = provider.chat("Hello")
    res_str = str(res)
    assert fake_secret not in res_str


# ==================================================
# 5. EXISTING FUNCTIONALITY PRESERVATION VERIFICATION
# ==================================================

def test_existing_rag_functionality_preserved():
    response = client.get("/rag/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_existing_investment_functionality_preserved():
    response = client.post("/investment/predict", json={"symbols": ["RELIANCE"], "horizon_days": 60})
    assert response.status_code == 200
    assert "predictions" in response.json()


def test_existing_transaction_functionality_preserved():
    response = client.post(
        "/parse/sms",
        json={"sms": "Rs.500 debited via UPI to SWIGGY on 22-08-2026"}
    )
    assert response.status_code == 200
    assert response.json()["merchant"] == "SWIGGY"

