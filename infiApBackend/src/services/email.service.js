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

const sendHrLoginOTPEmail = async (adminEmail, otp, hrName) => {
    try {
        const emailSent = await sendEmail({
            to: adminEmail,
            subject: "HR Login Verification Code - InfiAP HRMS",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">HR Login Verification</h1>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        An HR user <strong>${hrName}</strong> is attempting to log in for the first time.
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Please share this 6-digit verification code with them:
                    </p>
                    <h2 style="letter-spacing: 4px; color: #4f46e5; font-size: 32px; margin: 24px 0;">${otp}</h2>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                        This code will expire in 10 minutes.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 13px;">
                        If you did not create this HR account, please review your admin dashboard immediately.
                    </p>
                </div>
            `,
        });

        if (emailSent) {
            logger.info("HR login OTP email sent to admin", { adminEmail, hrName });
        }

        return emailSent;
    } catch (error) {
        logger.error("Error sending HR login OTP email to admin", { error: error.message });
        throw new Error("Could not send HR login OTP email");
    }
};

const sendProfileEditOTPEmail = async (targetEmail, otp, editorName, targetName, isSelfEdit = false) => {
    try {
        const subject = isSelfEdit
            ? "Profile Update Verification Code - InfiAP HRMS"
            : `Profile Edit Verification - InfiAP HRMS`;
        const actionText = isSelfEdit
            ? "You have requested to update your profile."
            : `<strong>${editorName}</strong> is attempting to edit your profile.`;
        const emailSent = await sendEmail({
            to: targetEmail,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">Profile Update Verification</h1>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        ${actionText}
                    </p>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        To authorize these changes, please use the following 6-digit verification code:
                    </p>
                    <h2 style="letter-spacing: 4px; color: #4f46e5; font-size: 32px; margin: 24px 0;">${otp}</h2>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                        This code will expire in 10 minutes.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    <p style="color: #9ca3af; font-size: 13px;">
                        If you did not request this change, please contact your administrator immediately.
                    </p>
                </div>
            `,
        });

        if (emailSent) {
            logger.info("Profile edit OTP email sent to target user", { targetEmail, editorName, targetName, isSelfEdit });
        }

        return emailSent;
    } catch (error) {
        logger.error("Error sending profile edit OTP email", { error: error.message });
        throw new Error("Could not send profile edit OTP email");
    }
};

const sendInterviewScheduledEmail = async (email, name, details) => {
    try {
        const {
            date, time, stage, mode,
            meetLink, location, phoneNumber,
            interviewer, assignedHRs
        } = details;

        const modeLabel = mode === "Online" ? "Google Meet (Online)" : mode === "Offline" ? "Office Location (On-site)" : "Phone Call";

        const extraRows = [];
        if (meetLink) {
            extraRows.push(`<tr><td style="padding:8px 0;color:#6b7280;font-weight:600;width:40%;">Google Meet Link</td><td style="padding:8px 0;color:#1f2937;"><a href="${meetLink}" style="color:#4f46e5;text-decoration:none;">${meetLink}</a></td></tr>`);
        }
        if (location) {
            extraRows.push(`<tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Office Location</td><td style="padding:8px 0;color:#1f2937;">${location}</td></tr>`);
        }
        if (phoneNumber) {
            extraRows.push(`<tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Phone Number</td><td style="padding:8px 0;color:#1f2937;">${phoneNumber}</td></tr>`);
        }
        if (Array.isArray(assignedHRs) && assignedHRs.length) {
            extraRows.push(`<tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Additional HRs</td><td style="padding:8px 0;color:#1f2937;">${assignedHRs.join(", ")}</td></tr>`);
        }

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background:#ffffff;">
            <div style="text-align:center;margin-bottom:24px;">
                <h1 style="color:#1f2937;font-size:22px;margin-bottom:8px;">Interview Scheduled</h1>
                <p style="color:#6b7280;font-size:14px;margin:0;">Hi ${name}, your interview has been confirmed.</p>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;width:40%;">Interview Stage</td><td style="padding:8px 0;color:#1f2937;">${stage || "Technical Interview"}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Date</td><td style="padding:8px 0;color:#1f2937;">${date}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Time</td><td style="padding:8px 0;color:#1f2937;">${time || "—"}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Meeting Mode</td><td style="padding:8px 0;color:#1f2937;">${modeLabel}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-weight:600;">Primary Interviewer</td><td style="padding:8px 0;color:#1f2937;">${interviewer || "—"}</td></tr>
                ${extraRows.join("")}
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
                Please reply to confirm your availability. Good luck!<br/>
                InfiAP HR Team
            </p>
        </div>
        `;

        const sent = await sendEmail({ to: email, subject: "Interview Scheduled - InfiAP HRMS", html });
        if (sent) logger.info("Interview scheduled email sent", { email });
        return sent;
    } catch (error) {
        logger.error("Error sending interview scheduled email", { error: error.message });
        return false;
    }
};

const sendSuperadminOTPEmail = async (email, otp) => {
    try {
        const emailSent = await sendEmail({
            to: email,
            subject: `Your SuperAdmin verification code - InfiAP HRMS`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">SuperAdmin Secure Login</h1>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Your verification code is:
                    </p>
                    <h2 style="letter-spacing: 6px; color: #2563eb; font-size: 32px; text-align: center; padding: 16px; background: #f3f4f6; border-radius: 8px; margin: 20px 0;">${otp}</h2>
                    <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
                </div>
            `,
        });

        if (emailSent) {
            logger.info("SuperAdmin OTP email sent", { email });
        }

        return emailSent;
    } catch (error) {
        logger.error("Error sending SuperAdmin OTP email", { error: error.message });
        throw new Error("Could not send SuperAdmin OTP email");
    }
};

module.exports = {
    sendVerificationEmail,
    sendLoginOTPEmail,
    sendPasswordResetEmail,
    sendBookingConfirmationEmail,
    sendMeetingLinkEmail,
    sendHrLoginOTPEmail,
    sendProfileEditOTPEmail,
    sendInterviewScheduledEmail,
    sendSuperadminOTPEmail,
    isConfiguredForEmail,
};