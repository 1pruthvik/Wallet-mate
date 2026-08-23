from typing import Dict, List, Any
from datetime import datetime, timezone
from auth.consent import UserConsentManager
from ingestion.gmail_provider import GmailOAuthManager
from ingestion.service import PersonalDataIngestionService


class PrivacyService:
    """Manages privacy controls, consent queries, data summary, source revocations, and data deletion."""

    def __init__(self, consent_manager: UserConsentManager, oauth_manager: GmailOAuthManager, ingestion_service: PersonalDataIngestionService):
        self.consent_manager = consent_manager
        self.oauth_manager = oauth_manager
        self.ingestion_service = ingestion_service

    def get_data_sources(self, user_id: str) -> Dict[str, Any]:
        consents = self.consent_manager.get_user_consents(user_id)
        gmail_connected = self.oauth_manager.get_token_status(user_id)
        gmail_sync_state = self.ingestion_service.gmail_provider._sync_state.get(user_id, {})

        sources = {
            "phone": {"verified": True},
            "email": {"verified": True},
            "gmail": {
                "connected": gmail_connected and self.consent_manager.is_source_authorized(user_id, "GMAIL_READ"),
                "last_sync": gmail_sync_state.get("last_sync"),
                "scope": "https://www.googleapis.com/auth/gmail.readonly"
            },
            "sms": {
                "enabled": self.consent_manager.is_source_authorized(user_id, "SMS_FINANCIAL_MESSAGES"),
                "description": "Financial SMS messages parsed locally on device"
            },
            "csv": {
                "available": True
            }
        }

        return {
            "user_id": user_id,
            "data_sources": sources,
            "consent_records": [c.to_dict() for c in consents]
        }

    def revoke_data_source(self, user_id: str, source: str) -> Dict[str, Any]:
        source_clean = source.upper()

        if source_clean in ["GMAIL", "GMAIL_READ"]:
            self.oauth_manager.revoke_credentials(user_id)
            self.consent_manager.revoke_consent(user_id, "GMAIL_READ")
            # Clear Gmail sync cache for user
            self.ingestion_service.gmail_provider._sync_state.pop(user_id, None)
            return {"success": True, "message": "Gmail access disconnected and credentials revoked successfully."}

        elif source_clean in ["SMS", "SMS_FINANCIAL_MESSAGES"]:
            self.consent_manager.revoke_consent(user_id, "SMS_FINANCIAL_MESSAGES")
            return {"success": True, "message": "SMS financial data access disabled successfully."}

        else:
            revoked = self.consent_manager.revoke_consent(user_id, source)
            return {"success": revoked, "message": f"Source {source} revoked." if revoked else "Source not found."}

    def get_data_summary(self, user_id: str) -> Dict[str, Any]:
        txns = self.ingestion_service.get_user_transactions(user_id)
        source_counts: Dict[str, int] = {}
        for t in txns:
            source_counts[t.source] = source_counts.get(t.source, 0) + 1

        gmail_sync_state = self.ingestion_service.gmail_provider._sync_state.get(user_id, {})

        return {
            "user_id": user_id,
            "total_transactions_stored": len(txns),
            "transactions_by_source": source_counts,
            "gmail_last_sync": gmail_sync_state.get("last_sync"),
            "connected_sources": self.get_data_sources(user_id)["data_sources"]
        }

    def delete_all_user_data(self, user_id: str) -> Dict[str, Any]:
        """Completely delete user credentials, raw caches, stored transactions, and consent history."""
        # Revoke Gmail OAuth credentials
        self.oauth_manager.revoke_credentials(user_id)

        # Clear transactions
        if user_id in self.ingestion_service._user_transactions:
            self.ingestion_service._user_transactions.pop(user_id, None)

        # Clear sync caches
        self.ingestion_service.gmail_provider._sync_state.pop(user_id, None)
        self.ingestion_service.gmail_provider._mock_mailboxes.pop(user_id, None)

        # Clear consent records
        self.consent_manager._consents.pop(user_id, None)

        return {
            "success": True,
            "message": "All user data, credentials, and transaction histories have been permanently deleted.",
            "deleted_at": datetime.now(timezone.utc).isoformat()
        }
