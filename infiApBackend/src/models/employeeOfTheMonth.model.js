const mongoose = require("mongoose");

const employeeOfTheMonthSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        monthOfYear: {
            type: String, // e.g., "2026-01"
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("EmployeeOfTheMonth", employeeOfTheMonthSchema);
