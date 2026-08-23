const https = require("https");
const http = require("http");

/**
 * FINMITRA MSG91 OFFICIAL OTP SERVICE & WIDGET VERIFIER
 * -----------------------------------------------------
 * Official MSG91 OTP API v5 integration (https://docs.msg91.com/otp)
 *
 * Support APIs:
 * - Send OTP: POST https://control.msg91.com/api/v5/otp
 * - Verify OTP: GET https://control.msg91.com/api/v5/otp/verify
 * - Resend OTP: GET https://control.msg91.com/api/v5/otp/retry
 * - Verify Access Token: POST https://control.msg91.com/api/v5/widget/verifyAccessToken
 *
 * SECURITY & PRIVACY:
 * - NO application-level production OTP generation.
 * - NO plain-text OTP logging.
 * - NO Auth Key leakage to client/responses.
 * - MockOTPProvider default when MSG91_AUTHKEY is unconfigured for safe offline pytest/dev.
 */

// In-memory cooldown tracking for rate limiting
const resendCooldownMap = new Map();
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

/**
 * Normalizes any phone input into E.164 standard (+91XXXXXXXXXX)
 */
const normalizePhoneNumber = (phone, countryCode = "+91") => {
    if (!phone) return null;

    const trimmed = phone.toString().trim();
    if (trimmed.startsWith("+")) {
        const clean = "+" + trimmed.slice(1).replace(/\D/g, "");
        if (/^\+[1-9]\d{7,14}$/.test(clean)) return clean;
    }

    const digitsOnly = trimmed.replace(/\D/g, "");
    if (!digitsOnly || digitsOnly.length < 7) return null;

    const cleanCountry = countryCode.startsWith("+") ? countryCode : `+${countryCode.replace(/\D/g, "")}`;

    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
        return `+${digitsOnly}`;
    }

    return `${cleanCountry}${digitsOnly}`;
};

/**
 * Formats E.164 phone number into MSG91 API mobile format (digits without leading '+', e.g. 919876543210)
 */
const formatForMsg91 = (e164Phone) => {
    if (!e164Phone) return "";
    return e164Phone.replace(/\D/g, "");
};

/**
 * Masks phone number for safe UI display (+91 ******1234)
 */
const maskPhoneNumber = (e164Phone) => {
    if (!e164Phone) return "";
    const clean = e164Phone.replace(/\s+/g, "");
    if (clean.length <= 6) return clean;

    const prefix = clean.slice(0, 3);
    const lastDigits = clean.slice(-4);
    const masked = "*".repeat(Math.max(4, clean.length - 7));
    return `${prefix} ${masked}${lastDigits}`;
};

/**
 * Checks if MSG91 is enabled and configured in environment
 */
const isMsg91Configured = () => {
    const enabled = process.env.MSG91_ENABLED !== "false";
    const authKey = (process.env.MSG91_AUTHKEY || "").trim();
    const templateId = (process.env.MSG91_TEMPLATE_ID || "").trim();
    const widgetId = (process.env.MSG91_WIDGET_ID || "").trim();
    return enabled && Boolean(authKey && (templateId || widgetId) && !authKey.includes("your_msg91_authkey"));
};

/**
 * Makes an HTTPS request to MSG91 official APIs
 */
const makeMsg91ApiCall = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, body: { type: "raw", data } });
                }
            });
        });

        req.on("error", (err) => reject(err));
        req.on("timeout", () => { req.destroy(); reject(new Error("MSG91 API request timed out")); });

        if (postData) {
            req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
        }
        req.end();
    });
};

/**
 * Sends OTP via MSG91 Official API (POST /api/v5/otp) or Mock Provider
 */
