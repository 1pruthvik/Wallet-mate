import pytest
from fastapi.testclient import TestClient
from main import app
from auth.models import User, hash_password, verify_password


client = TestClient(app)


def test_user_model_fields():
    user = User(phone_number="+919876543210", email="test@example.com")
    assert user.user_id is not None
    assert user.phone_number == "+919876543210"
    assert user.email == "test@example.com"
    assert user.phone_verified is False
    assert user.email_verified is False
    assert user.consent_version == "1.0"
    assert "gmail_read" in user.data_permissions
    assert user.status == "active"


def test_password_hashing():
    raw_pw = "SuperSecure123!"
    p_hash = hash_password(raw_pw)
    assert p_hash != raw_pw
    assert verify_password(p_hash, raw_pw) is True
    assert verify_password(p_hash, "WrongPassword") is False


def test_user_registration_and_login_flow():
    reg_payload = {
        "phone_number": "+919999900001",
        "email": "user1@finmitra.com",
        "password": "Password123!"
    }
    res = client.post("/auth/register", json=reg_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user"]["email"] == "user1@finmitra.com"
    assert data["user"]["phone_verified"] is False

    # Login with registered user
    login_res = client.post("/auth/login", json={"identifier": "user1@finmitra.com", "password": "Password123!"})
    assert login_res.status_code == 200
    assert login_res.json()["success"] is True

    # Duplicate email registration attempt
    dup_res = client.post("/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
