import os
import sys

def load_env_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip("'").strip('"')
            if k and not os.environ.get(k):
                os.environ[k] = v

def check_msg91_config():
    # Attempt to load local env files
    load_env_file(".env")
    load_env_file("../backend/api/.env")

    enabled = os.getenv("MSG91_ENABLED", "true").lower() != "false"
    auth_key = (os.getenv("MSG91_AUTHKEY") or "").strip()
    template_id = (os.getenv("MSG91_TEMPLATE_ID") or "").strip()
    widget_id = (os.getenv("MSG91_WIDGET_ID") or "").strip()

    is_auth_configured = bool(auth_key and not auth_key.startswith("your_"))
    is_template_configured = bool(template_id and not template_id.startswith("your_"))
    is_widget_configured = bool(widget_id and not widget_id.startswith("your_"))

    is_configured = bool(enabled and is_auth_configured and (is_template_configured or is_widget_configured))

    print("==================================================")
    print("FINMITRA MSG91 OTP CONFIGURATION CHECK")
    print("==================================================")
    print(f"MSG91 Enabled: {enabled}")
    print(f"MSG91 AuthKey Status: {'CONFIGURED' if is_auth_configured else 'NOT_CONFIGURED'}")
    print(f"MSG91 Template ID Status: {'CONFIGURED' if is_template_configured else 'NOT_SET'}")
    print(f"MSG91 Widget ID Status: {'CONFIGURED' if is_widget_configured else 'NOT_SET'}")
    print("--------------------------------------------------")
    print(f"MSG91 OTP Status: {'CONFIGURED' if is_configured else 'NOT_CONFIGURED (Mock Fallback Active)'}")
    print("==================================================")
    
    return is_configured

if __name__ == "__main__":
    check_msg91_config()
