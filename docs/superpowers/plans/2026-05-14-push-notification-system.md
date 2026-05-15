# Push Notification System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement native push notifications for infiAp HRMS app using Expo Notifications - enables notifications even when app is closed/background, plus manual admin notification sending.

**Architecture:** Backend stores Expo push tokens per user, uses expo-server-sdk to send notifications via Expo's servers. Mobile app registers for push on startup, handles foreground notifications as toasts, background as native pushes.

**Tech Stack:** Node.js/Express (backend), React Native/Expo (mobile), expo-server-sdk (backend), expo-notifications (mobile)

---

## File Structure

### Backend
- `infiApBackend/src/models/user.model.js` - Add `expoPushToken` field
- `infiApBackend/src/utils/pushSender.js` - NEW: Expo push sending utility
- `infiApBackend/src/controllers/notifications.controller.js` - Add token registration + admin send endpoints
- `infiApBackend/src/routes/notifications.routes.js` - Add new routes

### Mobile
- `infiApHRMS_Mobile/services/pushNotifications.ts` - NEW: Push notification service
- `infiApHRMS_Mobile/context/UserContext.tsx` - Register push token on login
- `infiApHRMS_Mobile/context/NotificationContext.tsx` - Handle foreground push as toast
- `infiApHRMS_Mobile/app.json` - Add notification permissions
- `infiApHRMS_Mobile/services/auth.ts` - Add API call to register token

---

## Task 1: Backend - Add expoPushToken to User Model

**Files:**
- Modify: `infiApBackend/src/models/user.model.js`

- [ ] **Step 1: Read the current user model schema section**

Run: `grep -n "employeeId\|designation\|department" infiApBackend/src/models/user.model.js | head -20`
This shows where to add the new field.

- [ ] **Step 2: Add expoPushToken field to user schema**

Find the section after `phone:` field (around line 60-70) and add:

```javascript
expoPushToken: {
    type: String,
    default: null
},
```

- [ ] **Step 3: Commit**

```bash
git add infiApBackend/src/models/user.model.js
git commit -m "feat: add expoPushToken field to user model for push notifications"
```

---

## Task 2: Backend - Create Push Sender Utility

**Files:**
- Create: `infiApBackend/src/utils/pushSender.js`

- [ ] **Step 1: Create the push sender utility**

Write file `infiApBackend/src/utils/pushSender.js`:

```javascript
const Expo = require('expo-server-sdk');

const expo = new Expo();

/**
 * Send push notification to a user via Expo Push API.
 * @param {string} pushToken - User's Expo push token
 * @param {object} notification - { title, body, data }
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
async function sendPushNotification(pushToken, notification) {
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
        console.warn('Invalid push token:', pushToken);
        return { success: false, error: 'Invalid push token' };
    }

    try {
        const messages = [{
            to: pushToken,
            title: notification.title || 'infiAp Notification',
            body: notification.body || '',
            data: notification.data || {},
            sound: 'default',
            priority: 'high',
        }];

        const chunks = expo.chunkPushNotifications(messages);
        
        for (const chunk of chunks) {
            try {
                const receipts = await expo.sendPushNotificationsAsync(chunk);
                console.log('Push sent, receipts:', receipts.length);
            } catch (error) {
                console.error('Error sending chunk:', error);
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Push notification error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send push notification to multiple users.
 * @param {string[]} pushTokens - Array of Expo push tokens
 * @param {object} notification - { title, body, data }
 */
async function sendBulkPushNotifications(pushTokens, notification) {
    const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));
    
    if (validTokens.length === 0) {
        return { success: false, error: 'No valid push tokens' };
    }

    try {
        const messages = validTokens.map(token => ({
            to: token,
            title: notification.title || 'infiAp Notification',
            body: notification.body || '',
            data: notification.data || {},
            sound: 'default',
        }));

        const chunks = expo.chunkPushNotifications(messages);
        
        let sentCount = 0;
        for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
            sentCount += chunk.length;
        }

        return { success: true, sentCount };
    } catch (error) {
        console.error('Bulk push error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendPushNotification, sendBulkPushNotifications };
```

- [ ] **Step 2: Install expo-server-sdk**

Run: `cd infiApBackend && npm install expo-server-sdk`

Expected: Package installed successfully

- [ ] **Step 3: Commit**

```bash
git add infiApBackend/src/utils/pushSender.js infiApBackend/package.json infiApBackend/package-lock.json
git commit -m "feat: add expo push sender utility for native notifications"
```

