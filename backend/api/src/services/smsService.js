const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

let twilioClient = null;
if (accountSid && authToken) {
    try {
        twilioClient = twilio(accountSid, authToken);
    } catch (err) {
        console.warn("Failed to initialize Twilio client:", err.message);
    }
}

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

const maskPhoneNumber = (e164Phone) => {
    if (!e164Phone) return "";
    const clean = e164Phone.replace(/\s+/g, "");
    if (clean.length <= 6) return clean;

    const prefix = clean.slice(0, 3);
    const lastDigits = clean.slice(-4);
    const masked = "*".repeat(Math.max(4, clean.length - 7));
    return `${prefix} ${masked}${lastDigits}`;
};

const sendVerificationCode = async (toPhone) => {
    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!normalizedPhone) {
        throw new Error("Please provide a valid mobile number with country code.");
    }

    if (!accountSid || !authToken || !verifyServiceSid || !twilioClient) {
        console.warn("[Twilio Verify Notice] Twilio credentials not configured in backend/api/.env");
        return {
            status: "mock_pending",
            to: normalizedPhone,
            maskedPhone: maskPhoneNumber(normalizedPhone),
        };
    }

    try {
        const verification = await twilioClient.verify.v2
            .services(verifyServiceSid)
            .verifications.create({
                to: normalizedPhone,
                channel: "sms",
            });

        return {
            status: verification.status,
            to: normalizedPhone,
            maskedPhone: maskPhoneNumber(normalizedPhone),
        };
    } catch (error) {
        console.error("Twilio Verify send error:", error);
        throw new Error(error.message || "Failed to send SMS verification code.");
    }
};

const checkVerificationCode = async (toPhone, code) => {
    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!normalizedPhone) {
        throw new Error("Invalid mobile number format.");
    }

    if (!code || code.trim().length !== 6) {
        throw new Error("Please enter the complete 6-digit verification code received on your phone.");
    }

    if (!accountSid || !authToken || !verifyServiceSid || !twilioClient) {
        return {
            approved: true,
            to: normalizedPhone,
        };
    }

    try {
        const verificationCheck = await twilioClient.verify.v2
            .services(verifyServiceSid)
            .verificationChecks.create({
                to: normalizedPhone,
                code: code.trim(),
            });

        if (verificationCheck.status === "approved") {
            return {
                approved: true,
                to: normalizedPhone,
            };
        }

        return {
            approved: false,
            message: "The verification code is incorrect or has expired.",
        };
    } catch (error) {
        console.error("Twilio Verify check error:", error);
        throw new Error(error.message || "Failed to verify the SMS code.");
    }
};

module.exports = {
    normalizePhoneNumber,
    maskPhoneNumber,
    sendVerificationCode,
    checkVerificationCode,
};
