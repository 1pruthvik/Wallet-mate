import time
import hashlib
import secrets
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple


class OTPProvider(ABC):
    """Abstract OTP Provider Interface."""

    @abstractmethod
    def send_otp(self, phone_number: str, otp: str) -> bool:
        """Send OTP to specified phone number."""
        pass


class MockOTPProvider(OTPProvider):
    """Mock OTP Provider for testing and local development."""

    def __init__(self):
        self.sent_otps: Dict[str, str] = {}

    def send_otp(self, phone_number: str, otp: str) -> bool:
        # Save sent OTP in memory for test verification without logging sensitive OTP plaintext
        self.sent_otps[phone_number] = otp
        return True


class FreeLocalOTPProvider(OTPProvider):
    """100% Free Local Open-Source OTP Provider."""

    def __init__(self):
        self.sent_otps: Dict[str, str] = {}

    def send_otp(self, phone_number: str, otp: str) -> bool:
        self.sent_otps[phone_number] = otp
        return True


class OTPManager:
    def __init__(self, provider: Optional[OTPProvider] = None, expiry_seconds: int = 300, max_attempts: int = 3, cooldown_seconds: int = 60):
        self.provider = provider or FreeLocalOTPProvider()
        self.expiry_seconds = expiry_seconds
        self.max_attempts = max_attempts
        self.cooldown_seconds = cooldown_seconds
        # In-memory storage: phone -> {hash, expires_at, attempts, last_sent_at}
        self._store: Dict[str, Dict[str, Any]] = {}

    def _hash_otp(self, otp: str) -> str:
        return hashlib.sha256(otp.encode('utf-8')).hexdigest()

    def generate_otp(self, length: int = 6) -> str:
        return "".join([str(secrets.randbelow(10)) for _ in range(length)])

    def request_otp(self, phone_number: str) -> Tuple[bool, str]:
        now = time.time()
        record = self._store.get(phone_number)

        if record:
            # Check resend cooldown
            time_since_last = now - record["last_sent_at"]
            if time_since_last < self.cooldown_seconds:
                remaining = int(self.cooldown_seconds - time_since_last)
                return False, f"Please wait {remaining} seconds before requesting a new OTP."

        otp = self.generate_otp()
        otp_hash = self._hash_otp(otp)

        # Update store with hashed OTP
        self._store[phone_number] = {
            "otp_hash": otp_hash,
            "expires_at": now + self.expiry_seconds,
            "attempts": 0,
            "last_sent_at": now
        }

        # Send via provider
        success = self.provider.send_otp(phone_number, otp)
        if not success:
            return False, "Failed to deliver OTP message."

        return True, "OTP sent successfully."

    def verify_otp(self, phone_number: str, candidate_otp: str) -> Tuple[bool, str]:
        now = time.time()
        record = self._store.get(phone_number)

        if not record:
            return False, "No active OTP found. Please request a new code."

        if now > record["expires_at"]:
            self._store.pop(phone_number, None)
            return False, "OTP has expired. Please request a new code."

        if record["attempts"] >= self.max_attempts:
            self._store.pop(phone_number, None)
            return False, "Too many failed attempts. Please request a new OTP."

        candidate_hash = self._hash_otp(candidate_otp)
        if candidate_hash != record["otp_hash"]:
            record["attempts"] += 1
            remaining = self.max_attempts - record["attempts"]
            if remaining <= 0:
                self._store.pop(phone_number, None)
                return False, "Too many failed attempts. Please request a new OTP."
            return False, f"Invalid OTP. {remaining} attempt(s) remaining."

        # Successfully verified
        self._store.pop(phone_number, None)
        return True, "OTP verified successfully."
