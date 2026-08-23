import uuid
import hashlib
import os
from datetime import datetime, timezone
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field, EmailStr


def generate_uuid() -> str:
    return str(uuid.uuid4())


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    """Secure salt + sha256 password hashing."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + key.hex()


def verify_password(stored_hash: str, password: str) -> bool:
    """Verify password against stored salt:hash."""
    try:
        salt_hex, key_hex = stored_hash.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return new_key == key
    except Exception:
        return False


class User(BaseModel):
    user_id: str = Field(default_factory=generate_uuid)
    phone_number: str
    email: str
    phone_verified: bool = False
    email_verified: bool = False
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
    consent_version: str = "1.0"
    data_permissions: Dict[str, bool] = Field(default_factory=lambda: {
        "gmail_read": False,
        "sms_read": False,
        "csv_import": True,
        "manual_input": True,
    })
    status: str = "active"  # active, suspended, pending
    password_hash: Optional[str] = Field(default=None, exclude=True)

    def to_dict(self) -> Dict[str, Any]:
        data = self.model_dump()
        data["created_at"] = self.created_at.isoformat()
        data["updated_at"] = self.updated_at.isoformat()
        return data


class UserRegisterRequest(BaseModel):
    phone_number: str
    email: str
    password: str


class VerifyPhoneRequest(BaseModel):
    phone_number: str
    otp: str


class VerifyEmailRequest(BaseModel):
    email: str
    code: str
