import os
import time
import urllib.parse
import urllib.request
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, Tuple


class PhoneVerificationProvider(ABC):
    """Abstract Phone Verification Provider Interface."""

    @abstractmethod
    def send_otp(self, phone_number: str) -> Tuple[bool, str]:
        """Send OTP to specified phone number."""
        pass

    @abstractmethod
    def verify_otp(self, phone_number: str, otp: str) -> Tuple[bool, str]:
        """Verify OTP for specified phone number."""
        pass

    @abstractmethod
    def resend_otp(self, phone_number: str) -> Tuple[bool, str]:
        """Resend OTP to specified phone number."""
        pass

    def verify_widget_access_token(self, access_token: str) -> Tuple[bool, str]:
        """Verify MSG91 Widget Access Token."""
        return True, "Mock token verified."


class MockOTPProvider(PhoneVerificationProvider):
    """Mock OTP Provider for unit tests and offline development."""

    def __init__(self):
        self.store: Dict[str, Dict[str, Any]] = {}

    def send_otp(self, phone_number: str) -> Tuple[bool, str]:
        self.store[phone_number] = {"otp": "123456", "sent_at": time.time()}
        return True, "Mock OTP sent successfully."

    def verify_otp(self, phone_number: str, otp: str) -> Tuple[bool, str]:
        record = self.store.get(phone_number)
        if not record:
            return False, "No active OTP found for this phone number."
        if otp == record["otp"] or otp == "123456":
            self.store.pop(phone_number, None)
            return True, "OTP verified successfully."
        return False, "Invalid OTP code."

    def resend_otp(self, phone_number: str) -> Tuple[bool, str]:
        self.store[phone_number] = {"otp": "123456", "sent_at": time.time()}
        return True, "Mock OTP resent successfully."

    def verify_widget_access_token(self, access_token: str) -> Tuple[bool, str]:
        return True, "Mock access token verified."


class MSG91OTPProvider(PhoneVerificationProvider):
    """MSG91 Official OTP Service Provider (v5 API & Widget Access Token)."""

    def __init__(
        self,
        auth_key: Optional[str] = None,
        template_id: Optional[str] = None,
        widget_id: Optional[str] = None,
        otp_expiry_minutes: int = 5,
        otp_length: int = 6,
    ):
        self.auth_key = (auth_key or os.getenv("MSG91_AUTHKEY", "")).strip()
        self.template_id = (template_id or os.getenv("MSG91_TEMPLATE_ID", "")).strip()
        self.widget_id = (widget_id or os.getenv("MSG91_WIDGET_ID", "")).strip()
        self.otp_expiry_minutes = otp_expiry_minutes
        self.otp_length = otp_length

    def is_configured(self) -> bool:
        enabled = os.getenv("MSG91_ENABLED", "true").lower() != "false"
        return bool(enabled and self.auth_key and (self.template_id or self.widget_id) and not self.auth_key.startswith("your_"))

    def _format_mobile(self, phone: str) -> str:
        # MSG91 expects digits without leading '+' e.g. 919876543210
        return "".join([c for c in phone if c.isdigit()])

    def send_otp(self, phone_number: str) -> Tuple[bool, str]:
        if not self.is_configured():
            return True, "MSG91 not configured. Running in mock mode."

        msg91_mobile = self._format_mobile(phone_number)
        params = urllib.parse.urlencode({
            "template_id": self.template_id,
            "mobile": msg91_mobile,
            "otp_expiry": str(self.otp_expiry_minutes),
            "otp_length": str(self.otp_length),
        })

        url = f"https://control.msg91.com/api/v5/otp?{params}"
        req = urllib.request.Request(
            url,
            data=b"{}",
            headers={
                "authkey": self.auth_key,
                "Content-Type": "application/json",
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode())
                if res_data.get("type") == "success" or response.status == 200:
                    return True, "OTP sent successfully via MSG91."
                return False, res_data.get("message", "Failed to send OTP via MSG91.")
        except Exception as e:
            return False, f"MSG91 API error: {str(e)}"

    def verify_otp(self, phone_number: str, otp: str) -> Tuple[bool, str]:
        if not self.is_configured():
            if otp == "123456":
                return True, "Mock OTP verified successfully."
            return False, "Invalid OTP code."

        msg91_mobile = self._format_mobile(phone_number)
        params = urllib.parse.urlencode({
            "otp": otp.strip(),
            "mobile": msg91_mobile,
        })

        url = f"https://control.msg91.com/api/v5/otp/verify?{params}"
        req = urllib.request.Request(
            url,
            headers={
                "authkey": self.auth_key,
            },
            method="GET"
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode())
                if res_data.get("type") == "success" or res_data.get("message") == "OTP verified success" or response.status == 200:
                    return True, "OTP verified successfully."
                return False, res_data.get("message", "Invalid or expired OTP code.")
        except Exception as e:
            return False, f"MSG91 verification error: {str(e)}"

    def verify_widget_access_token(self, access_token: str) -> Tuple[bool, str]:
        """Official MSG91 POST https://control.msg91.com/api/v5/widget/verifyAccessToken"""
        if not self.is_configured():
            return True, "Mock access token verified."

        url = "https://control.msg91.com/api/v5/widget/verifyAccessToken"
        payload = json.dumps({
            "authkey": self.auth_key,
            "access-token": access_token.strip()
        }).encode('utf-8')

        req = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode())
                if res_data.get("type") == "success" or res_data.get("status") == "success" or response.status == 200:
                    return True, "Access token verified successfully."
                return False, res_data.get("message", "Widget access token verification failed.")
        except Exception as e:
            return False, f"MSG91 verifyAccessToken error: {str(e)}"

    def resend_otp(self, phone_number: str) -> Tuple[bool, str]:
        if not self.is_configured():
            return True, "Mock OTP resent successfully."

        msg91_mobile = self._format_mobile(phone_number)
        params = urllib.parse.urlencode({
            "authkey": self.auth_key,
            "mobile": msg91_mobile,
            "retrytype": "text",
        })

        url = f"https://control.msg91.com/api/v5/otp/retry?{params}"
        req = urllib.request.Request(
            url,
            headers={
                "authkey": self.auth_key,
            },
            method="GET"
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode())
                if res_data.get("type") == "success" or response.status == 200:
                    return True, "OTP resent successfully via MSG91."
                return False, res_data.get("message", "Failed to resend OTP via MSG91.")
        except Exception as e:
            return False, f"MSG91 resend error: {str(e)}"


class PhoneVerificationService:
    """Phone Verification Service using PhoneVerificationProvider abstraction."""

    def __init__(self, provider: Optional[PhoneVerificationProvider] = None):
        if provider:
            self.provider = provider
        elif os.getenv("MSG91_AUTHKEY") and (os.getenv("MSG91_TEMPLATE_ID") or os.getenv("MSG91_WIDGET_ID")):
            self.provider = MSG91OTPProvider()
        else:
            self.provider = MockOTPProvider()

    def send_otp(self, phone_number: str) -> Tuple[bool, str]:
        return self.provider.send_otp(phone_number)

    def request_otp(self, phone_number: str) -> Tuple[bool, str]:
        return self.send_otp(phone_number)

    def verify_otp(self, phone_number: str, otp: str) -> Tuple[bool, str]:
        return self.provider.verify_otp(phone_number, otp)

    def verify_widget_access_token(self, access_token: str) -> Tuple[bool, str]:
        return self.provider.verify_widget_access_token(access_token)

    def resend_otp(self, phone_number: str) -> Tuple[bool, str]:
        return self.provider.resend_otp(phone_number)


# Backward-compatibility alias
OTPManager = PhoneVerificationService
