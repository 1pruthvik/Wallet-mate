from ml.categorizer import categorize_transaction


def test_food_category():

    assert categorize_transaction("SWIGGY") == "Food"
    assert categorize_transaction("STARBUCKS") == "Food"


def test_shopping_category():

    assert categorize_transaction("AMAZON") == "Shopping"
    assert categorize_transaction("DMART") == "Shopping"


def test_travel_category():

    assert categorize_transaction("UBER") == "Travel"
    assert categorize_transaction("IRCTC") == "Travel"


def test_entertainment_category():

    assert categorize_transaction("BOOKMYSHOW") == "Entertainment"


def test_subscription_category():

    assert categorize_transaction("NETFLIX") == "Subscription"


def test_healthcare_category():

    assert categorize_transaction("APOLLO PHARMACY") == "Healthcare"


def test_bills_category():

    assert categorize_transaction("AIRTEL") == "Bills"


def test_description_category():

    assert categorize_transaction(
        "UNKNOWN",
        "Monthly EMI payment"
    ) == "EMI"

    assert categorize_transaction(
        "UNKNOWN",
        "Monthly salary credited"
    ) == "Salary"

    assert categorize_transaction(
        "UNKNOWN",
        "ATM cash withdrawal"
    ) == "Cash Withdrawal"


def test_unknown_category():

    assert categorize_transaction(
        "ABC ELECTRONICS",
        "Payment"
    ) == "Other"