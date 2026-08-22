import re
from datetime import datetime

from parsing.transaction_model import Transaction
from parsing.merchant_normalizer import normalize_merchant


def parse_sms(sms: str) -> Transaction | None:
    """
    Parse common Indian banking SMS messages
    and convert them into a standard FinMitra Transaction.
    """

    text = sms.strip()
    lower_text = text.lower()

    # --------------------------------------------------
    # 1. Extract amount
    # --------------------------------------------------

    amount_match = re.search(
        r"(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)",
        text,
        re.IGNORECASE
    )

    if not amount_match:
        return None

    amount = float(
        amount_match.group(1).replace(",", "")
    )

    # --------------------------------------------------
    # 2. Transaction type
    # --------------------------------------------------

    debit_words = [
        "debited",
        "debit",
        "spent",
        "withdrawn",
        "paid"
    ]

    credit_words = [
        "credited",
        "credit",
        "received",
        "deposited"
    ]

    if any(word in lower_text for word in debit_words):
        transaction_type = "debit"

    elif any(word in lower_text for word in credit_words):
        transaction_type = "credit"

    else:
        transaction_type = "unknown"

    # --------------------------------------------------
    # 3. Detect channel
    # --------------------------------------------------

    channel = None

    channel_patterns = {
        "UPI": r"\bupi\b",
        "ATM": r"\batm\b",
        "NEFT": r"\bneft\b",
        "IMPS": r"\bimps\b",
        "RTGS": r"\brtgs\b",
        "NACH": r"\bnach\b",
        "ECS": r"\becs\b",
        "CARD": r"\b(?:card|pos)\b"
    }

    for name, pattern in channel_patterns.items():

        if re.search(pattern, text, re.IGNORECASE):
            channel = name
            break

    # --------------------------------------------------
    # 4. Extract date
    # --------------------------------------------------

    date_match = re.search(
        r"\b(\d{2})[-/](\d{2})[-/](\d{4})\b",
        text
    )

    if date_match:

        day = int(date_match.group(1))
        month = int(date_match.group(2))
        year = int(date_match.group(3))

        date = datetime(year, month, day)

    else:

        date = datetime.now()

    # --------------------------------------------------
    # 5. Extract merchant / counterparty
    # --------------------------------------------------

    merchant = None
    counterparty = None

    merchant_patterns = [
        r"(?:to|at)\s+([A-Za-z0-9&._-]+)"
    ]

    for pattern in merchant_patterns:

        merchant_match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if merchant_match:

            merchant = merchant_match.group(1).strip()

            break

    # Normalize merchant name
    merchant = normalize_merchant(merchant)

    # --------------------------------------------------
    # 6. Special handling for ATM
    # --------------------------------------------------

    if channel == "ATM":

        merchant = None
        counterparty = None
        category = "Cash Withdrawal"

    # --------------------------------------------------
    # 7. Special handling for NACH / ECS
    # --------------------------------------------------

    elif channel in ["NACH", "ECS"]:

        merchant = None

        if any(word in lower_text for word in [
            "emi",
            "loan",
            "installment"
        ]):
            category = "EMI"

        elif any(word in lower_text for word in [
            "sip",
            "mutual fund",
            "investment"
        ]):
            category = "Investment"

        else:
            category = "Recurring Payment"

    # --------------------------------------------------
    # 8. Salary / income
    # --------------------------------------------------

    elif any(word in lower_text for word in [
        "salary",
        "payroll"
    ]):

        category = "Salary"

        if transaction_type == "credit":
            counterparty = "Employer"

    # --------------------------------------------------
    # 9. Merchant-based categories
    # --------------------------------------------------

    else:

        merchant_lower = (
            merchant.lower()
            if merchant
            else ""
        )

        if any(word in merchant_lower for word in [
            "swiggy",
            "zomato",
            "restaurant",
            "food"
        ]):
            category = "Food"

        elif any(word in merchant_lower for word in [
            "amazon",
            "flipkart",
            "myntra"
        ]):
            category = "Shopping"

        elif any(word in merchant_lower for word in [
            "uber",
            "ola",
            "metro"
        ]):
            category = "Travel"

        elif any(word in merchant_lower for word in [
            "netflix",
            "spotify",
            "prime"
        ]):
            category = "Subscription"

        else:
            category = "Other"

    # --------------------------------------------------
    # 10. Extract reference number
    # --------------------------------------------------

    reference_number = None

    reference_patterns = [
        r"(?:ref|reference|txn|transaction)\s*(?:no|number|id)?\s*[:#-]?\s*([A-Za-z0-9]+)"
    ]

    for pattern in reference_patterns:

        reference_match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if reference_match:

            reference_number = reference_match.group(1)

            break

    # --------------------------------------------------
    # 11. Detect recurring transaction
    # --------------------------------------------------

    recurring_words = [
        "nach",
        "ecs",
        "recurring",
        "mandate",
        "emi",
        "sip",
        "subscription"
    ]

    recurring = any(
        word in lower_text
        for word in recurring_words
    )

    # --------------------------------------------------
    # 12. Generate transaction ID
    # --------------------------------------------------

    transaction_id = "SMS-" + str(abs(hash(text)))

    # --------------------------------------------------
    # 13. Confidence
    # --------------------------------------------------

    confidence = 0.80

    if channel is not None:
        confidence += 0.05

    if merchant is not None:
        confidence += 0.05

    confidence = round(
        min(confidence, 1.0),
        2
    )

    # --------------------------------------------------
    # 14. Create Transaction
    # --------------------------------------------------

    return Transaction(
        transaction_id=transaction_id,
        amount=amount,
        transaction_type=transaction_type,
        merchant=merchant,
        counterparty=counterparty,
        category=category,
        channel=channel,
        date=date,
        description=text,
        reference_number=reference_number,
        recurring=recurring,
        confidence=confidence
    )