const sendVerificationCode = async (toPhone) => {
    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!normalizedPhone) {
        throw new Error("Please provide a valid mobile number with country code.");
    }

    const now = Date.now();
    const lastSent = resendCooldownMap.get(normalizedPhone);
    if (lastSent && now - lastSent < RESEND_COOLDOWN_MS) {
        const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);
        throw new Error(`Please wait ${remaining} seconds before requesting a new OTP.`);
    }

    const masked = maskPhoneNumber(normalizedPhone);

    if (!isMsg91Configured()) {
        resendCooldownMap.set(normalizedPhone, now);
        console.log(`[MSG91 OTP Mock Mode] OTP request received for ${masked} (MSG91_AUTHKEY not set).`);
        return {
            status: "sent",
            to: normalizedPhone,
            maskedPhone: masked,
            isMock: true,
        };
    }

    const authKey = process.env.MSG91_AUTHKEY.trim();
    const templateId = (process.env.MSG91_TEMPLATE_ID || "").trim();
    const msg91Mobile = formatForMsg91(normalizedPhone);
    const otpExpiryMinutes = process.env.MSG91_OTP_EXPIRY_MINUTES || "5";
    const otpLength = process.env.MSG91_OTP_LENGTH || "6";

    // Official MSG91 Send OTP v5 API: POST https://control.msg91.com/api/v5/otp
    const queryParams = new URLSearchParams({
        template_id: templateId,
        mobile: msg91Mobile,
        otp_expiry: otpExpiryMinutes,
        otp_length: otpLength,
    }).toString();

    const options = {
        hostname: "control.msg91.com",
        path: `/api/v5/otp?${queryParams}`,
        method: "POST",
        headers: {
            "authkey": authKey,
            "Content-Type": "application/json",
        },
        timeout: 10000,
    };

    try {
        const response = await makeMsg91ApiCall(options, {});
        if (response.body?.type === "success" || response.statusCode === 200) {
            resendCooldownMap.set(normalizedPhone, now);
            return {
                status: "sent",
                to: normalizedPhone,
                maskedPhone: masked,
                isMock: false,
            };
        }

        const msg = response.body?.message || response.body?.msg || "Failed to send OTP via MSG91";
        console.error("MSG91 Send OTP Error:", response.body);
        throw new Error(msg);
    } catch (err) {
        console.error("MSG91 Send OTP exception:", err.message);
        throw new Error(err.message || "Failed to send OTP message. Please try again.");
    }
};

/**
 * Verifies MSG91 Widget Access Token via Official POST https://control.msg91.com/api/v5/widget/verifyAccessToken
 */
const verifyWidgetAccessToken = async (accessToken) => {
    if (!accessToken || typeof accessToken !== "string") {
        throw new Error("Access token is required for widget verification.");
    }

    if (!isMsg91Configured()) {
        return {
            approved: true,
            to: "+919800000000",
            isMock: true,
        };
    }

    const authKey = process.env.MSG91_AUTHKEY.trim();
    const options = {
        hostname: "control.msg91.com",
        path: "/api/v5/widget/verifyAccessToken",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        timeout: 10000,
    };

    const payload = {
        "authkey": authKey,
        "access-token": accessToken.trim(),
    };

    try {
        const response = await makeMsg91ApiCall(options, payload);
        if (response.body?.type === "success" || response.body?.status === "success" || response.statusCode === 200) {
            const mobile = response.body?.mobile || response.body?.identifier || response.body?.message;
            const normalized = normalizePhoneNumber(mobile) || mobile;
            return {
                approved: true,
                to: normalized,
                rawResponse: response.body,
                isMock: false,
            };
        }

        const errMsg = response.body?.message || response.body?.msg || "Widget access token verification failed.";
        return {
            approved: false,
            message: errMsg,
        };
    } catch (err) {
        console.error("MSG91 verifyAccessToken exception:", err.message);
        throw new Error(err.message || "Failed to verify widget access token.");
    }
};

/**
 * Verifies OTP via MSG91 Official API (GET /api/v5/otp/verify) or Widget Access Token
 */