---

## Task 3: Backend - Add Token Registration & Admin Send Endpoints

**Files:**
- Modify: `infiApBackend/src/controllers/notifications.controller.js`
- Modify: `infiApBackend/src/routes/notifications.routes.js`

- [ ] **Step 1: Read current notifications controller**

Run: `head -30 infiApBackend/src/controllers/notifications.controller.js`

- [ ] **Step 2: Add imports and new endpoints to notifications.controller.js**

Add these imports at the top (after existing imports):

```javascript
const User = require("../models/user.model");
const { sendPushNotification, sendBulkPushNotifications } = require("../utils/pushSender");
```

Add these new controller functions at the end of the file (before module.exports):

```javascript
// Register/update user's Expo push token
exports.registerPushToken = async (req, res) => {
    try {
        const userId = req.user && req.user._id;
        if (!userId) {
            return res.status(401).json({ status: "Error", message: "Unauthorized" });
        }

        const { expoPushToken } = req.body;
        if (!expoPushToken) {
            return res.status(400).json({ status: "Error", message: "Push token is required" });
        }

        await User.findByIdAndUpdate(userId, { expoPushToken });
        
        return res.status(200).json({ 
            status: "Success", 
            message: "Push token registered successfully" 
        });
    } catch (error) {
        return res.status(500).json({ 
            status: "Error", 
            message: "Failed to register push token", 
            error: error.message 
        });
    }
};

// Admin: Send notification to specific user(s)
exports.sendNotification = async (req, res) => {
    try {
        const { recipientIds, category, headline, details, sendPush } = req.body;
        
        if (!headline || !details) {
            return res.status(400).json({ 
                status: "Error", 
                message: "headline and details are required" 
            });
        }

        // If recipientIds provided, send to specific users
        if (recipientIds && Array.isArray(recipientIds) && recipientIds.length > 0) {
            const users = await User.find({ _id: { $in: recipientIds } }).select('expoPushToken name email');
            
            // Create notification records
            const notifications = users.map(user => ({
                category: category || 'system',
                recipient: user._id,
                headline,
                details,
                targetedAudience: 'user',
                status: 'Sent',
                sentCount: 1,
                isActive: true,
            }));
            
            await Notification.insertMany(notifications);

            // Send push if requested
            if (sendPush) {
                const pushTokens = users
                    .map(u => u.expoPushToken)
                    .filter(t => t);
                
                if (pushTokens.length > 0) {
                    await sendBulkPushNotifications(pushTokens, {
                        title: headline,
                        body: details,
                        data: { category: category || 'system' }
                    });
                }
            }

            return res.status(200).json({ 
                status: "Success", 
                message: `Notification sent to ${users.length} user(s)`,
                sentCount: users.length
            });
        }

        // If no recipientIds, broadcast to all employees
        const allEmployees = await User.find({ role: 'employee' }).select('expoPushToken name');
        
        const notifications = allEmployees.map(user => ({
            category: category || 'system',
            recipient: user._id,
            headline,
            details,
            targetedAudience: 'all_employee',
            status: 'Sent',
            sentCount: 1,
            isActive: true,
        }));
        
        await Notification.insertMany(notifications);

        if (sendPush) {
            const pushTokens = allEmployees
                .map(u => u.expoPushToken)
                .filter(t => t);
            
            if (pushTokens.length > 0) {
                await sendBulkPushNotifications(pushTokens, {
                    title: headline,
                    body: details,
                    data: { category: category || 'system' }
                });
            }
        }

        return res.status(200).json({ 
            status: "Success", 
            message: `Broadcast notification sent to ${allEmployees.length} employee(s)`,
            sentCount: allEmployees.length
        });
    } catch (error) {
        return res.status(500).json({ 
            status: "Error", 
            message: "Failed to send notification", 
            error: error.message 
        });
    }
};

// Get sent notifications (admin)
exports.getSentNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ sentCount: { $exists: true, $gt: 0 } })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('recipient', 'name email');

        return res.status(200).json({ 
            status: "Success", 
            data: notifications 
        });
    } catch (error) {
        return res.status(500).json({ 
            status: "Error", 
            message: "Failed to fetch sent notifications", 
            error: error.message 
        });
    }
};
```

- [ ] **Step 3: Add new routes in notifications.routes.js**

Add these routes after existing routes:

