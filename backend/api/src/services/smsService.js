const twilio = require("twilio");

<<<<<<< HEAD
=======
// Environment configurations
>>>>>>> origin/nivish
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

<<<<<<< HEAD
=======
/**
 * Normalizes any phone input into international E.164 standard format (+<country><digits>)
 */
>>>>>>> origin/nivish
const normalizePhoneNumber = (phone, countryCode = "+91") => {
    if (!phone) return null;

    const trimmed = phone.toString().trim();
<<<<<<< HEAD
=======
    // If already has +, remove spaces/dashes
>>>>>>> origin/nivish
    if (trimmed.startsWith("+")) {
        const clean = "+" + trimmed.slice(1).replace(/\D/g, "");
        if (/^\+[1-9]\d{7,14}$/.test(clean)) return clean;
    }

    const digitsOnly = trimmed.replace(/\D/g, "");
    if (!digitsOnly || digitsOnly.length < 7) return null;

    const cleanCountry = countryCode.startsWith("+") ? countryCode : `+${countryCode.replace(/\D/g, "")}`;

<<<<<<< HEAD
=======
    // If starts with country code digits already
>>>>>>> origin/nivish
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
        return `+${digitsOnly}`;
    }

    return `${cleanCountry}${digitsOnly}`;
};

<<<<<<< HEAD
=======
/**
 * Masks phone number for safe UI display (+91 ******3210)
 */
>>>>>>> origin/nivish
const maskPhoneNumber = (e164Phone) => {
    if (!e164Phone) return "";
    const clean = e164Phone.replace(/\s+/g, "");
    if (clean.length <= 6) return clean;

<<<<<<< HEAD
    const prefix = clean.slice(0, 3);
=======
    const prefix = clean.slice(0, 3); // e.g. +91
>>>>>>> origin/nivish
    const lastDigits = clean.slice(-4);
    const masked = "*".repeat(Math.max(4, clean.length - 7));
    return `${prefix} ${masked}${lastDigits}`;
};

<<<<<<< HEAD
=======
/**
 * Initiates real SMS OTP via Twilio Verify Service
 */
>>>>>>> origin/nivish
const sendVerificationCode = async (toPhone) => {
    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!normalizedPhone) {
        throw new Error("Please provide a valid mobile number with country code.");
    }

    if (!accountSid || !authToken || !verifyServiceSid || !twilioClient) {
<<<<<<< HEAD
        console.warn("[Twilio Verify Notice] Twilio credentials not configured in backend/api/.env");
        return {
            status: "mock_pending",
            to: normalizedPhone,
            maskedPhone: maskPhoneNumber(normalizedPhone),
        };
=======
        // Clear and explicit server config notice if Twilio credentials are missing in .env
        console.warn("[Twilio Verify Notice] Twilio credentials not configured in backend/api/.env");
        throw new Error(
            "SMS service is not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in your backend .env file to receive real SMS."
        );
>>>>>>> origin/nivish
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
<<<<<<< HEAD
        throw new Error(error.message || "Failed to send SMS verification code.");
    }
};

=======
        if (error.status === 429) {
            throw new Error("Too many verification attempts for this phone number. Please wait a few minutes before trying again.");
        }
        if (error.code === 60200 || error.code === 21211) {
            throw new Error("The mobile number format is invalid. Please check and try again.");
        }
        throw new Error(error.message || "Failed to send SMS verification code. Please try again.");
    }
};

/**
 * Verifies the 6-digit OTP received by user via Twilio Verify Service
 */
>>>>>>> origin/nivish
const checkVerificationCode = async (toPhone, code) => {
    const normalizedPhone = normalizePhoneNumber(toPhone);
    if (!normalizedPhone) {
        throw new Error("Invalid mobile number format.");
    }

    if (!code || code.trim().length !== 6) {
        throw new Error("Please enter the complete 6-digit verification code received on your phone.");
    }

    if (!accountSid || !authToken || !verifyServiceSid || !twilioClient) {
<<<<<<< HEAD
        return {
            approved: true,
            to: normalizedPhone,
        };
=======
        throw new Error(
            "SMS verification service is not configured on the server. Please check TWILIO credentials in backend .env."
        );
>>>>>>> origin/nivish
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
<<<<<<< HEAD
            message: "The verification code is incorrect or has expired.",
        };
    } catch (error) {
        console.error("Twilio Verify check error:", error);
=======
            message: "The verification code is incorrect or has expired. Please check your SMS or request a new code.",
        };
    } catch (error) {
        console.error("Twilio Verify check error:", error);
        if (error.code === 20404 || error.status === 404) {
            throw new Error("Verification code has expired or was not found. Please request a new code.");
        }
>>>>>>> origin/nivish
        throw new Error(error.message || "Failed to verify the SMS code.");
    }
};

module.exports = {
    normalizePhoneNumber,
    maskPhoneNumber,
    sendVerificationCode,
    checkVerificationCode,
};
