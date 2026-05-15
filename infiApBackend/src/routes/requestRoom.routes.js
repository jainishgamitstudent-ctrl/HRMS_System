const express = require("express");
const router = express.Router();
const requestRoomController = require("../controllers/requestRoom.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

router.use(verifyJWT);

router.post("/", requestRoomController.createRoom);
router.get("/my-rooms", requestRoomController.getMyRooms);
router.get("/:id", requestRoomController.getRoomById);
router.patch("/:id/status", requestRoomController.updateRoomStatus);
router.post("/:id/messages", requestRoomController.addMessage);

module.exports = router;
