const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

// All event routes require authentication
router.use(verifyJWT);

// Create event
router.post("/", eventController.createEvent);

// List events (optional query: type=upcoming)
router.get("/", eventController.listEvents);

module.exports = router;
