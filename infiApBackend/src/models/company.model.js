const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        companyName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        industry: { type: String },
        size: { type: String },
        totalEmployees: { type: Number, default: 0 },
        country: { type: String },
        plan: { type: String, default: "Free" },
        status: { type: String, default: "active" },
        subdomain: { type: String },
        primaryColor: { type: String, default: "#2563eb" },
        logo: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
