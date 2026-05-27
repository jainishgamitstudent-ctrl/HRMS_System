const mongoose = require("mongoose");

const loginChallengeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "denied", "completed", "expired"],
            default: "pending",
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
        riskFlags: {
            isNewDevice: { type: Boolean, default: false },
            isNewIP: { type: Boolean, default: false },
            userAgentChanged: { type: Boolean, default: false },
            geoAnomaly: { type: Boolean, default: false },
        },
        failedAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
            default: null,
        },
        decision: {
            type: String,
            enum: ["YES", "NO", null],
            default: null,
        },
        decisionAt: {
            type: Date,
            default: null,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            default: null,
        },
    },
    { timestamps: true }
);

loginChallengeSchema.index({ userId: 1, status: 1 });
loginChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const LoginChallenge = mongoose.model("LoginChallenge", loginChallengeSchema);
module.exports = LoginChallenge;
