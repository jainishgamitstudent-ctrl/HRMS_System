const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "revoked", "expired"],
            default: "active",
            index: true,
        },
        accessTokenJti: {
            type: String,
            index: true,
        },
        refreshTokenJti: {
            type: String,
            index: true,
        },
        deviceInfo: {
            fingerprint: { type: String, required: true },
            browser: { type: String },
            browserVersion: { type: String },
            os: { type: String },
            osVersion: { type: String },
            deviceType: { type: String },
            userAgent: { type: String },
            ipAddress: { type: String },
            location: { type: String },
        },
        loginAt: {
            type: Date,
            default: Date.now,
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        revokedAt: {
            type: Date,
            default: null,
        },
        revokedReason: {
            type: String,
            default: null,
        },
        isTrustedDevice: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
