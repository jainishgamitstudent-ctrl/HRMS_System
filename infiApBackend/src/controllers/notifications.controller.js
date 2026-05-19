const Notification = require("../models/notification.model");

const hasUserReadBroadcast = (n, userId) => {
  if (!userId || !Array.isArray(n.readBy)) return false;
  return n.readBy.some((entry) => String(entry?.user?._id || entry?.user) === String(userId));
};

const getAudienceFilters = (user) => {
  const orFilters = [{ targetedAudience: "all_employee" }];
  if (user.department) {
    orFilters.push({ targetedAudience: "department", targetDepartments: user.department });
  }
  if (user.role === "hr") {
    orFilters.push({ targetedAudience: "hr" });
  }
  return orFilters;
};

const formatNotification = (n, userId) => {
  const isPersonal = !!n.recipient;
  const isRead = isPersonal ? !!n.readAt : hasUserReadBroadcast(n, userId);
  const sentBy = n.sentBy && typeof n.sentBy === 'object'
    ? { id: n.sentBy._id, name: n.sentBy.name || n.sentBy.fullName, role: n.sentBy.role }
    : n.sentBy ? { id: n.sentBy } : null;
  return {
    id: n._id,
    category: n.category,
    headline: n.headline,
    details: n.details,
    scheduleAt: n.scheduleAt,
    status: n.status,
    recipient: n.recipient,
    readAt: isPersonal ? n.readAt || null : null,
    isRead,
    createdAt: n.createdAt,
    relatedRoomId: n.relatedRoomId || null,
    sentBy,
  };
};

exports.getNotifications = async (req, res) => {
  try {
    // For simplicity, return most recent 50 notifications
    const notifications = await Notification.find({ isActive: true })
      .populate("sentBy", "name fullName role")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.status(200).json({ status: "Success", data: notifications.map((n) => formatNotification(n)) });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to fetch notifications", error: error.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findById(id);
    if (!n) return res.status(404).json({ status: "Error", message: "Notification not found" });
    return res.status(200).json({ status: "Success", data: formatNotification(n) });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to fetch notification", error: error.message });
  }
};

// Notifications targeted to the authenticated user (personal + broadcasts)
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ status: "Error", message: "Unauthorized" });
    }
    const orFilters = [{ recipient: userId }, ...getAudienceFilters(req.user)];

    const notifications = await Notification.find({
      isActive: true,
      $or: orFilters,
    })
      .populate("sentBy", "name fullName role")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      status: "Success",
      data: notifications.map((n) => formatNotification(n, userId)),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Failed to fetch notifications", error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const { id } = req.params;
    const n = await Notification.findById(id);
    if (!n) return res.status(404).json({ status: "Error", message: "Notification not found" });

    // Personal notifications can only be marked by their recipient.
    // Broadcast notifications keep per-user read state in readBy.
    if (n.recipient && String(n.recipient) !== String(userId)) {
      return res.status(403).json({ status: "Error", message: "Forbidden" });
    }
    if (
      !n.recipient &&
      !(await Notification.exists({ _id: id, $or: getAudienceFilters(req.user) }))
    ) {
      return res.status(403).json({ status: "Error", message: "Forbidden" });
    }

    if (n.recipient) {
      n.readAt = new Date();
    } else if (!hasUserReadBroadcast(n, userId)) {
      n.readBy.push({ user: userId, readAt: new Date() });
    }
    await n.save();
    return res.status(200).json({ status: "Success", data: formatNotification(n, userId) });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Failed to mark as read", error: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ status: "Error", message: "Unauthorized" });
    }
    const orFilters = getAudienceFilters(req.user);

    await Notification.updateMany(
      { recipient: userId, $or: [{ readAt: { $exists: false } }, { readAt: null }] },
      { $set: { readAt: new Date() } }
    );
    await Notification.updateMany(
      {
        recipient: { $exists: false },
        isActive: true,
        $or: orFilters,
        "readBy.user": { $ne: userId },
      },
      { $push: { readBy: { user: userId, readAt: new Date() } } }
    );
    return res.status(200).json({ status: "Success", message: "All notifications marked as read" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Failed to mark all as read", error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ status: "Error", message: "Unauthorized" });
    }
    const orFilters = [{ recipient: userId }, ...getAudienceFilters(req.user)];

    const unreadPersonal = await Notification.countDocuments({
      isActive: true,
      recipient: userId,
      readAt: { $exists: false },
    });

    const broadcastNotifications = await Notification.find({
      isActive: true,
      recipient: { $exists: false },
      $or: orFilters,
    }).select("readBy").lean();

    const unreadBroadcast = broadcastNotifications.filter((n) => !hasUserReadBroadcast(n, userId)).length;

    return res.status(200).json({
      status: "Success",
      data: { unreadCount: unreadPersonal + unreadBroadcast },
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Failed to get unread count", error: error.message });
  }
};

exports.registerPushToken = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const { token } = req.body;
    if (!userId) {
      return res.status(401).json({ status: "Error", message: "Unauthorized" });
    }
    if (!token || typeof token !== "string" || !token.startsWith("ExponentPushToken[")) {
      return res.status(400).json({ status: "Error", message: "Invalid push token" });
    }

    const User = require("../models/user.model");
    await User.findByIdAndUpdate(userId, { $addToSet: { expoPushTokens: token } });

    return res.status(200).json({ status: "Success", message: "Push token registered" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Failed to register push token", error: error.message });
  }
};
