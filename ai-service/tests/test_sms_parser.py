from parsing.sms_parser import parse_sms


def test_upi_transaction():

    sms = "Rs.500 debited from A/c XX1234 via UPI to SWIGGY on 22-08-2026"

    transaction = parse_sms(sms)

    assert transaction is not None
    assert transaction.amount == 500
    assert transaction.transaction_type == "debit"
    assert transaction.merchant == "SWIGGY"
    assert transaction.category == "Food"
    assert transaction.channel == "UPI"


def test_atm_transaction():

    sms = "Rs.1500 debited from A/c XX1234 via ATM on 22-08-2026"

    transaction = parse_sms(sms)

    assert transaction is not None
    assert transaction.amount == 1500
    assert transaction.transaction_type == "debit"
    assert transaction.channel == "ATM"
    assert transaction.category == "Cash Withdrawal"
    assert transaction.merchant is None


def test_nach_emi():

    sms = "Rs.8000 debited from A/c XX1234 via NACH for EMI on 22-08-2026"

    transaction = parse_sms(sms)

    assert transaction is not None
    assert transaction.amount == 8000
    assert transaction.channel == "NACH"
    assert transaction.category == "EMI"
    assert transaction.recurring is True


def test_imps_shopping():

    sms = "Rs.1200 debited via IMPS to AMAZON on 22-08-2026"

    transaction = parse_sms(sms)

    assert transaction is not None
    assert transaction.amount == 1200
    assert transaction.channel == "IMPS"
    assert transaction.merchant == "AMAZON"
    assert transaction.category == "Shopping"
def test_merchant_normalization_swiggy():

    sms = "Rs.799 debited via UPI to Swiggy India Pvt Ltd on 22-08-2026"

    transaction = parse_sms(sms)

    assert transaction is not None
    assert transaction.merchant == "SWIGGY"
    assert transaction.category == "Food"


def test_merchant_normalization_amazon():

    sms = "Rs.1299 debited via UPI to Amazon India on 22-08-2026"

    transaction = parse_sms(sms)

    assert transaction is not None
    assert transaction.merchant == "AMAZON"
    assert transaction.category == "Shopping"    
