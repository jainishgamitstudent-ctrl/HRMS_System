const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        companyName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        industry: { type: String },
        totalEmployees: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
