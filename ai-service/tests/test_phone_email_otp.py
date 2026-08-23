import pytest
from fastapi.testclient import TestClient
from main import app, otp_manager, email_service


client = TestClient(app)


def test_phone_otp_flow_and_mock_provider():
    phone = "+919876500001"
    ok, msg = otp_manager.request_otp(phone)
    assert ok is True

    # Retrieve sent OTP from mock provider
    sent_otp = otp_manager.provider.sent_otps.get(phone)
    assert sent_otp is not None
    assert len(sent_otp) == 6

    # Verify invalid OTP
    bad_res = client.post("/auth/verify-phone", json={"phone_number": phone, "otp": "000000"})
    assert bad_res.status_code == 400

    # Verify correct OTP
    good_res = client.post("/auth/verify-phone", json={"phone_number": phone, "otp": sent_otp})
    assert good_res.status_code == 200
    assert good_res.json()["phone_verified"] is True


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
