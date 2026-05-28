const mongoose = require("mongoose");

const authEventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        ip: {
            type: String,
            default: null,
        },
        userAgent: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

authEventSchema.index({ userId: 1, action: 1, createdAt: -1 });

const AuthEvent = mongoose.model("AuthEvent", authEventSchema);
module.exports = AuthEvent;
