# FINMITRA ANDROID SMS INTEGRATION SPECIFICATION

## Overview
This document specifies the integration architecture between the FinMitra Android Client and the FinMitra FastAPI Backend for financial SMS data ingestion.

---

## 1. Native & Backend Separation Architecture

```
+-------------------------------------------------------+
|                FINMITRA ANDROID CLIENT               |
|                                                       |
| 1. User Consent & Disclosure Screen                   |
| 2. Android BroadcastReceiver / SMS Consent API       |
| 3. On-Device Financial Signal Filter                  |
| 4. Minimal Payload Construction                       |
+---------------------------+---------------------------+
                            | HTTPS (POST /data/sms/import)
                            v
+-------------------------------------------------------+
|                 FINMITRA FASTAPI BACKEND              |
|                                                       |
| 1. Bearer Token Auth & User Scoping                   |
| 2. Reuses Existing `parse_sms` Parser                 |
| 3. Transaction Normalization & Categorization          |
| 4. Cross-Channel Deduplication                        |
+-------------------------------------------------------+
```

---

## 2. Google Play Store Policy Compliance

1. **Sensitive Permission Scope**:
   - `READ_SMS` permission is treated as high-risk under Google Play Developer Policy.
   - Broad `READ_SMS` access is requested **only** if FinMitra is designated as a financial/budget management application with core SMS parsing functionality.
   - Safer alternative: **SMS User Consent API** / **SMS Retriever API** or explicit user file import.

2. **Prominent Disclosure & Consent**:
   - Before requesting SMS access, the app presents a standalone prominent disclosure screen explaining that SMS messages are read **exclusively to extract bank/UPI financial transactions**.

3. **Data Minimization & Local Filtering**:
   - Non-financial personal SMS (family messages, OTPs, promotional spam) **NEVER** leave the Android device.
   - Filter criteria:
     ```
     FINANCIAL SIGNALS = ["UPI", "DEBITED", "CREDITED", "RS.", "INR", "BANK", "NEFT", "RTGS", "IMPS", "NACH", "EMI", "ATM", "SALARY"]
     ```

---

## 3. Transmission Payload Spec

```json
{
  "source": "android_sms",
  "messages": [
    {
      "message_id": "android_msg_98412",
      "sender": "HDFCBK",
      "timestamp": "2026-08-23T14:30:00Z",
      "body": "Rs 450.00 debited from a/c **1234 on 23-AUG-26 at Swiggy. UPI Ref 6234918234."
    }
  ]
}
```
