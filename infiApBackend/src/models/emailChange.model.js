const mongoose = require("mongoose");

const emailChangeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        oldEmail: {
            type: String,
            required: true,
        },
        newEmail: {
            type: String,
            required: true,
        },
        otpHash: {
            type: String,
            default: null,
        },
        otpAttempts: {
            type: Number,
            default: 0,
        },
        confirmationTokenHash: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: ["awaiting_otp", "awaiting_new_email_confirm", "completed", "cancelled", "expired"],
            default: "awaiting_otp",
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

emailChangeSchema.index({ userId: 1, status: 1 });
emailChangeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailChange = mongoose.model("EmailChange", emailChangeSchema);
module.exports = EmailChange;
