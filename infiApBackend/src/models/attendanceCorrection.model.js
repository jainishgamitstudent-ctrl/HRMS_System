const mongoose = require("mongoose");

const attendanceCorrectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        originalPunchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Punch",
        },
        correctionDate: {
            type: Date,
            required: true,
        },
        correctionTime: {
            type: String,       // e.g. "09:30 AM"
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        duration: {
            type: String,       // e.g. "8h 30m"
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewedAt: {
            type: Date,
        },
        reviewRemarks: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AttendanceCorrection", attendanceCorrectionSchema);
