const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ["Public", "Company"], default: "Company" }
}, { timestamps: true });

module.exports = mongoose.model("Holiday", holidaySchema);
