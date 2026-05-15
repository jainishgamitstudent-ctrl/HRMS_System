const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String
        },
        category: {
            type: String,
            enum: ["tech", "ui/ux", "social media", "developers", "rnd"],
            default: "tech"
        },
        numberOfTeams: {
            type: Number,
            default: 0,
            min: 0
        },
        tag: {
            type: String,
            default: "Operations"
        },
        tagColor: {
            type: String,
            default: "#0ea5e9"
        },
        head: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
