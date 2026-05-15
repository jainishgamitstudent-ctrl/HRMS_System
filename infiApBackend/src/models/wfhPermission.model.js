const mongoose = require("mongoose");

const wfhPermissionSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["global", "employee", "team", "department"],
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate active permissions for the same target
wfhPermissionSchema.index(
  { level: 1, employeeId: 1, teamId: 1, departmentId: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

module.exports = mongoose.model("WFHPermission", wfhPermissionSchema);
