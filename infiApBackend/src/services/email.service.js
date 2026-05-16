const logger = require('../utils/logger');

const RESEND_API_URL = process.env.RESEND_API_URL || "https://api.resend.com/emails";
const DEFAULT_FROM_EMAIL = "InfiAP HRMS <onboarding@resend.dev>";

const isConfiguredForEmail = () => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

    if (!apiKey || !fromEmail) {
        return false;
    }

    const placeholderValues = [apiKey, fromEmail].some((value) =>
        typeof value === "string" &&
        (value.includes("your_resend") || value.includes("example.com"))
    );

    return !placeholderValues;
};

const sendEmail = async ({ to, subject, html }) => {
    if (!isConfiguredForEmail()) {
        logger.warn("Resend not configured. Skipping email delivery.");
        return false;
    }

    const response = await fetch(RESEND_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        logger.error("Resend API error", { error: errorText });
        throw new Error("Could not send email");
    }

    return true;
};

const sendVerificationEmail = async (email, token) => {
    try {
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
        const emailSent = await sendEmail({
            to: email,
            subject: "Verify Your Email - InfiAP HRMS",
            html: `
                <h1>Email Verification</h1>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationLink}">${verificationLink}</a>
                <p>This link will expire in 24 hours.</p>
            `,
        });

        if (emailSent) {
            logger.info("Verification email sent", { email });
        }

        return emailSent;
    } catch (error) {
        logger.error("Error sending verification email", { error: error.message });
        throw new Error("Could not send verification email");
    }
};

const sendLoginOTPEmail = async (email, otp) => {
    try {
        const emailSent = await sendEmail({
            to: email,
            subject: "Your InfiAP login verification code",
            html: `
                <h1>Secure Login Code</h1>
                <p>Your 6-digit verification code is:</p>
                <h2 style="letter-spacing: 4px;">${otp}</h2>
                <p>This code will expire in 10 minutes.</p>
            `,
        });

        if (emailSent) {
            logger.info("Login OTP email sent", { email });
        }

        return emailSent;
    } catch (error) {
        logger.error("Error sending login OTP email", { error: error.message });
        throw new Error("Could not send login OTP email");
    }
};

const sendBookingConfirmationEmail = async (email, name, date) => {
    try {
        await sendEmail({
            to: email,
            subject: "Meeting Request Received - InfiAP HRMS",
            html: `
                <h1>Meeting Request Received</h1>
                <p>Hi ${name},</p>
                <p>We have received your request for a meeting on <strong>${new Date(date).toLocaleString()}</strong>.</p>
                <p>Our team will review it and send you a Google Meet link shortly.</p>
                <br>
                <p>Best Regards,<br>AbhiProject Team</p>
            `,
        });
        logger.info("Booking confirmation email sent", { email });
    } catch (error) {
        logger.error("Error sending booking email", { error: error.message });
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const emailSent = await sendEmail({
            to: email,
            subject: "Password Reset - InfiAP HRMS",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Reset Your Password</h1>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password for your InfiAP HRMS account.
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Click the button below to reset your password. This link will expire in 1 hour.
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetLink}" 
                           style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="color: #4f46e5; font-size: 14px; word-break: break-all;">${resetLink}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 13px;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                    </p>
                    <p style="color: #9ca3af; font-size: 13px; margin-top: 8px;">
                        InfiAP Tech Solutions
                    </p>
                </div>
            `,
        });

        if (emailSent) {
            logger.info("Password reset email sent", { email });
        }

        return emailSent;
    } catch (error) {
        logger.error("Error sending password reset email", { error: error.message });
        throw new Error("Could not send password reset email");
    }
};

const sendMeetingLinkEmail = async (email, name, date, link) => {
    try {
        await sendEmail({
            to: email,
            subject: "Meeting Confirmed - InfiAP HRMS",
            html: `
                <h1>Meeting Confirmed</h1>
                <p>Hi ${name},</p>
                <p>Your meeting has been confirmed for <strong>${new Date(date).toLocaleString()}</strong>.</p>
                <p>You can join using the link below:</p>
                <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Join Google Meet</a>
                <p>Or copy this link: ${link}</p>
                <br>
                <p>Best Regards,<br>AbhiProject Team</p>
            `,
        });
        logger.info("Meeting link email sent", { email });
    } catch (error) {
        logger.error("Error sending meeting link email", { error: error.message });
    }
};

module.exports = {
    sendVerificationEmail,
    sendLoginOTPEmail,
    sendPasswordResetEmail,
    sendBookingConfirmationEmail,
    sendMeetingLinkEmail,
    isConfiguredForEmail,
};