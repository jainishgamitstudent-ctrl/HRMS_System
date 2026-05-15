# Attendance Check-in/Check-out System Design

## 1. Overview

A secure employee check-in/check-out system that enforces location services, provides notification-based reminders, and handles attendance logging with proper state management.

## 2. Architecture

### Components

| Component | Purpose |
|-----------|---------|
| `AttendanceContext` | State management for check-in status |
| `useLocationGuard` | Hook for location permission & accuracy validation |
| `useAttendanceApi` | Hook for API calls |
| `LocationGuard` | UI component for location status |
| `StatusCard` | Shows current attendance status |
| `ActionButton` | Dynamic check-in/check-out button |

### File Structure

```
infiApHRMS_Mobile/
├── context/
│   └── AttendanceContext.tsx    # Attendance state management
├── hooks/
│   ├── useLocationGuard.ts       # Location validation hook
│   └── useAttendanceApi.ts      # API integration hook
├── components/
│   ├── LocationGuard.tsx         # Location status UI
│   ├── StatusCard.tsx           # Status display
│   └── ActionButton.tsx          # Dynamic action button
├── services/
│   └── attendanceApi.ts          # API service functions
└── app/(employee)/
    └── attendance-logging.tsx   # Main screen (updated)
```

## 3. Data Flow

1. **App Opens** → Fetch attendance status
2. **Status Loaded** → Show appropriate UI (Checked In / Checked Out)
3. **User Taps Action** → Validate location (permission + accuracy)
4. **Location Valid** → Submit punch → Show confirmation notification → Refresh status
5. **Location Invalid** → Show appropriate error message

## 4. API Integration

### Endpoints (Existing)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/emp-punch` | POST | Check-in (PunchType=1) or Check-out (PunchType=2) |
| `/attendance-history` | GET | Fetch attendance records |

### Status Determination

Since `GET /api/attendance-status` may not exist, derive status from:
- Fetch today's attendance from `/attendance-history`
- If last record has no check-out → Checked In
- If last record has check-out OR no records → Checked Out

## 5. Location Guard Rules

| State | Condition | UI |
|-------|-----------|-----|
| Loading | Fetching location | Show spinner |
| Ready | Permission granted + accuracy ≤ 50m | Green indicator |
| Permission Denied | Permission not granted | Red indicator + "Enable Location" button |
| Poor Accuracy | Accuracy > 50m | Yellow indicator + "Move to clearer area" message |
| Location Disabled | Device location OFF | Red indicator + "Enable Location" button |

### Accuracy Validation

- Use `expo-location` to get current position
- Reject if `accuracy > 50` meters
- Show guidance: "Move to an open area for better GPS accuracy"

## 6. Notification System

### Behavior
- **Always ON** by default - no toggle in UI
- Check-in reminders sent via server push notifications (handled by existing backend)
- Confirmation notification on successful check-in/check-out using local toast

### Confirmation Notification
- Show local toast/alert with:
  - Action type (Checked In / Checked Out)
  - Timestamp
  - Location summary

## 7. Check-in/Check-out Logic

### State Rules
- **Check-in allowed**: When status is "checked out" or no records exist
- **Check-out allowed**: When status is "checked in"

### Data Captured
- `userId` - From stored session
- `timestamp` - Current date/time
- `latitude` - From GPS
- `longitude` - From GPS
- `PunchType` - 1 for check-in, 2 for check-out

### Duplicate Prevention
- Disable button during submission (loading state)
- 3-second cooldown after successful action
- Prevent rapid re-submission

## 8. UI/UX Design

### Main Screen Layout (attendance-logging.tsx)

```
┌─────────────────────────────────┐
│ Header: "Attendance Logging"   │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │      STATUS CARD            │ │
│ │  [Icon] Checked In/Out     │ │
│ │  Last: 9:05 AM             │ │
│ │  Location: Office           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      MAP WITH LOCATION      │ │
│ │  [User Location Marker]     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │    LOCATION STATUS BAR      │ │
│ │  ● Verified / ● Poor Acc   │ │
│ │  Accuracy: 12m              │ │
│ └─────────────────────────────┘ │
│                                 │
│ [    CHECK-IN BUTTON     ]     │
│ or                             │
│ [    CHECK-OUT BUTTON    ]     │
│                                 │
│ ┌─────────────────────────────┐ │
│ │      WORK MODE SELECT      │ │
│ │ [Office] [WFH] [Meeting]   │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Color Scheme
- Primary: `#4f46e5` (Indigo)
- Success (Checked In): `#16a34a` (Green)
- Warning (Poor Accuracy): `#f59e0b` (Amber)
- Error (No Location): `#dc2626` (Red)
- Background: `#f8fafc`

### Typography
- Headers: 18px Bold
- Body: 14px Regular
- Status: 16px Semi-bold

## 9. Error Handling

| Error | User Message | Action |
|-------|--------------|--------|
| 401 Unauthorized | "Session expired" | Redirect to login |
| 403 Forbidden | "Contact admin for access" | Show support info |
| 500 Server Error | "Server error. Tap to retry" | Show retry button |
| Network Offline | "No internet connection" | Show offline banner + retry |
| Location Disabled | "Enable location to check-in" | "Open Settings" button |
| Poor GPS | "Move to clearer area" | Show accuracy value |

## 10. Implementation Notes

- Use existing `expo-location` for GPS
- Reuse existing `getExactCurrentLocation` from utils
- Use SecureStore for auth token (already implemented)
- Follow existing API error handling pattern
- Include loading states for all async operations