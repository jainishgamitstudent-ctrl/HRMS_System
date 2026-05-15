const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    location: { type: String },
    type: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
        default: "Full-time"
    },
    description: { type: String },
    experienceYears: {
        type: Number,
        default: 0,
        min: 0
    },
    requirements: [{ type: String }],
    salaryRange: {
        min: { type: Number },
        max: { type: Number }
    },
    status: {
        type: String,
        enum: ["Open", "Filled", "Closed", "On Hold"],
        default: "Open"
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closingDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
