const mongoose = require("mongoose");

const doubleShiftRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

doubleShiftRequestSchema.index({ employeeId: 1, status: 1 });
doubleShiftRequestSchema.index({ requestDate: 1 });

module.exports = mongoose.model("DoubleShiftRequest", doubleShiftRequestSchema);