const checkVerificationCode = async (toPhone, code, accessToken = null) => {
    if (accessToken || (code && code.length > 20)) {
        return await verifyWidgetAccessToken(accessToken || code);
    }

    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!normalizedPhone) {
        throw new Error("Invalid mobile number format.");
    }

    const cleanCode = (code || "").toString().trim();
    if (cleanCode.length < 4 || cleanCode.length > 8 || !/^\d+$/.test(cleanCode)) {
        throw new Error("Please enter a valid 6-digit verification OTP.");
    }

    if (!isMsg91Configured()) {
        // Safe mock verification for test suites
        return {
            approved: true,
            to: normalizedPhone,
            isMock: true,
        };
    }

    const authKey = process.env.MSG91_AUTHKEY.trim();
    const msg91Mobile = formatForMsg91(normalizedPhone);

    // Official MSG91 Verify OTP v5 API: GET https://control.msg91.com/api/v5/otp/verify
    const queryParams = new URLSearchParams({
        otp: cleanCode,
        mobile: msg91Mobile,
    }).toString();

    const options = {
        hostname: "control.msg91.com",
        path: `/api/v5/otp/verify?${queryParams}`,
        method: "GET",
        headers: {
            "authkey": authKey,
        },
        timeout: 10000,
    };

    try {
        const response = await makeMsg91ApiCall(options);

        if (response.body?.type === "success" || response.body?.message === "OTP verified success" || response.statusCode === 200) {
            return {
                approved: true,
                to: normalizedPhone,
                isMock: false,
            };
        }

        const errMsg = response.body?.message || response.body?.msg || "Invalid or expired OTP code.";
        return {
            approved: false,
            message: errMsg,
        };
    } catch (err) {
        console.error("MSG91 Verify OTP exception:", err.message);
        throw new Error(err.message || "Failed to verify OTP code.");
    }
};

/**
 * Resends OTP via MSG91 Official API (GET /api/v5/otp/retry)
 */
const resendVerificationCode = async (toPhone, retryType = "text") => {
    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!normalizedPhone) {
        throw new Error("Invalid mobile number format.");
    }

    const now = Date.now();
    const lastSent = resendCooldownMap.get(normalizedPhone);
    if (lastSent && now - lastSent < RESEND_COOLDOWN_MS) {
        const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - lastSent)) / 1000);
        throw new Error(`Please wait ${remaining} seconds before requesting a new OTP.`);
    }

    const masked = maskPhoneNumber(normalizedPhone);

    if (!isMsg91Configured()) {
        resendCooldownMap.set(normalizedPhone, now);
        return {
            status: "retry_sent",
            to: normalizedPhone,
            maskedPhone: masked,
            isMock: true,
        };
    }

    const authKey = process.env.MSG91_AUTHKEY.trim();
    const msg91Mobile = formatForMsg91(normalizedPhone);

    // Official MSG91 Resend/Retry OTP v5 API: GET https://control.msg91.com/api/v5/otp/retry
    const queryParams = new URLSearchParams({
        authkey: authKey,
        mobile: msg91Mobile,
        retrytype: retryType, // 'text' or 'voice'
    }).toString();

    const options = {
        hostname: "control.msg91.com",
        path: `/api/v5/otp/retry?${queryParams}`,
        method: "GET",
        headers: {
            "authkey": authKey,
        },
        timeout: 10000,
    };

    try {
        const response = await makeMsg91ApiCall(options);
        if (response.body?.type === "success" || response.statusCode === 200) {
            resendCooldownMap.set(normalizedPhone, now);
            return {
                status: "retry_sent",
                to: normalizedPhone,
                maskedPhone: masked,
                isMock: false,
            };
        }

        const msg = response.body?.message || response.body?.msg || "Failed to resend OTP via MSG91";
        throw new Error(msg);
    } catch (err) {
        console.error("MSG91 Resend OTP exception:", err.message);
        throw new Error(err.message || "Failed to resend OTP code.");
    }
};

module.exports = {
    normalizePhoneNumber,
    formatForMsg91,
    maskPhoneNumber,
    isMsg91Configured,
    sendVerificationCode,
    checkVerificationCode,
    verifyWidgetAccessToken,
    resendVerificationCode,
};
