const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

// Create event
router.post("/", eventController.createEvent);

// List events (optional query: type=upcoming)
router.get("/", eventController.listEvents);

module.exports = router;
