const mongoose = require("mongoose");

const departmentDeletionRequestSchema = new mongoose.Schema(
    {
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },
        departmentName: {
            type: String,
            required: true
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        requesterName: {
            type: String
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        reviewedAt: {
            type: Date
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

departmentDeletionRequestSchema.index({ departmentId: 1, status: 1 });
departmentDeletionRequestSchema.index({ requestedBy: 1, status: 1 });

module.exports = mongoose.model("DepartmentDeletionRequest", departmentDeletionRequestSchema);
