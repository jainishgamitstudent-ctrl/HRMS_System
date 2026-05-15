const User = require("../models/user.model");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send Expo push notification(s) safely.
 * @param {Array<{to: string, title: string, body: string, data?: object}>} messages
 */
async function sendExpoPushNotifications(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return;

    try {
        const chunks = [];
        for (let i = 0; i < messages.length; i += 100) {
            chunks.push(messages.slice(i, i + 100));
        }

        for (const chunk of chunks) {
            const response = await fetch(EXPO_PUSH_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Accept-encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(chunk),
            });

            const json = await response.json();
            if (json.data) {
                const toRemove = [];
                json.data.forEach((ticket, idx) => {
                    if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
                        toRemove.push(chunk[idx].to);
                    }
                });
                if (toRemove.length > 0) {
                    await User.updateMany(
                        { expoPushTokens: { $in: toRemove } },
                        { $pull: { expoPushTokens: { $in: toRemove } } }
                    );
                }
            }
        }
    } catch (err) {
        console.warn("sendExpoPushNotifications failed:", err && err.message);
    }
}

/**
 * Push notify a single user by their MongoDB _id.
 * @param {string} userId
 * @param {string} title
 * @param {string} body
 * @param {object} [data]
 */
async function pushNotifyUser(userId, title, body, data = {}) {
    if (!userId || !title) {
        console.log("[PushNotifier] Skipped: missing userId or title");
        return;
    }
    try {
        const user = await User.findById(userId).select("expoPushTokens name").lean();
        if (!user || !Array.isArray(user.expoPushTokens) || user.expoPushTokens.length === 0) {
            console.log(`[PushNotifier] No push tokens for user ${userId}`);
            return;
        }

        console.log(`[PushNotifier] Sending push to user ${user.name || userId}, tokens: ${user.expoPushTokens.length}`);

        const messages = user.expoPushTokens.map((token) => ({
            to: token,
            sound: "default",
            title: String(title).slice(0, 100),
            body: String(body || "").slice(0, 200),
            data: { ...data, userId: String(userId) },
        }));

        await sendExpoPushNotifications(messages);
    } catch (err) {
        console.warn("[PushNotifier] pushNotifyUser failed:", err && err.message);
    }
}

/**
 * Push notify multiple users by their MongoDB _ids.
 * @param {string[]} userIds
 * @param {string} title
 * @param {string} body
 * @param {object} [data]
 */
async function pushNotifyUsers(userIds, title, body, data = {}) {
    if (!Array.isArray(userIds) || userIds.length === 0 || !title) return;
    try {
        const users = await User.find({ _id: { $in: userIds } })
            .select("expoPushTokens")
            .lean();

        const messages = [];
        users.forEach((user) => {
            if (Array.isArray(user.expoPushTokens)) {
                user.expoPushTokens.forEach((token) => {
                    messages.push({
                        to: token,
                        sound: "default",
                        title: String(title).slice(0, 100),
                        body: String(body || "").slice(0, 200),
                        data: { ...data, userId: String(user._id) },
                    });
                });
            }
        });

        if (messages.length > 0) {
            await sendExpoPushNotifications(messages);
        }
    } catch (err) {
        console.warn("pushNotifyUsers failed:", err && err.message);
    }
}

module.exports = { sendExpoPushNotifications, pushNotifyUser, pushNotifyUsers };
