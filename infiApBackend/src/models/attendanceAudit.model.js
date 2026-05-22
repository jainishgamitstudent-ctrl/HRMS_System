const mongoose = require("mongoose");

const attendanceAuditSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        punchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Punch",
            index: true,
        },
        action: {
            type: String,
            enum: ["checkin", "checkout", "face_verification", "geofence_validation", "mock_detected", "device_binding"],
            required: true,
        },
        status: {
            type: String,
            enum: ["success", "failure", "warning", "blocked"],
            required: true,
        },
        details: {
            latitude: Number,
            longitude: Number,
            distanceFromOffice: Number,
            deviceId: String,
            deviceName: String,
            ipAddress: String,
            faceVerified: Boolean,
            faceConfidence: Number,
            faceProvider: String,
            mockDetected: Boolean,
            mockConfidence: String,
            workMode: Number,
            punchType: Number,
            message: String,
        },
        metadata: {
            userAgent: String,
            platform: String,
            appVersion: String,
        },
    },
    { timestamps: true }
);

// Indexes for fast querying
attendanceAuditSchema.index({ userId: 1, createdAt: -1 });
attendanceAuditSchema.index({ action: 1, status: 1 });
attendanceAuditSchema.index({ createdAt: -1 });
attendanceAuditSchema.index({ "details.deviceId": 1 });

module.exports = mongoose.model("AttendanceAudit", attendanceAuditSchema);
