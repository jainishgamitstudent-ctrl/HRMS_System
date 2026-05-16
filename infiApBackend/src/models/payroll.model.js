const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Processed", "Paid"], default: "Pending" },
    paymentDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);
