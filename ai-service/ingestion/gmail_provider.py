import re
import hashlib
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from parsing.transaction_model import Transaction
from ml.categorizer import categorize_transaction



FINANCIAL_KEYWORDS = [
    "BANK", "UPI", "TRANSACTION", "DEBIT", "CREDIT", "SALARY", "PAYMENT",
    "CARD", "EMI", "NACH", "SWIGGY", "AMAZON", "FLIPKART", "NETFLIX",
    "SUBSCRIPTION", "CREDITED", "DEBITED", "RS", "INR", "ALERT", "REFUND"
]


class GmailOAuthManager:
    """Manages Google OAuth authorization URLs and token state securely."""

    def __init__(self, client_id: str = "MOCK_GMAIL_CLIENT_ID", client_secret: str = "MOCK_GMAIL_CLIENT_SECRET"):
        self.client_id = client_id
        self.client_secret = client_secret
        self.scope = "https://www.googleapis.com/auth/gmail.readonly"
        # User ID -> encrypted credentials token map
        self._tokens: Dict[str, Dict[str, Any]] = {}

    def get_authorization_url(self, redirect_uri: str, state: str) -> str:
        """Generate Google OAuth 2.0 authorization URL with minimal read-only scope."""
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = (
            f"?client_id={self.client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&response_type=code"
            f"&scope={self.scope}"
            f"&access_type=offline"
            f"&prompt=consent"
            f"&state={state}"
        )
        return base_url + params

    def exchange_code_for_tokens(self, code: str, user_id: str) -> Dict[str, Any]:
        """Exchange auth code for access/refresh tokens (mocked securely for testing)."""
        mock_credentials = {
            "user_id": user_id,
            "access_token": f"mock_access_token_{hashlib.sha256(code.encode()).hexdigest()[:16]}",
            "refresh_token": f"mock_refresh_token_{hashlib.sha256(user_id.encode()).hexdigest()[:16]}",
            "token_type": "Bearer",
            "expires_in": 3600,
            "scope": self.scope,
            "connected_at": datetime.now(timezone.utc).isoformat()
        }
        self._tokens[user_id] = mock_credentials
        return {"status": "connected", "scope": self.scope}

    def get_token_status(self, user_id: str) -> bool:
        return user_id in self._tokens

    def revoke_credentials(self, user_id: str) -> bool:
        if user_id in self._tokens:
            self._tokens.pop(user_id, None)
            return True
        return False


