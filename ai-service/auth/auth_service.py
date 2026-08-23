from typing import Dict, Optional, Tuple, Any
from auth.models import User, hash_password, verify_password
from auth.otp import OTPManager
from auth.email import EmailVerificationService
from auth.consent import UserConsentManager


class AuthService:
    """Core Authentication Service managing users, credentials, OTP verification, and sessions."""

    def __init__(self, otp_manager: OTPManager, email_service: EmailVerificationService, consent_manager: UserConsentManager):
        self.otp_manager = otp_manager
        self.email_service = email_service
        self.consent_manager = consent_manager

        # In-memory user stores
        self._users_by_id: Dict[str, User] = {}
        self._users_by_email: Dict[str, User] = {}
        self._users_by_phone: Dict[str, User] = {}

    def register_user(self, phone_number: str, email: str, password: str) -> Tuple[bool, Any]:
        email_clean = email.lower().strip()
        phone_clean = phone_number.strip()

        if email_clean in self._users_by_email:
            return False, "An account with this email address already exists."

        if phone_clean in self._users_by_phone:
            return False, "An account with this phone number already exists."

        p_hash = hash_password(password)

        user = User(
            phone_number=phone_clean,
            email=email_clean,
            phone_verified=False,
            email_verified=False,
            password_hash=p_hash
        )

        self._users_by_id[user.user_id] = user
        self._users_by_email[email_clean] = user
        self._users_by_phone[phone_clean] = user

        # Trigger initial OTP and Email Verification
        self.otp_manager.request_otp(phone_clean)
        self.email_service.send_verification_email(email_clean)

        return True, user

    def authenticate_user(self, identifier: str, password: str) -> Tuple[bool, Any]:
        clean_id = identifier.lower().strip()
        user = self._users_by_email.get(clean_id) or self._users_by_phone.get(clean_id)

        if not user or not user.password_hash:
            return False, "Invalid email/phone number or password."

        if not verify_password(user.password_hash, password):
            return False, "Invalid email/phone number or password."

        return True, user

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self._users_by_id.get(user_id)

    def verify_phone(self, phone_number: str, otp: str) -> Tuple[bool, str]:
        phone_clean = phone_number.strip()
        success, msg = self.otp_manager.verify_otp(phone_clean, otp)

        if success:
            user = self._users_by_phone.get(phone_clean)
            if user:
                user.phone_verified = True

        return success, msg

    def verify_email(self, email: str, code: str) -> Tuple[bool, str]:
        email_clean = email.lower().strip()
        success, msg = self.email_service.verify_email_code(email_clean, code)

        if success:
            user = self._users_by_email.get(email_clean)
            if user:
                user.email_verified = True

        return success, msg
