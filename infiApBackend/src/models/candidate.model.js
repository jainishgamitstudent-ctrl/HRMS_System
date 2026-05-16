const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
    // Job reference
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    jobTitle: { type: String, required: true },

    // Candidate info
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    portfolioUrl: { type: String },
    resumeUrl: { type: String },

    // Professional info
    professionalSummary: { type: String },
    yearsOfExperience: { type: Number, default: 0 },
    location: { type: String },
    skills: [{ type: String }],
    
    experience: [
        {
            company: String,
            role: String,
            duration: String,
            description: String
        }
    ],
    
    education: [
        {
            institution: String,
            degree: String,
            year: String
        }
    ],

    // Status: Applied → Shortlisted → Technical Interview → Selected → Hired / Rejected
    status: {
        type: String,
        enum: ["Applied", "Shortlisted", "Technical Interview", "Selected", "Hired", "Rejected"],
        default: "Applied"
    },

    // Progress Tracking (Stepper data)
    recruitmentProgress: [
        {
            stage: String,
            date: { type: Date, default: Date.now },
            status: { type: String, enum: ["Completed", "Pending", "Active"], default: "Completed" },
            remarks: String
        }
    ],

    // Technical Interview details
    technicalInterview: {
        date: Date,
        interviewer: String,
        mode: {
            type: String,
            enum: ["Online", "Offline"],
            default: "Online"
        },
        meetingLink: String,
        venue: String,
        score: Number,
        feedback: String,
        status: { type: String, enum: ["Pending", "Passed", "Failed"], default: "Pending" }
    },

    appliedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);
