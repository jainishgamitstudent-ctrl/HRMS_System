const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true }, // Format "YYYY-MM"
    year: { type: Number, required: true },

    // Core Metrics
    efficiencyScore: { type: Number, min: 0, max: 100, default: 0 },
    qualityScore: { type: Number, min: 0, max: 100, default: 0 },
    reliabilityScore: { type: Number, min: 0, max: 100, default: 0 },
    
    // Aggregated Score & Progress
    overallScore: { type: Number, min: 0, max: 100, default: 0 }, // calculated average
    targetPercentage: { type: Number, min: 0, max: 100, default: 0 }, // progress
    
    // Feedback Specifics
    rating: { type: Number, min: 1, max: 5, default: 3 }, // 1-5 Stars
    reviewTitle: { type: String }, // e.g., "Monthly Performance Review"
    feedback: { type: String },
    
    status: {
        type: String,
        enum: ["On Target", "Below Target", "Exceeding", "Completed"],
        default: "On Target"
    },

    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewerName: { type: String }, // cached for speed
    reviewerRole: { type: String }   // cached for speed
}, { timestamps: true });

// Auto-calculate overall score and status before saving
performanceSchema.pre("save", function(next) {
    this.overallScore = (this.efficiencyScore + this.qualityScore + this.reliabilityScore) / 3;
    
    // Sync rating if not manually provided: overallScore 80+ = 4/5, 90+ = 5/5
    if (!this.rating) {
        this.rating = Math.ceil(this.overallScore / 20);
    }

    if (this.overallScore < 70) {
        this.status = "Below Target";
    } else if (this.overallScore > 90) {
        this.status = "Exceeding";
    } else {
        this.status = "On Target";
    }
    next();
});

module.exports = mongoose.model("Performance", performanceSchema);
