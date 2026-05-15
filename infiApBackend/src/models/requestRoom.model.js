const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const requestRoomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        requestType: {
            type: String,
            enum: ["leave", "general"],
            default: "leave",
        },
        leaveType: {
            type: String,
            trim: true,
        },
        requestData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        messages: [messageSchema],
        relatedLeaveId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeaveApplication",
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

requestRoomSchema.index({ createdBy: 1, status: 1 });
requestRoomSchema.index({ participants: 1, status: 1 });

module.exports = mongoose.model("RequestRoom", requestRoomSchema);