class GmailDataProvider:
    """Ingestion provider for reading and parsing financial transactions from Gmail."""

    def __init__(self, oauth_manager: GmailOAuthManager):
        self.oauth_manager = oauth_manager
        # Track sync state per user: user_id -> {last_sync_time, processed_hashes, history_id}
        self._sync_state: Dict[str, Dict[str, Any]] = {}
        # Mock mailbox storage for tests: user_id -> List[message_dict]
        self._mock_mailboxes: Dict[str, List[Dict[str, Any]]] = {}

    def seed_mock_financial_emails(self, user_id: str, emails: List[Dict[str, Any]]):
        """Seed mock email inbox for testing."""
        self._mock_mailboxes[user_id] = emails

    def is_financial_message(self, message: Dict[str, Any]) -> bool:
        """Check subject/body/sender for financial signals based on rules."""
        subject = message.get("subject", "").upper()
        body = message.get("body", "").upper()
        sender = message.get("sender", "").upper()
        content = f"{subject} {body} {sender}"

        return any(keyword in content for keyword in FINANCIAL_KEYWORDS)

    def search_financial_messages(self, user_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
        """Search messages matching financial criteria without downloading full mailbox."""
        all_messages = self._mock_mailboxes.get(user_id, [])
        financial_msgs = [m for m in all_messages if self.is_financial_message(m)]
        return financial_msgs[:max_results]

    def fetch_message(self, user_id: str, message_id: str) -> Optional[Dict[str, Any]]:
        all_messages = self._mock_mailboxes.get(user_id, [])
        for msg in all_messages:
            if msg.get("id") == message_id:
                return msg
        return None

    def fetch_message_metadata(self, user_id: str, message_id: str) -> Optional[Dict[str, Any]]:
        msg = self.fetch_message(user_id, message_id)
        if msg:
            return {
                "id": msg.get("id"),
                "sender": msg.get("sender"),
                "subject": msg.get("subject"),
                "date": msg.get("date")
            }
        return None

    def _parse_email_body_to_transaction(self, message: Dict[str, Any], user_id: str) -> Optional[Transaction]:
        """
        Parse raw financial email into a structured Transaction object and discard raw email text.
        """
        body = message.get("body", "")
        subject = message.get("subject", "")
        date_str = message.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))

        # Amount extraction: Rs. 1,500.00 or INR 500 or Rs 250
        amount = 0.0
        amount_match = re.search(r'(?:Rs\.?|INR|\$)\s*([\d,]+(?:\.\d{2})?)', f"{subject} {body}", re.IGNORECASE)
        if amount_match:
            raw_amt = amount_match.group(1).replace(",", "")
            try:
                amount = float(raw_amt)
            except ValueError:
                amount = 0.0

        if amount <= 0.0:
            return None

        # Determine transaction type (debit/credit)
        txn_type = "expense"
        if re.search(r'credited|received|salary|refund', f"{subject} {body}", re.IGNORECASE):
            txn_type = "income"

        # Merchant detection
        merchant = "Unknown Merchant"
        merchant_match = re.search(r'(?:at|to|from|vpa|paid to)\s+([A-Za-z0-9\s\.\&\-]+?)(?:\.|on|ref|via|for|$)', f"{subject} {body}", re.IGNORECASE)
        if merchant_match:
            merchant = merchant_match.group(1).strip()
            if len(merchant) > 30:
                merchant = merchant[:30].strip()

        # Categorize using existing categorizer
        category = categorize_transaction(merchant, description=f"{subject} {body}")

        # Ref number extraction
        ref_num = None
        ref_match = re.search(r'(?:ref|txn|upi|rrn)\s*(?:no|id|num)?\s*:?\s*([A-Za-z0-9]+)', f"{subject} {body}", re.IGNORECASE)
        if ref_match:
            ref_num = ref_match.group(1).strip()

        txn_id = f"gmail_{message.get('id', hashlib.md5(f'{user_id}_{amount}_{date_str}'.encode()).hexdigest()[:12])}"

        return Transaction(
            transaction_id=txn_id,
            user_id=user_id,
            amount=amount,
            transaction_type=txn_type,
            merchant=merchant,
            category=category,
            channel="Email",
            date=date_str,
            description=subject or body[:50],
            reference_number=ref_num,
            source="gmail",
            confidence=0.85
        )

    def sync_incremental_messages(self, user_id: str) -> Dict[str, Any]:
        """
        Perform incremental email sync. Returns sync metric counters.
        """
        if not self.oauth_manager.get_token_status(user_id):
            return {
                "success": False,
                "error": "Gmail account not connected or authorized."
            }

        state = self._sync_state.setdefault(user_id, {
            "last_sync": None,
            "processed_hashes": set(),
            "history_id": 1000
        })

        all_messages = self._mock_mailboxes.get(user_id, [])
        messages_scanned = len(all_messages)
        financial_messages = [m for m in all_messages if self.is_financial_message(m)]
        financial_messages_found = len(financial_messages)

        extracted_transactions: List[Transaction] = []
        duplicates_ignored = 0

        for msg in financial_messages:
            msg_hash = hashlib.sha256(f"{msg.get('id')}_{msg.get('date')}".encode()).hexdigest()
            if msg_hash in state["processed_hashes"]:
                duplicates_ignored += 1
                continue

            txn = self._parse_email_body_to_transaction(msg, user_id)
            if txn:
                extracted_transactions.append(txn)
                state["processed_hashes"].add(msg_hash)

        now_iso = datetime.now(timezone.utc).isoformat()
        state["last_sync"] = now_iso
        state["history_id"] += len(financial_messages)

        return {
            "success": True,
            "messages_scanned": messages_scanned,
            "financial_messages_found": financial_messages_found,
            "transactions_extracted": len(extracted_transactions),
            "duplicates_ignored": duplicates_ignored,
            "last_sync": now_iso,
            "transactions": extracted_transactions
        }
