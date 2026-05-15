const mongoose = require("mongoose");

const resignationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String },
    employeeEmail: { type: String },
    employeeId: { type: String },
    department: { type: String },
    designation: { type: String },
    reason: { type: String, required: true },
    noticePeriodDays: { type: Number, default: 30 },
    lastWorkingDate: { type: Date },
    status: { type: String, enum: ["Submitted", "Under Review", "Approved", "Rejected", "Withdrawn"], default: "Submitted" },
    actionedBy: { type: String },
    managerRemarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Resignation", resignationSchema);
