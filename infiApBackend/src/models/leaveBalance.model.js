const mongoose = require("mongoose");

const leaveBalanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        CL: { type: Number, default: 6 }, // Casual Leave
        PL: { type: Number, default: 6 }, // Privilege Leave
        SL: { type: Number, default: 6 }, // Sick Leave
        WFH: { type: Number, default: 7 }, // Work From Home days
    },
    { timestamps: true }
);

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);
