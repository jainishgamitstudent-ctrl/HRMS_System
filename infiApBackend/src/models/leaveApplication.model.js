const mongoose = require("mongoose");

const leaveApplicationSchema = new mongoose.Schema(
    {
        EmployeeID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        LeaveType: { type: String, required: true },
        Reason: { type: String, required: true },
        StartDate: { type: Date, required: true },
        EndDate: { type: Date, required: true },
        IsHalfDay: { type: Boolean, default: false },
        IsFirstHalf: { type: Boolean, default: false },
        ApprovalStatusID: { type: Number, default: 3 }, // 1: Approved, 2: Rejected, 3: Awaiting Approve
        ApprovalStatus: { type: String, default: "Awaiting Approve" },
        ApprovalUsername: { type: String },
        ApproverID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        CreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        UpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
);

leaveApplicationSchema.index({ EmployeeID: 1, createdAt: -1 });
leaveApplicationSchema.index({ ApprovalStatusID: 1, StartDate: -1 });
leaveApplicationSchema.index({ EmployeeID: 1, ApprovalStatusID: 1, StartDate: -1 });

module.exports = mongoose.model("LeaveApplication", leaveApplicationSchema);
