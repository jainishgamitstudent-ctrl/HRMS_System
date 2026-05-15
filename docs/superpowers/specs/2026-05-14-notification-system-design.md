# infiAp Notification System Design Spec

## Overview

Implement a full push notification system for the infiAp HRMS app with:
- Native push notifications (iOS/Android system tray)
- In-app toast popups (already built)
- Notification center (already built)
- Auto-triggers on system events
- Admin/HR manual notification sending

**Tech Stack:** Expo Notifications (mobile), Node.js/Express (backend)

---

## Architecture

```
[Admin HR Web]  [System Events]  →  [Backend API]  →  [Expo Push Service]  →  [Mobile App]
                                                               ↓
                    Leave Approved/Rejected           Device Tokens
                    Payroll Processed                 (stored per user)
                    Profile Updated
                    Manual Admin Send
```

### Data Flow

1. Mobile app registers device with Expo Push token
2. Token stored in user record on backend
3. Backend triggers notification via Expo Push API
4. Expo delivers to device
5. User sees native notification OR in-app toast (if app open)

---

## Backend Changes

### 1. User Model Extension
Add `expoPushToken` field to store user's device token.

### 2. Notification Model
Already has: `category`, `headline`, `details`, `recipient`, `isRead`, `readAt`

Add for push:
- `pushStatus`: 'pending' | 'sent' | 'failed'
- `sentAt`: timestamp

### 3. New API Endpoints

#### Mobile → Backend

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications/register-token` | Register/update Expo push token |
| GET | `/notifications/me` | Get user's notifications (existing) |
| PATCH | `/notifications/:id/read` | Mark as read (existing) |
| PATCH | `/notifications/me/read-all` | Mark all read (existing) |

#### Admin Web → Backend

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications/send` | Send notification to user(s) |
| GET | `/notifications/sent` | List sent notifications |
| DELETE | `/notifications/:id` | Delete notification |

### 4. Auto-Trigger Events

| Event | Trigger | Notification |
|-------|---------|--------------|
| Leave Approved | `approveActivity` controller | "Your leave request has been approved" |
| Leave Rejected | `approveActivity` controller | "Your leave request was rejected" |
| Payroll Processed | Payroll endpoint called | "Your salary for [month] has been processed" |
| Profile Updated | Profile update endpoint | "Your profile has been updated" |
| New Announcement | Admin sends | Broadcast to relevant employees |

### 5. Expo Push Integration

Use `expo-server-sdk-node` on backend to send push notifications.

```
npm install expo-server-sdk
```

---

## Mobile Changes

### 1. Install Dependencies

```bash
npx expo install expo-notifications
npx expo install expo-device
```

### 2. Permissions

Add to `app.json`:
```json
"permissions": ["NOTIFICATIONS"]
```

### 3. Notification Service (`services/notifications.ts`)

- `registerForPushNotificationsAsync()`: Get & store token
- `setupNotificationListeners()`: Handle foreground notifications
- `handleNotificationResponse()`: Handle tap actions

### 4. Update User Context

On login/profile update, register push token with backend.

### 5. Notification Behavior

- **App foreground**: Show in-app toast popup
- **App background**: Show native push notification
- **App closed**: Native push in notification center

### 6. Update NotificationContext

Add push token registration and foreground notification handling.

---

## Notification Categories & Actions

| Category | Icon | Color | Actions |
|----------|------|-------|---------|
| leave | calendar | #3b82f6 | View Leave |
| attendance | time | #ef4444 | View Attendance |
| payroll | cash | #8b5cf6 | View Payroll |
| performance | trending-up | #10b981 | View Performance |
| system | megaphone | #f59e0b | Open App |

---

## Implementation Order

1. Backend: Add `expoPushToken` to user model
2. Backend: Install expo-server-sdk
3. Backend: Create push notification sender utility
4. Backend: Add `/notifications/register-token` endpoint
5. Backend: Add `/notifications/send` admin endpoint
6. Backend: Wire auto-triggers in existing controllers
7. Mobile: Install expo-notifications
8. Mobile: Create notification service
9. Mobile: Update UserContext to register token
10. Mobile: Handle foreground notifications as toast
11. Mobile: Test full flow

---

## Files to Create/Modify

### Backend

| File | Action |
|------|--------|
| `src/models/user.model.js` | Add `expoPushToken` field |
| `src/utils/pushSender.js` | New - Expo push utility |
| `src/controllers/notifications.controller.js` | Add register-token, send endpoints |
| `src/routes/notifications.routes.js` | Add new routes |
| `src/controllers/leave.controller.js` | Add auto-trigger on approve/reject |
| `src/controllers/employee.controller.js` | Add auto-trigger on payroll/profile |

### Mobile

| File | Action |
|------|--------|
| `infiApHRMS_Mobile/services/notifications.ts` | New - push notification service |
| `infiApHRMS_Mobile/context/UserContext.tsx` | Register push token on login |
| `infiApHRMS_Mobile/context/NotificationContext.tsx` | Handle foreground notifications |
| `infiApHRMS_Mobile/app.json` | Add notification permissions |

---

## Testing Checklist

- [ ] User receives push when leave approved
- [ ] User receives push when leave rejected
- [ ] User receives push when payroll processed
- [ ] Admin can send manual notification
- [ ] Toast appears when app is foreground
- [ ] Native notification appears when app is background
- [ ] Tapping notification opens app to correct screen
- [ ] Notification center shows all notifications

---

## Rollout Notes

1. Users need to grant notification permission on first launch
2. Push token changes on app reinstall — re-register on login
3. Expo Push has rate limits — batch notifications if needed
4. Fallback: if push fails, notification is still stored in DB (appears in notification center on next poll)