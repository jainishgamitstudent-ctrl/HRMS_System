const mongoose = require("mongoose");

const securityRequestSchema = new mongoose.Schema(
    {
        action: { type: String, required: true },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        otp: { type: String, required: true },
        status: { type: String, enum: ["pending", "verified", "approved", "rejected"], default: "pending" },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SecurityRequest", securityRequestSchema);
