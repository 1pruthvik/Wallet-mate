import pytest
from fastapi.testclient import TestClient
from main import app, gmail_oauth_manager, ingestion_service


client = TestClient(app)


def test_gmail_oauth_connect_and_callback():
    user_id = "usr_gmail_test_1"
    
    # 1. Connect URL endpoint
    conn_res = client.get(f"/auth/gmail/connect?user_id={user_id}")
    assert conn_res.status_code == 200
    assert "https://accounts.google.com/o/oauth2/v2/auth" in conn_res.json()["authorization_url"]
    assert "gmail.readonly" in conn_res.json()["scope"]

    # 2. Callback endpoint
    cb_res = client.get(f"/auth/gmail/callback?code=mock_code_123&state={user_id}")
    assert cb_res.status_code == 200
    assert cb_res.json()["success"] is True

    # 3. Status check
    st_res = client.get(f"/auth/gmail/status?user_id={user_id}")
    assert st_res.status_code == 200
    assert st_res.json()["connected"] is True


def test_gmail_financial_message_filtering_and_sync():
    user_id = "usr_gmail_sync_user"
    
    # Authorize user
    client.get(f"/auth/gmail/callback?code=mock_code_xyz&state={user_id}")

    # Seed mock emails
    mock_emails = [
        {
            "id": "msg_001",
            "sender": "alerts@hdfcbank.com",
            "subject": "Rs 1500.00 debited from A/C **4321 for Swiggy",
            "body": "Your account **4321 was debited by Rs 1500.00 for SWIGGY transaction. Ref UPI/123456.",
            "date": "2026-08-23"
        },
        {
            "id": "msg_002",
            "sender": "newsletter@tech.com",
            "subject": "Weekly Tech Digest",
            "body": "Check out the latest tech news!",
            "date": "2026-08-23"
        }
    ]
    ingestion_service.gmail_provider.seed_mock_financial_emails(user_id, mock_emails)

    # Trigger incremental sync endpoint
    sync_res = client.post(f"/data/gmail/sync?user_id={user_id}")
    assert sync_res.status_code == 200
    data = sync_res.json()

    assert data["success"] is True
    assert data["messages_scanned"] == 2
    assert data["financial_messages_found"] == 1
    assert data["transactions_extracted"] == 1

    # Verify duplicate message sync is ignored on second sync run
    sync_res2 = client.post(f"/data/gmail/sync?user_id={user_id}")
    assert sync_res2.status_code == 200
    assert sync_res2.json()["duplicates_ignored"] >= 1