```javascript
// Token registration (authenticated)
router.post("/register-token", verifyJWT, notificationsController.registerPushToken);

// Admin routes (verifyJWT required)
router.post("/send", verifyJWT, notificationsController.sendNotification);
router.get("/sent", verifyJWT, notificationsController.getSentNotifications);
```

- [ ] **Step 4: Commit**

```bash
git add infiApBackend/src/controllers/notifications.controller.js infiApBackend/src/routes/notifications.routes.js
git commit -m "feat: add token registration and admin send notification endpoints"
```

---

## Task 4: Mobile - Create Push Notification Service

**Files:**
- Create: `infiApHRMS_Mobile/services/pushNotifications.ts`

- [ ] **Step 1: Create push notification service**

Write file `infiApHRMS_Mobile/services/pushNotifications.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { request } from './auth';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type PushNotificationData = {
    notificationId?: string;
    category?: string;
    [key: string]: any;
};

/**
 * Request permission for push notifications
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for notifications!');
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF6B6B',
            sound: 'default',
        });
    }

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
        projectId: 'infiAp-hrms', // Replace with your actual project ID
    });

    console.log('Expo Push Token:', expoPushToken);
    return expoPushToken || null;
}

/**
 * Register the push token with backend
 */
export async function registerPushTokenWithBackend(token: string): Promise<boolean> {
    try {
        const response = await request<{ status: string; message: string }>(
            '/notifications/register-token',
            {
                method: 'POST',
                body: { expoPushToken: token },
            }
        );
        console.log('Push token registered:', response.message);
        return true;
    } catch (error) {
        console.error('Failed to register push token:', error);
        return false;
    }
}

/**
 * Initialize push notifications - request permission and register token
 */
export async function initializePushNotifications(): Promise<string | null> {
    try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
            await registerPushTokenWithBackend(token);
        }
        return token;
    } catch (error) {
        console.error('Push notification initialization failed:', error);
        return null;
    }
}

/**
 * Setup notification listeners for handling received notifications
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription[] {
    const subscriptions: Notifications.Subscription[] = [];

    // Notification received while app is in foreground
    const receivedSubscription = Notifications.addNotificationReceivedReceivedListener(
        (notification) => {
            console.log('Notification received:', notification);
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        }
    );
    subscriptions.push(receivedSubscription);

    // User taps on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log('Notification response:', response);
            if (onNotificationResponse) {
                onNotificationResponse(response);
            }
        }
    );
    subscriptions.push(responseSubscription);

    return subscriptions;
}

/**
 * Clean up notification listeners
 */
export function cleanupNotificationListeners(subscriptions: Notifications.Subscription[]): void {
    subscriptions.forEach(sub => sub.remove());
}

/**
 * Get the category for a notification based on data
 */
export function getNotificationCategory(data?: PushNotificationData): string {
    return data?.category || 'system';
}

/**
 * Handle notification tap - navigate to appropriate screen
 */
export function handleNotificationTap(data?: PushNotificationData): { screen: string; params?: any } | null {
    if (!data) return null;

    const category = getNotificationCategory(data.category);

    switch (category) {
        case 'leave':
            return { screen: '/(employee)/leave' };
        case 'attendance':
            return { screen: '/(employee)/attendance' };
        case 'payroll':
            return { screen: '/(employee)/payroll' };
        case 'performance':
            return { screen: '/(employee)/performance' };
        default:
            return { screen: '/(employee)/notifications' };
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add infiApHRMS_Mobile/services/pushNotifications.ts
git commit -m "feat: add push notification service for mobile"
```

---

## Task 5: Mobile - Update UserContext to Register Push Token

**Files:**
- Modify: `infiApHRMS_Mobile/context/UserContext.tsx`

- [ ] **Step 1: Find where user context handles login**

Run: `grep -n "signInUser\|login\|storeAuthSession" infiApHRMS_Mobile/context/UserContext.tsx | head -10`

- [ ] **Step 2: Add push notification import and init call**

Add import at top of file:

```typescript
import { initializePushNotifications } from '../services/pushNotifications';
```

- [ ] **Step 3: Find the login success handler and add push token registration**

Look for where user is set after login (around `setUser(session.user)`) and add after it:

```typescript
// Register for push notifications after successful login
initializePushNotifications().catch(err => 
    console.warn('Push notification registration failed:', err)
);
```

- [ ] **Step 4: Also add push registration on app startup**

