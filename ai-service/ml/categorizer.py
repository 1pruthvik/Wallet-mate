from typing import Optional

from parsing.transaction_model import Transaction


CATEGORIES = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Salary",
    "Investment",
    "EMI",
    "Cash Withdrawal",
    "Subscription",
    "Other"
]



MERCHANT_CATEGORY_RULES = {

    # Food
    "swiggy": "Food",
    "zomato": "Food",
    "dominos": "Food",
    "mcdonald": "Food",
    "mcdonalds": "Food",
    "starbucks": "Food",
    "kfc": "Food",
    "restaurant": "Food",
    "cafe": "Food",

    # Shopping
    "amazon": "Shopping",
    "flipkart": "Shopping",
    "myntra": "Shopping",
    "dmart": "Shopping",
    "bigbasket": "Shopping",
    "reliance trends": "Shopping",

    # Travel
    "uber": "Travel",
    "ola": "Travel",
    "metro": "Travel",
    "irctc": "Travel",
    "makemytrip": "Travel",
    "redbus": "Travel",

    # Entertainment
    "bookmyshow": "Entertainment",
    "pvr": "Entertainment",
    "inox": "Entertainment",

    # Subscriptions
    "netflix": "Subscription",
    "spotify": "Subscription",
    "prime": "Subscription",
    "hotstar": "Subscription",
    "youtube premium": "Subscription",

    # Healthcare
    "apollo": "Healthcare",
    "pharmacy": "Healthcare",
    "medplus": "Healthcare",
    "1mg": "Healthcare",

    # Bills
    "airtel": "Bills",
    "jio": "Bills",
    "vi": "Bills",
    "electricity": "Bills",
    "bescom": "Bills",
    "water bill": "Bills",

}


def categorize_transaction(
    merchant: Optional[str],
    description: Optional[str] = None
) -> str:
    """
    Categorize a transaction using merchant
    and description information.
    """

    merchant_text = (
        merchant.lower().strip()
        if merchant
        else ""
    )

    description_text = (
        description.lower().strip()
        if description
        else ""
    )

    # --------------------------------------------------
    # 1. Merchant-based classification
    # --------------------------------------------------

    for keyword, category in MERCHANT_CATEGORY_RULES.items():

        if keyword in merchant_text:

            return category

    # --------------------------------------------------
    # 2. Description-based classification
    # --------------------------------------------------

    if any(word in description_text for word in [
        "salary",
        "payroll"
    ]):
        return "Salary"

    if any(word in description_text for word in [
        "emi",
        "loan",
        "installment"
    ]):
        return "EMI"

    if any(word in description_text for word in [
        "sip",
        "mutual fund",
        "investment"
    ]):
        return "Investment"

    if any(word in description_text for word in [
        "electricity",
        "water bill",
        "gas bill",
        "recharge",
        "mobile bill",
        "internet bill"
    ]):
        return "Bills"

    if any(word in description_text for word in [
        "atm",
        "cash withdrawal",
        "cash withdrawn"
    ]):
        return "Cash Withdrawal"

    # --------------------------------------------------
    # 3. Unknown transaction
    # --------------------------------------------------

    return "Other"
    

def categorize_transaction_object( 
    transaction: Transaction
) -> Transaction:
    """
    Categorize a Transaction object and return
    the same transaction with an updated category.
    """

    category = categorize_transaction(
        transaction.merchant,
        transaction.description
    )

    transaction.category = category

    return transaction    