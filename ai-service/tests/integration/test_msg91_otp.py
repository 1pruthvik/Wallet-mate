import os
import sys
from auth.otp import MSG91OTPProvider

def run_integration_test():
    is_enabled = os.getenv("MSG91_INTEGRATION_TEST", "false").lower() == "true"
    if not is_enabled:
        print("Skipping MSG91 Integration Test (Set MSG91_INTEGRATION_TEST=true to execute).")
        return

    provider = MSG91OTPProvider()
    if not provider.is_configured():
        print("MSG91 credentials not configured in environment. Integration test skipped.")
        return

    test_phone = os.getenv("MSG91_TEST_PHONE", "+919800000000")
    print(f"Running MSG91 Integration Test for phone: {test_phone}")
    
    success, msg = provider.send_otp(test_phone)
    print(f"Send OTP Result: success={success}, msg={msg}")
    
    if success:
        print("MSG91 integration test passed! Check recipient phone for SMS passcode.")
    else:
        print("MSG91 integration test failed.")

if __name__ == "__main__":
    run_integration_test()
