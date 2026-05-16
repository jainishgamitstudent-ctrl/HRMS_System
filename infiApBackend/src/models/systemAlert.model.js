const mongoose = require("mongoose");

const alertActionSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true
        },
        action: {
            type: String,
            required: true,
            trim: true
        }
    },
    { _id: false }
);

const systemAlertSchema = new mongoose.Schema(
    {
        alertKey: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["CRITICAL", "WARNING", "INFORMATION", "RESOLVED"],
            required: true
        },
        severity: {
            type: Number,
            min: 1,
            max: 4,
            default: 3
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        source: {
            type: String,
            trim: true,
            default: "system"
        },
        affectedServices: [{
            type: String,
            trim: true
        }],
        status: {
            type: String,
            enum: ["active", "acknowledged", "resolved"],
            default: "active"
        },
        actions: [alertActionSchema],
        acknowledgedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        acknowledgedAt: {
            type: Date
        },
        resolvedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("SystemAlert", systemAlertSchema);
