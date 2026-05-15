const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        annualCtcAmount: {
            type: Number,
            required: true,
            min: 0
        },
        monthlyTakeHomeAmount: {
            type: Number,
            required: true,
            min: 0
        },
        earnings: {
            baseSalary: {
                type: Number,
                required: true,
                min: 0
            },
            totalEarning: {
                type: Number,
                required: true,
                min: 0
            }
        },
        deductions: {
            pf: {
                type: Number,
                default: 0,
                min: 0
            },
            tax: {
                type: Number,
                default: 0,
                min: 0
            },
            totalDeduction: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        currency: {
            type: String,
            default: "INR"
        },
        effectiveFrom: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema);
