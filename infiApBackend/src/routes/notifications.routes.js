const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notifications.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

// Authenticated user's notifications (personal + relevant broadcasts)
router.get("/me", verifyJWT, notificationsController.getMyNotifications);
router.patch("/me/read-all", verifyJWT, notificationsController.markAllRead);
router.patch("/:id/read", verifyJWT, notificationsController.markNotificationRead);

router.post("/push-token", verifyJWT, notificationsController.registerPushToken);

router.get("/", notificationsController.getNotifications);
router.get("/:id", notificationsController.getNotificationById);

module.exports = router;
