const RequestRoom = require("../models/requestRoom.model");
const User = require("../models/user.model");
const { notifyUser, notifyUsers, notifyRoleUsers, emitToastToUser } = require("../utils/notifier");
const { emitToRoles, emitEntityEvent } = require("../utils/socketManager");

exports.createRoom = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) {
            return res.status(401).json({ status: "Error", message: "Unauthorized" });
        }

        const { title, description, requestType, leaveType, requestData, relatedLeaveId } = req.body;
        if (!title) {
            return res.status(400).json({ status: "Error", message: "Title is required" });
        }

        const hrAndAdmins = await User.find({
            role: { $in: ["hr", "admin", "superadmin"] },
            status: "Active",
        }).select("_id").lean();
        const participantIds = [userId, ...hrAndAdmins.map((u) => u._id)];

        const room = await RequestRoom.create({
            title,
            description: description || "",
            requestType: requestType || "general",
            leaveType: leaveType || null,
            requestData: requestData || {},
            status: "pending",
            createdBy: userId,
            participants: participantIds,
            messages: [],
            relatedLeaveId: relatedLeaveId || null,
        });

        emitEntityEvent('requestRoom', 'created', { id: room._id, title: room.title, status: room.status, requestType: room.requestType, createdBy: room.createdBy }, {
            userId: room.createdBy,
            targetRoles: ['hr', 'admin', 'superadmin']
        });

        // Notify HR/Admin about new request room (help center / general query)
        try {
            const creator = await User.findById(userId).select("name").lean();
            const creatorName = creator?.name || "An employee";
            await notifyRoleUsers({
                roles: ["hr", "admin", "superadmin"],
                category: "alert",
                headline: `New Query: ${creatorName}`,
                details: `${creatorName} submitted "${title}".${description ? " " + description : ""}`,
                sentBy: userId,
                relatedRoomId: room._id,
                excludeUserId: userId,
            });

            // Send real-time toast popup to HR/Admin
            emitToRoles(["hr", "admin", "superadmin"], "toast", {
                type: "info",
                message: `New Query from ${creatorName}`,
                category: "alert",
                relatedRoomId: String(room._id),
            });
        } catch (notifyErr) {
            console.warn("[RequestRoom] notifyRoleUsers failed (non-blocking):", notifyErr.message);
        }

        return res.status(201).json({ status: "Success", data: room });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: "Failed to create room", error: error.message });
    }
};

exports.getMyRooms = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) {
            return res.status(401).json({ status: "Error", message: "Unauthorized" });
        }

        const rooms = await RequestRoom.find({
            isActive: true,
            $or: [{ createdBy: userId }, { participants: userId }],
        })
            .populate("createdBy", "name profile_image employeeId department designation")
            .populate("participants", "name profile_image role")
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return res.status(200).json({ status: "Success", data: rooms });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: "Failed to fetch rooms", error: error.message });
    }
};

exports.getRoomById = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ status: "Error", message: "Unauthorized" });
        }

        const room = await RequestRoom.findById(id)
            .populate("createdBy", "name profile_image employeeId department designation")
            .populate("participants", "name profile_image role")
            .lean();

        if (!room) {
            return res.status(404).json({ status: "Error", message: "Room not found" });
        }

        const isParticipant = room.participants.some((p) => String(p._id || p) === String(userId));
        const isCreator = String(room.createdBy?._id || room.createdBy) === String(userId);
        if (!isParticipant && !isCreator) {
            return res.status(403).json({ status: "Error", message: "Forbidden" });
        }

        return res.status(200).json({ status: "Success", data: room });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: "Failed to fetch room", error: error.message });
    }
};

