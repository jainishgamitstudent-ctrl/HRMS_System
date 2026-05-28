const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');

const DEFAULT_FROM_EMAIL = "InfiAP HRMS <support@infiap.com>";

const isConfiguredForEmail = () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
        return false;
    }

    const placeholderValues = [host, user, pass].some((value) =>
        typeof value === "string" &&
        (value.includes("example.com") || value.includes("your_") || value.includes("placeholder"))
    );

    return !placeholderValues;
};

const buildSecurityCodeEmail = (name, code, contextLine, actionText, extraContent = "") => {
    return `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1e21;">
            <p style="font-size: 16px; line-height: 1.5;">Hi ${name || "there"},</p>
            <p style="font-size: 16px; line-height: 1.5;">${contextLine}</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${code}</p>
            <p style="font-size: 16px; font-weight: bold; color: #1c1e21;">Don't share this code with anyone.</p>

            <div style="margin-top: 24px;">
                <p style="font-size: 16px; font-weight: bold; color: #1c1e21; margin-bottom: 4px;">If someone asks for this code</p>
                <p style="font-size: 14px; color: #606770; line-height: 1.5;">Don't share this code with anyone, especially if they tell you that they work for InfiAP. They may be trying to hack your account.</p>
            </div>

            <div style="margin-top: 24px;">
                <p style="font-size: 16px; font-weight: bold; color: #1c1e21; margin-bottom: 4px;">Didn't request this?</p>
                <p style="font-size: 14px; color: #606770; line-height: 1.5;">If you got this email, but aren't trying to ${actionText}, let us know. You don't need to take any further steps, as long as you don't share this code with anyone.</p>
            </div>

            <p style="font-size: 16px; line-height: 1.5; margin-top: 24px;">Thanks,<br>InfiAP Security</p>

            ${extraContent}

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dadde1;">
                <p style="font-size: 12px; color: #8a8d91;">This message was sent to the email address associated with your account.</p>
                <p style="font-size: 12px; color: #8a8d91;">To help keep your account secure, please don't forward this email.</p>
            </div>
        </div>
    `;
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

        if (emailSent && emailSent.success) {
            logger.info("Verification email sent", { email });
            return true;
        }

        throw new Error(emailSent?.error || "Could not send verification email");
    } catch (error) {
        logger.error("Error sending verification email", { error: error.message });
        throw new Error("Could not send verification email");
    }
};

const sendLoginOTPEmail = async (email, otp, name = "") => {
    try {
        const emailSent = await sendEmail({
            to: email,
            subject: "Your InfiAP login verification code",
            html: buildSecurityCodeEmail(
                name,
                otp,
                "We got a request to log in to your InfiAP account. Enter this code:",
                "log in to your account"
            ),
        });

        if (emailSent && emailSent.success) {
            logger.info("Login OTP email sent", { email });
            return true;
        }

        throw new Error(emailSent?.error || "Could not send login OTP email");
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

const sendPasswordResetEmail = async (email, resetToken, name = "") => {
    try {
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const extraContent = `
            <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="font-size: 14px; color: #4b5563; margin-bottom: 8px;">Click below to reset your password using this code:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Reset Password</a>
                <p style="font-size: 12px; color: #6b7280; margin-top: 8px; word-break: break-all;">${resetLink}</p>
            </div>
        `;
        const emailSent = await sendEmail({
            to: email,
            subject: "Password Reset - InfiAP HRMS",
            html: buildSecurityCodeEmail(
                name,
                resetToken,
                "We got a request to reset your password for your InfiAP account. Enter this code:",
                "reset your password",
                extraContent
            ),
        });

        if (emailSent && emailSent.success) {
            logger.info("Password reset email sent", { email });
            return true;
        }

        throw new Error(emailSent?.error || "Could not send password reset email");
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
            html: buildSecurityCodeEmail(
                "",
                otp,
                `An HR user <strong>${hrName}</strong> is attempting to log in for the first time. Please share this verification code with them:`,
                "approve this login",
                `<p style="font-size: 14px; color: #606770; line-height: 1.5; margin-top: 16px;">If you did not create this HR account, please review your admin dashboard immediately.</p>`
            ),
        });

        if (emailSent && emailSent.success) {
            logger.info("HR login OTP email sent to admin", { adminEmail, hrName });
            return true;
        }

        throw new Error(emailSent?.error || "Could not send HR login OTP email");
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
        const contextLine = isSelfEdit
            ? "We got a request to update your profile. Enter this code:"
            : `We got a request from <strong>${editorName}</strong> to edit your profile. Enter this code:`;
        const emailSent = await sendEmail({
            to: targetEmail,
            subject,
            html: buildSecurityCodeEmail(
                targetName,
                otp,
                contextLine,
                isSelfEdit ? "update your profile" : "authorize these profile changes",
                `<p style="font-size: 14px; color: #606770; line-height: 1.5; margin-top: 16px;">If you did not request this change, please contact your administrator immediately.</p>`
            ),
        });

        if (emailSent && emailSent.success) {
            logger.info("Profile edit OTP email sent to target user", { targetEmail, editorName, targetName, isSelfEdit });
            return true;
        }

        throw new Error(emailSent?.error || "Could not send profile edit OTP email");
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
        if (sent && sent.success) {
            logger.info("Interview scheduled email sent", { email });
            return true;
        }
        return false;
    } catch (error) {
        logger.error("Error sending interview scheduled email", { error: error.message });
        return false;
    }
};

