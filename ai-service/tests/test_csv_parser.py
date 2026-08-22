from parsing.csv_parser import parse_csv


def test_csv_parser():

    transactions = parse_csv("sample_transactions.csv")

    assert len(transactions) == 5

    assert transactions[0].amount == 799
    assert transactions[0].merchant == "SWIGGY"
    assert transactions[0].category == "Food"
    assert transactions[0].channel == "UPI"

    assert transactions[2].amount == 50000
    assert transactions[2].transaction_type == "credit"
    assert transactions[2].category == "Salary"
    assert transactions[2].channel == "NEFT"

    assert transactions[3].category == "Cash Withdrawal"
    assert transactions[3].channel == "ATM"

    assert transactions[4].category == "EMI"
    assert transactions[4].channel == "NACH"