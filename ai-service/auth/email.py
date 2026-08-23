import time
import hashlib
import secrets
from typing import Dict, Any, Tuple, Optional


class EmailVerificationService:
    """Service to handle email verification code generation, delivery, and verification."""

    def __init__(self, expiry_seconds: int = 600, max_attempts: int = 3, cooldown_seconds: int = 60):
        self.expiry_seconds = expiry_seconds
        self.max_attempts = max_attempts
        self.cooldown_seconds = cooldown_seconds
        # In-memory store: email -> {code_hash, expires_at, attempts, last_sent_at}
        self._store: Dict[str, Dict[str, Any]] = {}
        # In-memory record of sent codes for testing mock inspection
        self.sent_codes: Dict[str, str] = {}

    def _hash_code(self, code: str) -> str:
        return hashlib.sha256(code.encode('utf-8')).hexdigest()

    def generate_code(self, length: int = 6) -> str:
        return "".join([str(secrets.randbelow(10)) for _ in range(length)])

    def send_verification_email(self, email: str) -> Tuple[bool, str]:
        email_clean = email.lower().strip()
        now = time.time()
        record = self._store.get(email_clean)

        if record:
            time_since_last = now - record["last_sent_at"]
            if time_since_last < self.cooldown_seconds:
                remaining = int(self.cooldown_seconds - time_since_last)
                return False, f"Please wait {remaining} seconds before requesting a new email code."

        code = self.generate_code()
        code_hash = self._hash_code(code)

        self._store[email_clean] = {
            "code_hash": code_hash,
            "expires_at": now + self.expiry_seconds,
            "attempts": 0,
            "last_sent_at": now
        }
        self.sent_codes[email_clean] = code
        return True, "Verification email sent successfully."

    def verify_email_code(self, email: str, candidate_code: str) -> Tuple[bool, str]:
        email_clean = email.lower().strip()
        now = time.time()
        record = self._store.get(email_clean)

        if not record:
            return False, "No verification request found for this email address."

        if now > record["expires_at"]:
            self._store.pop(email_clean, None)
            return False, "Verification code has expired. Please request a new code."

        if record["attempts"] >= self.max_attempts:
            self._store.pop(email_clean, None)
            return False, "Maximum verification attempts exceeded. Please request a new code."

        record["attempts"] += 1
        candidate_hash = self._hash_code(candidate_code.strip())

        if candidate_hash == record["code_hash"]:
            self._store.pop(email_clean, None)
            return True, "Email verified successfully."
        else:
            remaining = self.max_attempts - record["attempts"]
            return False, f"Invalid verification code. {remaining} attempt(s) remaining."