const sendSuperadminOTPEmail = async (email, otp, name = "") => {
    try {
        const emailSent = await sendEmail({
            to: email,
            subject: `Your SuperAdmin verification code - InfiAP HRMS`,
            html: buildSecurityCodeEmail(
                name,
                otp,
                "We got a request to log in to your SuperAdmin account. Enter this code:",
                "log in to your SuperAdmin account"
            ),
        });

        if (emailSent && emailSent.success) {
            logger.info("SuperAdmin OTP email sent", { email });
            return true;
        }

        throw new Error(emailSent?.error || "Could not send SuperAdmin OTP email");
    } catch (error) {
        logger.error("Error sending SuperAdmin OTP email", { error: error.message });
        throw new Error("Could not send SuperAdmin OTP email");
    }
};

const buildLoginAlertEmail = (name, deviceInfo, time, riskFlags, isDenied = false) => {
    const deviceDisplay = `${deviceInfo.browser} on ${deviceInfo.os} (${deviceInfo.deviceType})`;
    const riskText = Object.entries(riskFlags || {})
        .filter(([, v]) => v)
        .map(([k]) => k.replace(/([A-Z])/g, " $1").toLowerCase())
        .join(", ") || "None";

    const geoRow = deviceInfo.geoLocation
        ? `<tr><td style="color: #6b7280;">Geo Coordinates</td><td style="color: #1f2937; font-weight: 500;">${deviceInfo.geoLocation.latitude}, ${deviceInfo.geoLocation.longitude}</td></tr>`
        : "";

    // Build a richer location display from resolved address fields
    const hasAddress = deviceInfo.address || deviceInfo.city || deviceInfo.state || deviceInfo.country;
    const locationValue = hasAddress
        ? `${deviceInfo.address || ""}${deviceInfo.address && (deviceInfo.city || deviceInfo.state) ? ", " : ""}${deviceInfo.city || ""}${deviceInfo.city && deviceInfo.state ? ", " : ""}${deviceInfo.state || ""}${deviceInfo.country ? `, ${deviceInfo.country}` : ""}`
        : (deviceInfo.location || "Unknown");

    const addressDetailRow = (deviceInfo.city || deviceInfo.state || deviceInfo.country)
        ? `<tr><td style="color: #6b7280;">Address Detail</td><td style="color: #1f2937; font-weight: 500;">${[deviceInfo.city, deviceInfo.state, deviceInfo.country].filter(Boolean).join(" · ")}</td></tr>`
        : "";

    const title = isDenied ? "Security alert: login attempt denied" : "New login to your SuperAdmin account";
    const color = isDenied ? "#dc2626" : "#4f46e5";
    const actionText = isDenied
        ? "A login attempt was denied and all your active sessions have been logged out for security."
        : "We noticed a new login to your SuperAdmin account.";

    const securityUrl = `${process.env.CLIENT_URL || ""}/superadmin/settings/security`;

    return `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1e21;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: ${color}; font-size: 20px; margin: 0;">${title}</h1>
            </div>
            <p style="font-size: 16px; line-height: 1.5;">Hi ${name || "there"},</p>
            <p style="font-size: 16px; line-height: 1.5;">${actionText}</p>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; line-height: 1.6;">
                    <tr><td style="color: #6b7280; width: 120px;">Time</td><td style="color: #1f2937; font-weight: 500;">${time}</td></tr>
                    <tr><td style="color: #6b7280;">Device</td><td style="color: #1f2937; font-weight: 500;">${deviceDisplay}</td></tr>
                    <tr><td style="color: #6b7280;">IP Address</td><td style="color: #1f2937; font-weight: 500;">${deviceInfo.ipAddress || "Unknown"}</td></tr>
                    <tr><td style="color: #6b7280;">Location</td><td style="color: #1f2937; font-weight: 500;">${locationValue}</td></tr>
                    ${addressDetailRow}
                    ${geoRow}
                    <tr><td style="color: #6b7280;">Risk flags</td><td style="color: #1f2937; font-weight: 500;">${riskText}</td></tr>
                </table>
            </div>

            ${isDenied ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="font-size: 14px; color: #991b1b; margin: 0; font-weight: 600;">What should you do?</p>
                <p style="font-size: 14px; color: #7f1d1d; margin: 8px 0 0;">If you did not make this request, change your password immediately and review your active sessions.</p>
            </div>
            ` : ""}

            <div style="text-align: center; margin: 24px 0;">
                <a href="${securityUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${color}; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Review Sessions & Devices</a>
            </div>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dadde1;">
                <p style="font-size: 12px; color: #8a8d91;">This message was sent to the email address associated with your account.</p>
                <p style="font-size: 12px; color: #8a8d91;">To help keep your account secure, please don't forward this email.</p>
            </div>
        </div>
    `;
};

const sendLoginAlertEmail = async (email, name, deviceInfo, riskFlags) => {
    try {
        const time = new Date().toLocaleString("en-US", { timeZoneName: "short" });
        const emailSent = await sendEmail({
            to: email,
            subject: "New login to your SuperAdmin account",
            html: buildLoginAlertEmail(name, deviceInfo, time, riskFlags),
        });
        if (emailSent && emailSent.success) {
            logger.info("Login alert email sent", { email });
            return true;
        }
        return false;
    } catch (error) {
        logger.error("Error sending login alert email", { error: error.message });
        return false;
    }
};

const sendDeniedLoginAlertEmail = async (email, name, deviceInfo, riskFlags) => {
    try {
        const time = new Date().toLocaleString("en-US", { timeZoneName: "short" });
        const emailSent = await sendEmail({
            to: email,
            subject: "Security alert: login attempt denied — sessions logged out",
            html: buildLoginAlertEmail(name, deviceInfo, time, riskFlags, true),
        });
        if (emailSent && emailSent.success) {
            logger.info("Denied login alert email sent", { email });
            return true;
        }
        return false;
    } catch (error) {
        logger.error("Error sending denied login alert email", { error: error.message });
        return false;
    }
};

const sendEmailChangeOtpEmail = async (currentEmail, otp, name = "") => {
    try {
        const emailSent = await sendEmail({
            to: currentEmail,
            subject: "Confirm your email address change \u2014 InfiAP HRMS",
            html: buildSecurityCodeEmail(
                name,
                otp,
                "A request was made to change the primary email address on your SuperAdmin account. Use this code to confirm the change:",
                "change your email address"
            ),
        });
        if (emailSent && emailSent.success) {
            logger.info("Email change OTP sent", { currentEmail });
            return true;
        }
        throw new Error(emailSent?.error || "Failed to send OTP email");
    } catch (error) {
        logger.error("Error sending email change OTP", { error: error.message });
        throw error;
    }
};

const sendRecoveryEmailAddedNotificationEmail = async (recoveryEmail, name, maskedPrimaryEmail) => {
    try {
        const formattedDate = new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
        const html = `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c1e21;">
            <p style="font-size: 16px; line-height: 1.5;">Hi there,</p>
            <p style="font-size: 16px; line-height: 1.5;">
                This email address has been added as the <strong>recovery email</strong> for the InfiAP HRMS SuperAdmin account
                associated with <strong>${maskedPrimaryEmail}</strong>.
            </p>

            <div style="background: #f0f7ff; border-left: 4px solid #1877f2; padding: 16px; border-radius: 6px; margin: 24px 0;">
                <p style="font-size: 14px; font-weight: bold; color: #1c1e21; margin: 0 0 8px 0;">What is a recovery email?</p>
                <p style="font-size: 14px; color: #606770; line-height: 1.5; margin: 0;">
                    A recovery email lets you regain access to your InfiAP HRMS account if you are ever locked out.
                    Security alerts and account recovery options may be sent to this address.
                </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e4e6eb;">
                    <td style="padding: 10px 0; color: #606770; width: 45%;">Primary account</td>
                    <td style="padding: 10px 0; font-weight: 600; color: #1c1e21;">${maskedPrimaryEmail}</td>
                </tr>
                ${name ? `<tr style="border-bottom: 1px solid #e4e6eb;">
                    <td style="padding: 10px 0; color: #606770;">Account holder</td>
                    <td style="padding: 10px 0; font-weight: 600; color: #1c1e21;">${name}</td>
                </tr>` : ""}
                <tr style="border-bottom: 1px solid #e4e6eb;">
                    <td style="padding: 10px 0; color: #606770;">Recovery email set</td>
                    <td style="padding: 10px 0; font-weight: 600; color: #1c1e21;">${recoveryEmail}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; color: #606770;">Date &amp; time</td>
                    <td style="padding: 10px 0; font-weight: 600; color: #1c1e21;">${formattedDate}</td>
                </tr>
            </table>

            <div style="background: #fff4e5; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 24px 0;">
                <p style="font-size: 14px; font-weight: bold; color: #92400e; margin: 0 0 6px 0;">Didn't authorize this?</p>
                <p style="font-size: 14px; color: #92400e; line-height: 1.5; margin: 0;">
                    If you did not request this change, your account may be at risk. Contact your system administrator
                    or reply to this email immediately.
                </p>
            </div>

            <p style="font-size: 16px; line-height: 1.5; margin-top: 24px;">Thanks,<br>InfiAP Security</p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dadde1;">
                <p style="font-size: 12px; color: #8a8d91;">This is an automated security notification from InfiAP HRMS.</p>
                <p style="font-size: 12px; color: #8a8d91;">You received this because this address was added as a recovery email for an InfiAP HRMS account.</p>
            </div>
        </div>
        `;
        const emailSent = await sendEmail({
            to: recoveryEmail,
            subject: "Recovery email added \u2014 InfiAP HRMS",
            html,
        });
        if (emailSent && emailSent.success) {
            logger.info("Recovery email added notification sent", { recoveryEmail });
            return true;
        }
        throw new Error(emailSent?.error || "Failed to send notification email");
    } catch (error) {
        logger.error("Error sending recovery email added notification", { error: error.message });
        throw error;
    }
};

const sendRecoveryEmailChangeOtpEmail = async (primaryEmail, otp, name = "") => {
    try {
        const emailSent = await sendEmail({
            to: primaryEmail,
            subject: "Confirm your recovery email change — InfiAP HRMS",
            html: buildSecurityCodeEmail(
                name,
                otp,
                "A request was made to change the recovery email on your SuperAdmin account. Use this code to confirm the change:",
                "change your recovery email"
            ),
        });
        if (emailSent && emailSent.success) {
            logger.info("Recovery email change OTP sent to primary email", { primaryEmail });
            return true;
        }
        throw new Error(emailSent?.error || "Failed to send OTP email");
    } catch (error) {
        logger.error("Error sending recovery email change OTP", { error: error.message });
        throw error;
    }
};

const sendSuperadminRecoveryOTPEmail = async (recoveryEmail, otp, name = "") => {
    try {
        const emailSent = await sendEmail({
            to: recoveryEmail,
            subject: "Recover SuperAdmin access - InfiAP HRMS",
            html: buildSecurityCodeEmail(
                name,
                otp,
                "Your SuperAdmin account is locked. Use this recovery code to unlock and sign in:",
                "recover access to your account"
            ),
        });
        if (emailSent && emailSent.success) {
            logger.info("SuperAdmin recovery OTP sent", { recoveryEmail });
            return true;
        }
        throw new Error(emailSent?.error || "Failed to send recovery OTP");
    } catch (error) {
        logger.error("Error sending SuperAdmin recovery OTP", { error: error.message });
        throw error;
    }
};

const sendSuperadminUnlockOTPEmail = async (email, otp, name = "") => {
    try {
        const emailSent = await sendEmail({
            to: email,
            subject: "Unlock your SuperAdmin session - InfiAP HRMS",
            html: buildSecurityCodeEmail(
                name,
                otp,
                "Your SuperAdmin workspace was locked due to inactivity. Use this code to unlock it:",
                "unlock your session"
            ),
        });
        if (emailSent && emailSent.success) {
            logger.info("SuperAdmin inactivity unlock OTP sent", { email });
            return true;
        }
        throw new Error(emailSent?.error || "Failed to send unlock OTP");
    } catch (error) {
        logger.error("Error sending SuperAdmin unlock OTP", { error: error.message });
        throw error;
    }
};

const sendAccountLockAlertEmail = async (email, details = {}) => {
    const reviewUrl = `${process.env.CLIENT_URL || ""}/superadmin/settings/security`;
    const browserOs = [details.browser, details.os].filter(Boolean).join(" / ") || details.userAgent || "Unknown";
    const lockedUntilDisplay = details.lockedUntil
        ? new Date(details.lockedUntil).toUTCString()
        : "Unknown";
    const html = `
        <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1c1e21;">
            <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#b91c1c;text-transform:uppercase;letter-spacing:.05em;">Security Alert</p>
                <h1 style="margin:0;font-size:20px;color:#dc2626;">Account Locked</h1>
            </div>
            <p style="color:#374151;font-size:14px;margin:0 0 20px;">Your SuperAdmin account has been locked because of too many failed login attempts.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
                <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:10px 0;color:#6b7280;width:160px;vertical-align:top;">Reason</td>
                    <td style="padding:10px 0;font-weight:500;">Too many failed login attempts</td>
                </tr>
                <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Lock duration</td>
                    <td style="padding:10px 0;font-weight:500;">30 minutes</td>
                </tr>
                <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Locked until</td>
                    <td style="padding:10px 0;font-family:monospace;font-size:13px;">${lockedUntilDisplay}</td>
                </tr>
                <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:10px 0;color:#6b7280;vertical-align:top;">IP address</td>
                    <td style="padding:10px 0;font-family:monospace;font-size:13px;">${details.ip || "Unknown"}</td>
                </tr>
                <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Browser / OS</td>
                    <td style="padding:10px 0;">${browserOs}</td>
                </tr>
                <tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Device type</td>
                    <td style="padding:10px 0;text-transform:capitalize;">${details.deviceType || "Unknown"}</td>
                </tr>
                <tr>
                    <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Location</td>
                    <td style="padding:10px 0;">${details.location || "Unavailable"}</td>
                </tr>
            </table>
            <a href="${reviewUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Review Sessions</a>
            <p style="margin-top:20px;font-size:12px;color:#6b7280;">If this was not you, use <strong>Recover Access</strong> on the login page and review your sessions immediately.</p>
        </div>
    `;
    const emailSent = await sendEmail({ to: email, subject: "⚠ SuperAdmin account locked - InfiAP HRMS", html });
    if (emailSent && emailSent.success) return true;
    throw new Error(emailSent?.error || "Failed to send account lock alert");
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
    sendLoginAlertEmail,
    sendDeniedLoginAlertEmail,
    sendEmailChangeOtpEmail,
    sendRecoveryEmailChangeOtpEmail,
    sendRecoveryEmailAddedNotificationEmail,
    sendSuperadminRecoveryOTPEmail,
    sendSuperadminUnlockOTPEmail,
    sendAccountLockAlertEmail,
    isConfiguredForEmail,
};
