const logger = require("../utils/logger");

let twilioClient = null;
try {
    const twilio = require("twilio");
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
} catch {
    // Twilio not installed; will fallback to console
}

async function sendSmsOtp(phone, otp) {
    const message = `Your InfiAP verification code is: ${otp}. This code will expire in 60 seconds. Do not share it with anyone.`;

    // Attempt Twilio if configured
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
            const result = await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone,
            });
            logger.info("SMS OTP sent via Twilio", { phone: maskPhone(phone), sid: result.sid });
            return { success: true, provider: "twilio", sid: result.sid };
        } catch (err) {
            logger.warn("Twilio SMS failed, falling back to log", { error: err.message });
        }
    }

    // Fallback: log for dev/demo; return visible so UI can display it
    logger.info("SMS OTP (dev mode — no SMS provider configured)", { phone: maskPhone(phone), otp });
    return { success: true, provider: "dev_log", devOtp: otp };
}

function maskPhone(phone) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 4) return "****";
    return `+${digits.slice(0, digits.length - 4).replace(/\d/g, "*")}${digits.slice(-4)}`;
}

module.exports = { sendSmsOtp };
