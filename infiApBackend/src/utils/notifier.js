const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const { pushNotifyUser, pushNotifyUsers } = require("./pushNotifier");
const { emitToUser, emitToRoles } = require("./socketManager");

/**
 * Create an in-app notification for a single user.
 * Safe to call from any controller; never throws (logs only).
 * Also sends a push notification to the user's devices if a token is registered.
 * Emits a real-time socket event if the user is online.
 */
async function notifyUser({ recipient, category, headline, details, sentBy, relatedRoomId }) {
    try {
        if (!recipient || !category || !headline) {
            console.log("[Notifier] Skipped: missing recipient, category, or headline");
            return null;
        }
        const doc = await Notification.create({
            category,
            recipient,
            headline: String(headline).trim(),
            details: String(details || "").trim() || String(headline).trim(),
            targetedAudience: "user",
            status: "Sent",
            sentCount: 1,
            sentBy,
            isActive: true,
            relatedRoomId: relatedRoomId || null,
        });

        console.log(`[Notifier] Created notification ${doc._id} for user ${recipient}`);

        let senderInfo = null;
        if (sentBy) {
            try {
                const sender = await User.findById(sentBy).select("name role").lean();
                if (sender) senderInfo = { id: String(sentBy), name: sender.name, role: sender.role };
            } catch (e) { /* ignore */ }
        }

        const payload = {
            id: String(doc._id),
            category: doc.category,
            headline: doc.headline,
            details: doc.details,
            relatedRoomId: doc.relatedRoomId ? String(doc.relatedRoomId) : null,
            createdAt: doc.createdAt,
            read: false,
            sentBy: senderInfo,
        };

        emitToUser(recipient, "notification", payload);

        pushNotifyUser(recipient, headline, details || headline, { category, notificationId: String(doc._id), relatedRoomId: relatedRoomId ? String(relatedRoomId) : undefined }).catch(() => {});

        return doc;
    } catch (err) {
        console.warn("[Notifier] notifyUser failed:", err && err.message);
        return null;
    }
}

/**
 * Notify multiple users by their IDs.
 * Creates DB notifications for each recipient and sends push + socket.
 */
async function notifyUsers({ recipients, category, headline, details, sentBy, relatedRoomId }) {
    try {
        if (!Array.isArray(recipients) || recipients.length === 0 || !category || !headline) {
            console.log("[Notifier] Skipped: missing recipients, category, or headline");
            return [];
        }
        let senderInfo = null;
        if (sentBy) {
            try {
                const sender = await User.findById(sentBy).select("name role").lean();
                if (sender) senderInfo = { id: String(sentBy), name: sender.name, role: sender.role };
            } catch (e) { /* ignore */ }
        }

        const docs = [];
        for (const recipient of recipients) {
            try {
                const doc = await Notification.create({
                    category,
                    recipient,
                    headline: String(headline).trim(),
                    details: String(details || "").trim() || String(headline).trim(),
                    targetedAudience: "user",
                    status: "Sent",
                    sentCount: 1,
                    sentBy,
                    isActive: true,
                    relatedRoomId: relatedRoomId || null,
                });
                docs.push(doc);

                const payload = {
                    id: String(doc._id),
                    category: doc.category,
                    headline: doc.headline,
                    details: doc.details,
                    relatedRoomId: doc.relatedRoomId ? String(doc.relatedRoomId) : null,
                    createdAt: doc.createdAt,
                    read: false,
                    sentBy: senderInfo,
                };
                emitToUser(recipient, "notification", payload);
            } catch (innerErr) {
                console.warn("[Notifier] notifyUsers inner failed:", innerErr && innerErr.message);
            }
        }

        pushNotifyUsers(recipients, headline, details || headline, { category, relatedRoomId: relatedRoomId ? String(relatedRoomId) : undefined }).catch(() => {});
        return docs;
    } catch (err) {
        console.warn("[Notifier] notifyUsers failed:", err && err.message);
        return [];
    }
}

/**
 * Notify all active users with specific roles.
 * Creates DB notifications and sends push + socket.
 */
async function notifyRoleUsers({ roles, category, headline, details, sentBy, relatedRoomId, excludeUserId }) {
    try {
        if (!Array.isArray(roles) || roles.length === 0 || !category || !headline) {
            console.log("[Notifier] Skipped: missing roles, category, or headline");
            return [];
        }
        const query = { role: { $in: roles }, status: "Active" };
        if (excludeUserId) {
            query._id = { $ne: excludeUserId };
        }
        const users = await User.find(query).select("_id").lean();
        const userIds = users.map((u) => u._id.toString());
        if (userIds.length === 0) return [];

        const docs = await notifyUsers({ recipients: userIds, category, headline, details, sentBy, relatedRoomId });
        return docs;
    } catch (err) {
        console.warn("[Notifier] notifyRoleUsers failed:", err && err.message);
        return [];
    }
}

/**
 * Emit a toast/confirmation popup to a specific online user (no DB notification).
 */
function emitToastToUser(userId, type, message, extra = {}) {
    emitToUser(userId, "toast", { type, message, ...extra });
}

module.exports = { notifyUser, notifyUsers, notifyRoleUsers, emitToastToUser };