exports.updateRoomStatus = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        const { id } = req.params;
        const { status, messageText } = req.body;

        if (!userId) {
            return res.status(401).json({ status: "Error", message: "Unauthorized" });
        }
        if (!status || !["approved", "rejected"].includes(status)) {
            return res.status(400).json({ status: "Error", message: "Invalid status" });
        }

        const room = await RequestRoom.findById(id);
        if (!room) {
            return res.status(404).json({ status: "Error", message: "Room not found" });
        }

        const canAct = ["hr", "admin", "superadmin", "manager"].includes(req.user.role);
        if (!canAct) {
            return res.status(403).json({ status: "Error", message: "Only HR/Admin can approve or reject" });
        }

        room.status = status;
        if (messageText) {
            room.messages.push({
                sender: userId,
                text: messageText,
            });
        }
        await room.save();

        emitEntityEvent('requestRoom', 'updated', { id: room._id, title: room.title, status: room.status, requestType: room.requestType, createdBy: room.createdBy }, {
            userId: room.createdBy,
            targetRoles: ['hr', 'admin', 'superadmin']
        });

        const approverName = req.user?.name || "HR/Admin";
        const isReject = status === "rejected";
        await notifyUser({
            recipient: room.createdBy,
            category: "leave",
            headline: isReject ? "Request Rejected" : "Request Approved",
            details: `Your request "${room.title}" was ${status} by ${approverName}.${messageText ? " Message: " + messageText : ""}`,
            sentBy: userId,
        });

        // Notify other participants (HR/Admin) about the status update
        const otherParticipantIds = room.participants
            .filter((p) => String(p) !== String(room.createdBy) && String(p) !== String(userId))
            .map((p) => String(p));
        if (otherParticipantIds.length > 0) {
            await notifyUsers({
                recipients: otherParticipantIds,
                category: "alert",
                headline: isReject ? "Request Rejected" : "Request Approved",
                details: `${approverName} ${status} the request "${room.title}".${messageText ? " Message: " + messageText : ""}`,
                sentBy: userId,
                relatedRoomId: room._id,
            });
        }

        // Confirmation popup to the approver
        emitToastToUser(userId, "success", isReject ? "Request rejected." : "Request approved.");

        return res.status(200).json({ status: "Success", data: room });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: "Failed to update room", error: error.message });
    }
};

exports.addMessage = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        const { id } = req.params;
        const { text } = req.body;

        if (!userId) {
            return res.status(401).json({ status: "Error", message: "Unauthorized" });
        }
        if (!text || !text.trim()) {
            return res.status(400).json({ status: "Error", message: "Message text is required" });
        }

        const room = await RequestRoom.findById(id);
        if (!room) {
            return res.status(404).json({ status: "Error", message: "Room not found" });
        }

        const isParticipant = room.participants.some((p) => String(p) === String(userId));
        const isCreator = String(room.createdBy) === String(userId);
        if (!isParticipant && !isCreator) {
            return res.status(403).json({ status: "Error", message: "Forbidden" });
        }

        room.messages.push({
            sender: userId,
            text: text.trim(),
        });
        await room.save();

        emitEntityEvent('requestRoom', 'updated', { id: room._id, title: room.title, status: room.status, requestType: room.requestType, messageCount: room.messages.length, lastMessage: room.messages[room.messages.length - 1] }, {
            userId: room.createdBy,
            targetRoles: ['hr', 'admin', 'superadmin']
        });

        // Notify other participants about new message
        const otherParticipantIds = room.participants
            .filter((p) => String(p) !== String(userId))
            .map((p) => String(p));
        if (otherParticipantIds.length > 0) {
            const sender = await User.findById(userId).select("name").lean();
            const senderName = sender?.name || "Someone";
            await notifyUsers({
                recipients: otherParticipantIds,
                category: "alert",
                headline: `New message in "${room.title}"`,
                details: `${senderName}: ${text.trim().slice(0, 120)}`,
                sentBy: userId,
                relatedRoomId: room._id,
            });
        }

        return res.status(200).json({ status: "Success", data: room });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: "Failed to add message", error: error.message });
    }
};
