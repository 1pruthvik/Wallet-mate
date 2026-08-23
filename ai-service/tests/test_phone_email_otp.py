import pytest
from fastapi.testclient import TestClient
from main import app, email_service
from auth.otp import PhoneVerificationService, MockOTPProvider

client = TestClient(app)

def test_phone_otp_flow_and_mock_provider():
    provider = MockOTPProvider()
    service = PhoneVerificationService(provider=provider)
    phone = "+919876500001"

    ok, msg = service.send_otp(phone)
    assert ok is True

    # Verify wrong OTP
    ok_bad, msg_bad = service.verify_otp(phone, "000000")
    assert ok_bad is False

    # Verify correct OTP
    ok_good, msg_good = service.verify_otp(phone, "123456")
    assert ok_good is True


def test_email_verification_flow():
    email = "verify@finmitra.com"
    ok, msg = email_service.send_verification_email(email)
    assert ok is True

    code = email_service.sent_codes.get(email)
    assert code is not None

    # Verify correct email code
    res = client.post("/auth/verify-email", json={"email": email, "code": code})
    assert res.status_code == 200
    assert res.json()["email_verified"] is True
