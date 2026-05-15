const Notification = require("../models/notification.model");
const { pushNotifyUser } = require("./pushNotifier");

/**
 * Create an in-app notification for a single user.
 * Safe to call from any controller; never throws (logs only).
 * Also sends a push notification to the user's devices if a token is registered.
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

        // Fire push notification asynchronously; don't block or throw.
        pushNotifyUser(recipient, headline, details || headline, { category, notificationId: String(doc._id), relatedRoomId: relatedRoomId ? String(relatedRoomId) : undefined }).catch(() => {});

        return doc;
    } catch (err) {
        console.warn("[Notifier] notifyUser failed:", err && err.message);
        return null;
    }
}

module.exports = { notifyUser };
