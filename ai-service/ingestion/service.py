import re
import hashlib
from typing import Dict, List, Optional, Any, Tuple

from datetime import datetime
from parsing.transaction_model import Transaction
from parsing.csv_parser import parse_csv
from ml.categorizer import categorize_transaction

from ingestion.gmail_provider import GmailDataProvider, GmailOAuthManager
from ingestion.sms_provider import AndroidSMSProvider


class CSVProvider:
    """Ingestion provider for CSV transaction files."""

    def process_csv_content(self, user_id: str, csv_content: str) -> List[Transaction]:
        transactions = parse_csv(csv_content)
        for t in transactions:
            t.user_id = user_id
            t.source = "csv"
            if not t.transaction_id:
                t.transaction_id = f"csv_{hashlib.md5(f'{user_id}_{t.amount}_{t.date}_{t.merchant}'.encode()).hexdigest()[:12]}"
        return transactions


class ManualTransactionProvider:
    """Ingestion provider for manual transaction entries."""

    def create_manual_transaction(self, user_id: str, data: Dict[str, Any]) -> Transaction:
        merchant = data.get("merchant", "Manual Entry")
        category = data.get("category") or categorize_transaction(merchant, description=data.get("description", ""))
        amount_val = float(data.get("amount", 0.0))
        date_val = str(data.get("date", datetime.now().strftime("%Y-%m-%d")))
        raw_key = f"{user_id}_{amount_val}_{date_val}_{merchant}"
        txn_id = f"manual_{hashlib.md5(raw_key.encode()).hexdigest()[:12]}"

        txn = Transaction(
            transaction_id=txn_id,
            user_id=user_id,
            amount=amount_val,
            transaction_type=data.get("transaction_type", "expense"),
            merchant=merchant,
            category=category,
            channel=data.get("channel", "Manual"),
            date=date_val,
            description=data.get("description", "Manual transaction"),
            reference_number=data.get("reference_number"),
            source="manual",
            confidence=1.0
        )
        return txn


class TransactionDeduplicator:
    """Fingerprints and deduplicates transactions across multiple ingestion channels (Gmail, SMS, CSV, Manual)."""

    @staticmethod
    def generate_fingerprint(t: Transaction) -> str:
        # Normalize merchant name for deduplication
        merchant_str = (t.merchant or t.description or "unknown").lower()
        clean_merchant = re.sub(r'[^a-zA-Z0-9]', '', merchant_str)
        # Date string normalized to YYYY-MM-DD
        date_str = str(t.date).split("T")[0].split(" ")[0]
        # Reference number if available, otherwise amount + date + clean_merchant
        if t.reference_number:
            raw_key = f"{t.user_id}_{t.amount:.2f}_{t.reference_number.lower()}"
        else:
            raw_key = f"{t.user_id}_{t.amount:.2f}_{date_str}_{clean_merchant}"

        return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()


    def deduplicate(self, existing_transactions: List[Transaction], incoming_transactions: List[Transaction]) -> Tuple[List[Transaction], int]:
        existing_fingerprints = {self.generate_fingerprint(t) for t in existing_transactions}
        new_unique_txns: List[Transaction] = []
        duplicates_count = 0

        for incoming in incoming_transactions:
            fp = self.generate_fingerprint(incoming)
            if fp in existing_fingerprints:
                duplicates_count += 1
            else:
                existing_fingerprints.add(fp)
                new_unique_txns.append(incoming)

        return new_unique_txns, duplicates_count


class PersonalDataIngestionService:
    """Unified Personal Data Ingestion Service orchestrating Gmail, SMS, CSV, and Manual providers."""

    def __init__(self, oauth_manager: GmailOAuthManager):
        self.gmail_provider = GmailDataProvider(oauth_manager)
        self.sms_provider = AndroidSMSProvider()
        self.csv_provider = CSVProvider()
        self.manual_provider = ManualTransactionProvider()
        self.deduplicator = TransactionDeduplicator()

        # In-memory storage of transactions scoped strictly per user: user_id -> List[Transaction]
        self._user_transactions: Dict[str, List[Transaction]] = {}

    def get_user_transactions(self, user_id: str) -> List[Transaction]:
        return self._user_transactions.get(user_id, [])

    def store_transactions(self, user_id: str, new_txns: List[Transaction]) -> Dict[str, Any]:
        existing = self._user_transactions.setdefault(user_id, [])
        unique_txns, duplicates_ignored = self.deduplicator.deduplicate(existing, new_txns)
        existing.extend(unique_txns)

        return {
            "user_id": user_id,
            "added_count": len(unique_txns),
            "duplicates_ignored": duplicates_ignored,
            "total_user_transactions": len(existing)
        }

    def sync_gmail_data(self, user_id: str) -> Dict[str, Any]:
        sync_result = self.gmail_provider.sync_incremental_messages(user_id)
        if not sync_result.get("success"):
            return sync_result

        extracted = sync_result.get("transactions", [])
        store_res = self.store_transactions(user_id, extracted)

        return {
            "success": True,
            "source": "gmail",
            "messages_scanned": sync_result.get("messages_scanned", 0),
            "financial_messages_found": sync_result.get("financial_messages_found", 0),
            "transactions_extracted": len(extracted),
            "transactions_added": store_res["added_count"],
            "duplicates_ignored": sync_result.get("duplicates_ignored", 0) + store_res["duplicates_ignored"],
            "last_sync": sync_result.get("last_sync")
        }

    def import_sms_data(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        extracted = self.sms_provider.process_sms_payload(user_id, payload)
        store_res = self.store_transactions(user_id, extracted)

        return {
            "success": True,
            "source": "android_sms",
            "messages_received": len(payload.get("messages", [])),
            "transactions_extracted": len(extracted),
            "transactions_added": store_res["added_count"],
            "duplicates_ignored": store_res["duplicates_ignored"]
        }

    def import_csv_data(self, user_id: str, csv_content: str) -> Dict[str, Any]:
        extracted = self.csv_provider.process_csv_content(user_id, csv_content)
        store_res = self.store_transactions(user_id, extracted)

        return {
            "success": True,
            "source": "csv",
            "transactions_extracted": len(extracted),
            "transactions_added": store_res["added_count"],
            "duplicates_ignored": store_res["duplicates_ignored"]
        }

    def add_manual_transaction(self, user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        txn = self.manual_provider.create_manual_transaction(user_id, data)
        store_res = self.store_transactions(user_id, [txn])

        return {
            "success": True,
            "source": "manual",
            "transaction": txn.model_dump(),
            "added": store_res["added_count"] > 0
        }
