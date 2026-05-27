const mongoose = require("mongoose");

const trustedDeviceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        deviceFingerprintHash: {
            type: String,
            required: true,
        },
        deviceInfo: {
            browser: { type: String },
            browserVersion: { type: String },
            os: { type: String },
            osVersion: { type: String },
            deviceType: { type: String },
            userAgent: { type: String },
        },
        firstSeenIp: { type: String },
        lastSeenIp: { type: String },
        firstSeenAt: {
            type: Date,
            default: Date.now,
        },
        lastSeenAt: {
            type: Date,
            default: Date.now,
        },
        verifiedAt: {
            type: Date,
            default: Date.now,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

trustedDeviceSchema.index({ userId: 1, deviceFingerprintHash: 1 }, { unique: true });
trustedDeviceSchema.index({ userId: 1, isActive: 1 });

const TrustedDevice = mongoose.model("TrustedDevice", trustedDeviceSchema);
module.exports = TrustedDevice;
