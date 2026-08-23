from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Transaction(BaseModel):
    """
    Standard transaction format used throughout FinMitra.
    """

    transaction_id: str

    amount: float = Field(gt=0)

    transaction_type: str
    # debit / credit

    merchant: Optional[str] = None

    counterparty: Optional[str] = None

    category: str

    channel: Optional[str] = None
    # UPI / ATM / NEFT / IMPS / RTGS / NACH / ECS / CARD

    date: datetime

    description: Optional[str] = None

    account_id: Optional[str] = None

    reference_number: Optional[str] = None

    recurring: bool = False

    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0
    )

    user_id: Optional[str] = None

    source: Optional[str] = None