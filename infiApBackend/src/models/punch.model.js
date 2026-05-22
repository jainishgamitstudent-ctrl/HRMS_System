const mongoose = require("mongoose");

const punchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        PunchType: {
            type: Number,
            enum: [1, 2, 3, 4, 5], // 1 = in, 2 = out, 3 = reset, 4 = break start, 5 = break end
            required: true,
        },
        Latitude: {
            type: Number,
        },
        Longitude: {
            type: Number,
        },
        IsAway: {
            type: Boolean,
            default: false,
        },
        WorkMode: {
            type: Number,
            enum: [1, 2, 3, 4], // 1 = Office, 2 = WFH, 3 = Meeting mode, 4 = Offsite
            default: 1,
        },
        BreakType: {
            type: Number,
            enum: [1, 2], // 1 = Lunch Break, 2 = Short Break
        },
        PunchTime: {
            type: Date,
            default: Date.now,
        },
        // ==================== Enterprise Security Fields ====================
        selfieUrl: {
            type: String,
            default: null,
        },
        faceVerified: {
            type: Boolean,
            default: false,
        },
        faceConfidence: {
            type: Number,
            default: 0,
        },
        faceProvider: {
            type: String,
            default: null,
        },
        geofenceValid: {
            type: Boolean,
            default: false,
        },
        distanceFromOffice: {
            type: Number,
            default: null,
        },
        mockDetected: {
            type: Boolean,
            default: false,
        },
        mockConfidence: {
            type: String,
            default: null,
        },
        // ==================== Device Binding ====================
        deviceId: {
            type: String,
            default: null,
            index: true,
        },
        deviceName: {
            type: String,
            default: null,
        },
        devicePlatform: {
            type: String,
            default: null,
        },
        ipAddress: {
            type: String,
            default: null,
        },
        userAgent: {
            type: String,
            default: null,
        },
        // ==================== Validation Flags ====================
        validationStatus: {
            type: String,
            enum: ["pending", "validated", "failed", "warning"],
            default: "pending",
        },
        validationErrors: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

// Optimized indexes for performance
punchSchema.index({ userId: 1, PunchTime: -1 });
punchSchema.index({ userId: 1, PunchType: 1, PunchTime: -1 });
punchSchema.index({ PunchTime: -1 });
punchSchema.index({ userId: 1, createdAt: -1 }); // Fast attendance history queries
punchSchema.index({ deviceId: 1, userId: 1 }); // Device binding lookups
punchSchema.index({ faceVerified: 1, geofenceValid: 1 }); // Validation reports

module.exports = mongoose.model("Punch", punchSchema);
