const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Payroll", "Hire", "Meeting", "Leave", "Job", "System"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    userAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    icon: {
        type: String, // e.g., "wallet", "person-add", "people"
        default: "notifications"
    },
    color: {
        type: String,
        default: "#4f46e5"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
