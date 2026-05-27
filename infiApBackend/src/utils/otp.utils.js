const crypto = require("crypto");

const OTP_HASH_SECRET = process.env.OTP_HASH_SECRET || crypto.randomBytes(32).toString("hex");
const OTP_TTL_SECONDS = parseInt(process.env.OTP_TTL_SECONDS, 10) || 60;
const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60;
const OTP_MAX_SEND_PER_HOUR = parseInt(process.env.OTP_MAX_SEND_PER_HOUR, 10) || 5;
const OTP_MAX_VERIFY_ATTEMPTS = parseInt(process.env.OTP_MAX_VERIFY_ATTEMPTS, 10) || 5;

const ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const NUMERIC_CHARS = "0123456789";

function generateAlphanumericOTP(length = 6) {
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += ALPHANUMERIC_CHARS.charAt(crypto.randomInt(0, ALPHANUMERIC_CHARS.length));
    }
    return otp;
}

function generateNumericOTP(length = 6) {
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += NUMERIC_CHARS.charAt(crypto.randomInt(0, NUMERIC_CHARS.length));
    }
    return otp;
}

function hashOtp(otp) {
    return crypto.createHmac("sha256", OTP_HASH_SECRET).update(String(otp)).digest("hex");
}

function verifyOtpHash(otp, storedHash) {
    if (!otp || !storedHash) return false;
    try {
        const incomingHash = hashOtp(otp);
        const storedBuf = Buffer.from(storedHash, "hex");
        const incomingBuf = Buffer.from(incomingHash, "hex");
        if (storedBuf.length !== incomingBuf.length) return false;
        return crypto.timingSafeEqual(storedBuf, incomingBuf);
    } catch {
        return false;
    }
}

function maskEmail(email) {
    if (!email || !email.includes("@")) return email;
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `*@${domain}`;
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

function maskPhone(phone) {
    if (!phone) return phone;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 4) return "****";
    const visible = digits.slice(-4);
    return `${phone.replace(/\d/g, "").slice(0, 3)}${"*".repeat(digits.length - 4)}${visible}`;
}

function getOtpExpiry() {
    return new Date(Date.now() + OTP_TTL_SECONDS * 1000);
}

function isOtpExpired(expiresAt) {
    if (!expiresAt) return true;
    return Date.now() > new Date(expiresAt).getTime();
}

function isLocked(lockUntil) {
    if (!lockUntil) return false;
    return Date.now() < new Date(lockUntil).getTime();
}

function getLockRetryMinutes(lockUntil) {
    if (!lockUntil) return 0;
    return Math.ceil((new Date(lockUntil).getTime() - Date.now()) / 1000 / 60);
}

module.exports = {
    generateAlphanumericOTP,
    generateNumericOTP,
    hashOtp,
    verifyOtpHash,
    maskEmail,
    maskPhone,
    getOtpExpiry,
    isOtpExpired,
    isLocked,
    getLockRetryMinutes,
    OTP_TTL_SECONDS,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_MAX_SEND_PER_HOUR,
    OTP_MAX_VERIFY_ATTEMPTS,
};
