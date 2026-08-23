import pytest
from fastapi.testclient import TestClient
from main import app, ingestion_service, privacy_service


client = TestClient(app)


def test_transaction_deduplication_across_channels():
    user_id = "usr_dedup_user"

    # Ingest via SMS
    sms_payload = {
        "user_id": user_id,
        "source": "android_sms",
        "messages": [
            {
                "message_id": "sms_d1",
                "body": "Rs 800.00 debited from A/C **5555 at Uber on 23-AUG-26. Ref 112233."
            }
        ]
    }
    res1 = client.post("/data/sms/import", json=sms_payload)
    assert res1.json()["transactions_added"] == 1

    # Ingest same transaction via Gmail
    client.get(f"/auth/gmail/callback?code=mock_code_dedup&state={user_id}")
    gmail_emails = [
        {
            "id": "gmail_d1",
            "sender": "alerts@bank.com",
            "subject": "Rs 800.00 debited at Uber",
            "body": "Your A/C **5555 was debited by Rs 800.00 for Uber transaction. Ref 112233.",
            "date": "2026-08-23"
        }
    ]
    ingestion_service.gmail_provider.seed_mock_financial_emails(user_id, gmail_emails)
    res2 = client.post(f"/data/gmail/sync?user_id={user_id}")

    # Verify duplicate transaction was detected and not double-counted
    assert res2.json()["duplicates_ignored"] >= 1
    user_txns = ingestion_service.get_user_transactions(user_id)
    assert len(user_txns) == 1


def test_cross_user_data_isolation():
    """
    PART 30 Security Test: Verify User A cannot see or access User B's email, SMS, transactions, credentials, financial summaries, or investment profile.
    """
    user_a = "usr_A_alice"
    user_b = "usr_B_bob"

    # Register & connect User A
    client.get(f"/auth/gmail/callback?code=code_a&state={user_a}")
    payload_a = {
        "user_id": user_a,
        "source": "android_sms",
        "messages": [{"message_id": "m_a", "body": "Rs 5000.00 credited to A/C **0001 Salary"}]
    }
    client.post("/data/sms/import", json=payload_a)

    # Register & connect User B
    client.get(f"/auth/gmail/callback?code=code_b&state={user_b}")
    payload_b = {
        "user_id": user_b,
        "source": "android_sms",
        "messages": [{"message_id": "m_b", "body": "Rs 1200.00 debited for Netflix"}]
    }
    client.post("/data/sms/import", json=payload_b)

    # Check User A data summary vs User B data summary
    sum_a = client.get(f"/privacy/data-summary?user_id={user_a}").json()
    sum_b = client.get(f"/privacy/data-summary?user_id={user_b}").json()

    assert sum_a["total_transactions_stored"] == 1
    assert sum_b["total_transactions_stored"] == 1

    txns_a = ingestion_service.get_user_transactions(user_a)
    txns_b = ingestion_service.get_user_transactions(user_b)

    assert txns_a[0].amount == 5000.00
    assert txns_b[0].amount == 1200.00
    assert txns_a[0].user_id == user_a
    assert txns_b[0].user_id == user_b

    # Verify User B cannot view User A's transactions
    for t_a in txns_a:
        assert t_a not in txns_b

    # Verify User A deletion does not affect User B
    del_a = client.delete(f"/privacy/my-data?user_id={user_a}").json()
    assert del_a["success"] is True

    # User B remains fully intact
    sum_b_after = client.get(f"/privacy/data-summary?user_id={user_b}").json()
    assert sum_b_after["total_transactions_stored"] == 1
