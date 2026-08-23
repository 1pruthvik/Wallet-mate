import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ConsentRecord(BaseModel):
    consent_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    data_source: str  # GMAIL_READ, SMS_FINANCIAL_MESSAGES, CSV_IMPORT, MANUAL
    scope: str
    consent_version: str = "1.0"
    granted_at: datetime = Field(default_factory=get_utc_now)
    revoked_at: Optional[datetime] = None
    is_active: bool = True

    def to_dict(self) -> Dict[str, Any]:
        data = self.model_dump()
        data["granted_at"] = self.granted_at.isoformat()
        data["revoked_at"] = self.revoked_at.isoformat() if self.revoked_at else None
        return data


class UserConsentManager:
    """Manages explicit user consent tracking and revocations per source."""

    def __init__(self):
        # Storage: user_id -> List[ConsentRecord]
        self._consents: Dict[str, List[ConsentRecord]] = {}

    def grant_consent(self, user_id: str, data_source: str, scope: str, consent_version: str = "1.0") -> ConsentRecord:
        user_records = self._consents.setdefault(user_id, [])

        # Revoke existing active consent for this data_source if any
        for rec in user_records:
            if rec.data_source == data_source and rec.is_active:
                rec.is_active = False
                rec.revoked_at = get_utc_now()

        new_record = ConsentRecord(
            user_id=user_id,
            data_source=data_source,
            scope=scope,
            consent_version=consent_version,
            granted_at=get_utc_now(),
            is_active=True
        )
        user_records.append(new_record)
        return new_record

    def revoke_consent(self, user_id: str, data_source: str) -> bool:
        user_records = self._consents.get(user_id, [])
        revoked_any = False
        now = get_utc_now()

        for rec in user_records:
            if rec.data_source.upper() == data_source.upper() and rec.is_active:
                rec.is_active = False
                rec.revoked_at = now
                revoked_any = True

        return revoked_any

    def get_user_consents(self, user_id: str) -> List[ConsentRecord]:
        return self._consents.get(user_id, [])

    def is_source_authorized(self, user_id: str, data_source: str) -> bool:
        user_records = self._consents.get(user_id, [])
        for rec in user_records:
            if rec.data_source.upper() == data_source.upper() and rec.is_active:
                return True
        return False
