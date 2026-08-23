import pytest
from fastapi.testclient import TestClient
from main import app


client = TestClient(app)


def test_android_sms_import_and_existing_parser_reuse():
    user_id = "usr_sms_test_user"
    payload = {
        "user_id": user_id,
        "source": "android_sms",
        "messages": [
            {
                "message_id": "android_101",
                "sender": "HDFCBK",
                "timestamp": "2026-08-23T10:00:00Z",
                "body": "Rs 250.00 debited from A/C **1111 at ZOMATO on 23-AUG-26. UPI Ref 998877."
            },
            {
                "message_id": "android_102",
                "sender": "PERSONAL",
                "timestamp": "2026-08-23T10:05:00Z",
                "body": "Hey, what are your plans for dinner tonight?"
            }
        ]
    }

    res = client.post("/data/sms/import", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["success"] is True
    assert data["messages_received"] == 2
    assert data["transactions_extracted"] == 1
    assert data["transactions_added"] == 1