Find where the user is loaded from storage (getStoredAuthSession) and add push registration after successful session restore. This ensures tokens are refreshed on app restart:

```typescript
// After successful session restore, re-register push token
if (session?.user) {
    initializePushNotifications().catch(err => 
        console.warn('Push notification registration failed:', err)
    );
}
```

- [ ] **Step 5: Commit**

```bash
git add infiApHRMS_Mobile/context/UserContext.tsx
git commit -m "feat: register push token on login and app startup"
```

---

## Task 6: Mobile - Handle Foreground Push as Toast

**Files:**
- Modify: `infiApHRMS_Mobile/context/NotificationContext.tsx`

- [ ] **Step 1: Read current NotificationContext**

Run: `head -60 infiApHRMS_Mobile/context/NotificationContext.tsx`

- [ ] **Step 2: Add push notification import and handlers**

Add imports:

```typescript
import { 
    initializePushNotifications, 
    setupNotificationListeners, 
    cleanupNotificationListeners,
    type PushNotificationData 
} from '../services/pushNotifications';
import * as Notifications from 'expo-notifications';
```

- [ ] **Step 3: Add push notification setup in NotificationProvider**

Find the `NotificationProvider` component and add this useEffect:

```typescript
useEffect(() => {
    // Initialize push notifications and set up handlers
    const initPush = async () => {
        await initializePushNotifications();
        
        const subscriptions = setupNotificationListeners(
            // Handle notification received while foreground
            (notification) => {
                const data = notification.request.content.data as PushNotificationData;
                const notificationData = data || {};
                
                // Convert push notification to toast format
                const newNotification = {
                    id: notificationData.notificationId || `push-${Date.now()}`,
                    type: (notificationData.category as any) || 'system',
                    title: notification.request.content.title || 'Notification',
                    message: notification.request.content.body || '',
                    description: notification.request.content.body || '',
                    time: 'Just now',
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    sender: 'System',
                    division: 'General',
                    isOnline: true,
                    route: undefined,
                };
                
                // Add to notifications list
                setNotifications(prev => [newNotification, ...prev]);
                // Show as toast
                setToast(newNotification);
            },
            // Handle notification tap
            (response) => {
                const data = response.notification.request.content.data as PushNotificationData;
                // Mark as read if we have ID
                if (data?.notificationId) {
                    markAsRead(data.notificationId);
                }
            }
        );
        
        return subscriptions;
    };
    
    let subscriptions: Notifications.Subscription[] = [];
    
    initPush().then(subs => {
        subscriptions = subs || [];
    });
    
    return () => {
        cleanupNotificationListeners(subscriptions);
    };
}, []);
```

- [ ] **Step 4: Commit**

```bash
git add infiApHRMS_Mobile/context/NotificationContext.tsx
git commit -m "feat: handle foreground push notifications as toasts"
```

---

## Task 7: Mobile - Add Notification Permissions

**Files:**
- Modify: `infiApHRMS_Mobile/app.json`

- [ ] **Step 1: Read current app.json**

Run: `head -30 infiApHRMS_Mobile/app.json`

- [ ] **Step 2: Add notification permission to app.json**

Add to the `expo` section:

```json
"permissions": [
    "NOTIFICATIONS"
],
```

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Mobile/app.json
git commit -m "feat: add notification permissions to app.json"
```

---

## Task 8: Test Full Notification Flow

**Files:**
- Test: Full flow

- [ ] **Step 1: Start backend server**

Run: `cd infiApBackend && npm start`
Expected: Server running on port 3000

- [ ] **Step 2: Start mobile app**

Run: `cd infiApHRMS_Mobile && npx expo start`
Expected: App starts, requests notification permission

- [ ] **Step 3: Login and verify token registration**

Check backend logs for: "Push token registered successfully"

- [ ] **Step 4: Test admin send notification**

Call API:
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"headline": "Test Notification", "details": "This is a test push notification", "category": "system", "sendPush": true}'
```

Expected: Push notification appears on device

- [ ] **Step 5: Test auto-trigger on leave approval**

Approve a leave request and verify notification appears

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verify push notification system end-to-end"
```

---

## Summary

Total 8 tasks:
1. Add expoPushToken to User Model
2. Create Push Sender Utility  
3. Add Token Registration & Admin Send Endpoints
4. Create Push Notification Service
5. Update UserContext to Register Push Token
6. Handle Foreground Push as Toast
7. Add Notification Permissions
8. Test Full Flow