import csv
from datetime import datetime

from parsing.transaction_model import Transaction


def parse_csv(file_path: str) -> list[Transaction]:

    transactions = []

    with open(file_path, "r", encoding="utf-8") as file:

        reader = csv.DictReader(file)

        for row in reader:

            amount = float(
                row["Amount"].replace(",", "").strip()
            )

            transaction_type = row["Type"].strip().lower()

            date = datetime.strptime(
                row["Date"].strip(),
                "%d-%m-%Y"
            )

            merchant = row.get("Merchant", "").strip() or None

            category = row.get(
                "Category",
                "Other"
            ).strip()

            channel = row.get(
                "Channel",
                ""
            ).strip() or None

            transaction = Transaction(
                transaction_id=row["TransactionID"].strip(),
                amount=amount,
                transaction_type=transaction_type,
                merchant=merchant,
                category=category,
                channel=channel,
                date=date,
                description=row.get(
                    "Description",
                    ""
                ).strip() or None,
                confidence=1.0
            )

            transactions.append(transaction)

    return transactions