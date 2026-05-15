const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leave.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

// Optionally use JWT middleware here to protect these routes
// const { verifyJWT } = require("../middlewares/auth.middleware");
// router.use(verifyJWT);

// Apply for leave
router.post("/leaveapplications", verifyJWT, leaveController.applyLeave);

// Get user's leaves
router.get("/leaveapplications", verifyJWT, leaveController.getLeaveApplications);

// Get pending leave approvals
router.get("/leaveapprovals", leaveController.getLeaveApprovals);

// Approve a leave
router.post("/allapprove", leaveController.approveLeave);

module.exports = router;
