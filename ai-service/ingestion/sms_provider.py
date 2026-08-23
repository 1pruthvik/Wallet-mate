from typing import Dict, List, Optional, Any
from parsing.sms_parser import parse_sms
from parsing.transaction_model import Transaction
from ml.categorizer import categorize_transaction




FINANCIAL_SMS_SIGNALS = [
    "UPI", "DEBITED", "CREDITED", "RS.", "RS", "INR", "BANK", "TRANSACTION",
    "PAYMENT", "NEFT", "RTGS", "IMPS", "NACH", "EMI", "ATM", "CARD",
    "WITHDRAWN", "SALARY", "ALERT", "SPENT", "REFUND"
]


def is_candidate_financial_sms(sms_body: str) -> bool:
    """
    On-device / backend financial SMS signal check.
    Ensures non-financial personal SMS messages are excluded.
    """
    upper_body = sms_body.upper()
    return any(signal in upper_body for signal in FINANCIAL_SMS_SIGNALS)


class AndroidSMSProvider:
    """Ingestion provider for candidate SMS messages received from FinMitra Android Client."""

    def __init__(self):
        pass

    def process_sms_payload(self, user_id: str, payload: Dict[str, Any]) -> List[Transaction]:
        """
        Processes candidate SMS messages using FinMitra's existing SMS Parser.
        REUSES parsing.sms_parser.parse_sms without duplicating parser logic.
        """
        raw_messages = payload.get("messages", [])
        extracted_transactions: List[Transaction] = []

        for item in raw_messages:
            body = item.get("body", "")
            if not body or not is_candidate_financial_sms(body):
                continue

            # REUSE existing SMS parser
            parsed_txn = parse_sms(body)
            if parsed_txn:
                # Ensure user_id and source are attached
                parsed_txn.user_id = user_id
                parsed_txn.source = "android_sms"
                if not parsed_txn.transaction_id:
                    msg_id = item.get("message_id", f"sms_{len(extracted_transactions)}")
                    parsed_txn.transaction_id = f"sms_{msg_id}"
                extracted_transactions.append(parsed_txn)

        return extracted_transactions
