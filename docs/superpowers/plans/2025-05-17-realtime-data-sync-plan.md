# Real-time Data Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real-time data synchronization so changes in backend (employee, leave, WFH, request room) immediately reflect in mobile and desktop clients without manual refresh.

**Architecture:** Socket.IO push-based system where controllers emit events on CRUD operations, clients subscribe via reusable hooks that auto-update React state.

**Tech Stack:** Socket.IO (backend + client), React hooks, React Native (mobile), React (desktop)

---

## File Structure Overview

### Backend
- Modify: `infiApBackend/src/controllers/employee.controller.js`
- Modify: `infiApBackend/src/controllers/leave.controller.js`
- Modify: `infiApBackend/src/controllers/wfh.controller.js`
- Modify: `infiApBackend/src/controllers/requestRoom.controller.js`

### Mobile (React Native)
- Modify: `infiApHRMS_Mobile/services/socket.ts`
- Create: `infiApHRMS_Mobile/hooks/useRealTime.js`
- Modify: Integrate into existing screens

### Desktop (React JS)
- Create: `infiApHRMS_Desktop/src/services/socket.js`
- Create: `infiApHRMS_Desktop/src/hooks/useRealTime.js`
- Modify: Integrate into existing components

---

## Phase 1: Backend Socket Events

### Task 1: Add socket event helper

**Files:**
- Modify: `infiApBackend/src/utils/socketManager.js`

- [ ] **Step 1: Add emitEntityEvent helper function**

After line 97 in `socketManager.js`, add:

```javascript
/**
 * Emit entity change event to appropriate rooms.
 * @param {string} entityType - 'employee', 'leave', 'wfh', 'requestRoom'
 * @param {string} action - 'created', 'updated', 'deleted'
 * @param {object} data - The entity data
 * @param {object} options - { userId, role, targetRoles }
 */
function emitEntityEvent(entityType, action, data, options = {}) {
    if (!io) return;
    const payload = {
        action,
        data,
        timestamp: new Date().toISOString()
    };
    const eventName = `${entityType}:${action}`;
    
    // Emit to specific user
    if (options.userId) {
        io.to(`user_${String(options.userId)}`).emit(eventName, payload);
    }
    // Emit to role rooms
    if (options.targetRoles && Array.isArray(options.targetRoles)) {
        options.targetRoles.forEach(role => {
            io.to(`role_${role}`).emit(eventName, payload);
        });
    }
    // Broadcast to all
    if (options.broadcast) {
        io.emit(eventName, payload);
    }
}
```

- [ ] **Step 2: Export the new function**

Update the exports at bottom of `socketManager.js`:

```javascript
module.exports = {
    initSocketManager,
    emitToUser,
    emitToRoles,
    broadcast,
    getIO,
    emitEntityEvent,
};
```

- [ ] **Step 3: Commit**

```bash
git add infiApBackend/src/utils/socketManager.js
git commit -m "feat: add emitEntityEvent helper for real-time sync"
```

---

### Task 2: Emit events in employee controller

**Files:**
- Modify: `infiApBackend/src/controllers/employee.controller.js:1-50` (imports section)

- [ ] **Step 1: Import emitEntityEvent**

Add after existing imports (around line 5):

```javascript
const { emitEntityEvent } = require('../utils/socketManager');
```

- [ ] **Step 2: Find POST create employee endpoint**

Search for `employeeController.createEmployee` or the route that creates employees. Look for the success response after save.

- [ ] **Step 3: Add emit after successful create**

Find where new employee is created successfully and add after the save:

```javascript
// Emit real-time event
emitEntityEvent('employee', 'created', employee, { 
    targetRoles: ['HR', 'Admin', 'Employee'] 
});
```

- [ ] **Step 4: Find PUT update employee endpoint**

Search for `updateEmployee` or the route that updates employees.

- [ ] **Step 5: Add emit after successful update**

After the update succeeds:

```javascript
emitEntityEvent('employee', 'updated', updatedEmployee, { 
    targetRoles: ['HR', 'Admin', 'Employee'] 
});
```

- [ ] **Step 6: Find DELETE employee endpoint**

Search for delete employee route.

- [ ] **Step 7: Add emit after successful delete**

After deletion:

```javascript
emitEntityEvent('employee', 'deleted', { _id: employeeId }, { 
    targetRoles: ['HR', 'Admin', 'Employee'] 
});
```

- [ ] **Step 8: Commit**

```bash
git add infiApBackend/src/controllers/employee.controller.js
git commit -m "feat: emit employee real-time events on CRUD"
```

---

### Task 3: Emit events in leave controller

**Files:**
- Modify: `infiApBackend/src/controllers/leave.controller.js`

- [ ] **Step 1: Import emitEntityEvent**

Add import at top:

```javascript
const { emitEntityEvent } = require('../utils/socketManager');
```

- [ ] **Step 2: Find leave request creation endpoint**

Search for POST route that creates leave requests.

- [ ] **Step 3: Add emit after create**

After successful leave creation:

```javascript
emitEntityEvent('leave', 'created', leaveRequest, { 
    targetRoles: ['HR', 'Admin'],
    userId: leaveRequest.employeeId 
});
```

- [ ] **Step 4: Find leave update endpoint (status change)**

Search for PUT route that updates leave status (approve/reject).

- [ ] **Step 5: Add emit after status change**

```javascript
emitEntityEvent('leave', 'updated', updatedLeave, { 
    targetRoles: ['HR', 'Admin'],
    userId: updatedLeave.employeeId 
});
```

- [ ] **Step 6: Find leave delete endpoint**

- [ ] **Step 7: Add emit after delete**

```javascript
emitEntityEvent('leave', 'deleted', { _id: leaveId }, { 
    targetRoles: ['HR', 'Admin'] 
});
```

- [ ] **Step 8: Commit**

```bash
git add infiApBackend/src/controllers/leave.controller.js
git commit -m "feat: emit leave real-time events on CRUD"
```

---

### Task 4: Emit events in WFH controller

**Files:**
- Modify: `infiApBackend/src/controllers/wfh.controller.js`

- [ ] **Step 1: Import emitEntityEvent**

Add import at top:

```javascript
const { emitEntityEvent } = require('../utils/socketManager');
```

- [ ] **Step 2: Find WFH request creation endpoint**

Search for POST route that creates WFH requests.

- [ ] **Step 3: Add emit after create**

```javascript
emitEntityEvent('wfh', 'created', wfhRequest, { 
    targetRoles: ['HR', 'Admin'],
    userId: wfhRequest.employeeId 
});
```

- [ ] **Step 4: Find WFH update endpoint (status change)**

- [ ] **Step 5: Add emit after status change**

```javascript
emitEntityEvent('wfh', 'updated', updatedWFH, { 
    targetRoles: ['HR', 'Admin'],
    userId: updatedWFH.employeeId 
});
```

- [ ] **Step 6: Find WFH delete endpoint**

- [ ] **Step 7: Add emit after delete**

```javascript
emitEntityEvent('wfh', 'deleted', { _id: wfhId }, { 
    targetRoles: ['HR', 'Admin'] 
});
```

- [ ] **Step 8: Commit**

```bash
git add infiApBackend/src/controllers/wfh.controller.js
git commit -m "feat: emit wfh real-time events on CRUD"
```

---

### Task 5: Emit events in request room controller

**Files:**
- Modify: `infiApBackend/src/controllers/requestRoom.controller.js`

- [ ] **Step 1: Import emitEntityEvent**

Add import at top:

```javascript
const { emitEntityEvent } = require('../utils/socketManager');
```

- [ ] **Step 2: Find request room creation endpoint**

- [ ] **Step 3: Add emit after create**

```javascript
emitEntityEvent('requestRoom', 'created', roomRequest, { 
    targetRoles: ['HR', 'Admin'],
    userId: roomRequest.requestedBy 
});
```

- [ ] **Step 4: Find request room update endpoint**

- [ ] **Step 5: Add emit after update**

```javascript
emitEntityEvent('requestRoom', 'updated', updatedRequest, { 
    targetRoles: ['HR', 'Admin'],
    userId: updatedRequest.requestedBy 
});
```

- [ ] **Step 6: Find request room delete endpoint**

- [ ] **Step 7: Add emit after delete**

```javascript
emitEntityEvent('requestRoom', 'deleted', { _id: requestId }, { 
    targetRoles: ['HR', 'Admin'] 
});
```

- [ ] **Step 8: Commit**

```bash
git add infiApBackend/src/controllers/requestRoom.controller.js
git commit -m "feat: emit requestRoom real-time events on CRUD"
```

---

## Phase 2: Mobile (React Native) Hooks

### Task 6: Enhance mobile socket service

**Files:**
- Modify: `infiApHRMS_Mobile/services/socket.ts`

- [ ] **Step 1: Add subscribe/unsubscribe methods**

After the existing `getSocket()` function (around line 73), add:

```javascript
export function subscribeToEvent(event: string, callback: (data: any) => void): () => void {
    const socket = getSocket();
    if (!socket) {
        console.log('[Socket] Cannot subscribe - not connected');
        return () => {};
    }
    
    socket.on(event, callback);
    console.log(`[Socket] Subscribed to: ${event}`);
    
    // Return unsubscribe function
    return () => {
        socket.off(event, callback);
        console.log(`[Socket] Unsubscribed from: ${event}`);
    };
}

export function subscribeToEntity(entity: string, callbacks: {
    created?: (data: any) => void;
    updated?: (data: any) => void;
    deleted?: (data: any) => void;
}): () => void {
    const unsubscribers: (() => void)[] = [];
    
    if (callbacks.created) {
        unsubscribers.push(subscribeToEvent(`${entity}:created`, callbacks.created));
    }
    if (callbacks.updated) {
        unsubscribers.push(subscribeToEvent(`${entity}:updated`, callbacks.updated));
    }
    if (callbacks.deleted) {
        unsubscribers.push(subscribeToEvent(`${entity}:deleted`, callbacks.deleted));
    }
    
    return () => {
        unsubscribers.forEach(fn => fn());
    };
}
```

- [ ] **Step 2: Commit**

```bash
git add infiApHRMS_Mobile/services/socket.ts
git commit -m "feat: add socket subscription methods for real-time events"
```

---

### Task 7: Create mobile real-time hooks

**Files:**
- Create: `infiApHRMS_Mobile/hooks/useRealTime.js`

- [ ] **Step 1: Create the useRealTimeEntity hook**

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToEntity, getSocket, connectSocket } from '../services/socket';

/**
 * Hook for real-time entity updates
 * @param {string} entityType - 'employee', 'leave', 'wfh', 'requestRoom'
 * @param {function} fetchFn - Function to fetch initial data
 * @param {object} options - { onCreated, onUpdated, onDeleted } handlers
 */
export function useRealTimeEntity(entityType, fetchFn, options = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);
    
    // Load initial data
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await fetchFn();
            if (isMounted.current) {
                setData(result);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err.message);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [fetchFn]);
    
    // Set up socket subscription
    useEffect(() => {
        isMounted.current = true;
        
        // Connect socket and load initial data
        const init = async () => {
            await connectSocket();
            await loadData();
        };
        init();
        
        // Subscribe to real-time events
        const unsubscribe = subscribeToEntity(entityType, {
            created: (payload) => {
                if (!isMounted.current) return;
                if (options.onCreated) {
                    options.onCreated(payload.data, setData);
                } else {
                    // Default: prepend to list
                    setData(prev => [payload.data, ...prev]);
                }
            },
            updated: (payload) => {
                if (!isMounted.current) return;
                if (options.onUpdated) {
                    options.onUpdated(payload.data, setData);
                } else {
                    // Default: update item in list
                    setData(prev => prev.map(item => 
                        item._id === payload.data._id ? { ...item, ...payload.data } : item
                    ));
                }
            },
            deleted: (payload) => {
                if (!isMounted.current) return;
                if (options.onDeleted) {
                    options.onDeleted(payload.data, setData);
                } else {
                    // Default: remove from list
                    setData(prev => prev.filter(item => item._id !== payload.data._id));
                }
            },
        });
        
        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, [entityType, loadData]);
    
    const refresh = useCallback(async () => {
        await loadData();
    }, [loadData]);
    
    return { data, loading, error, refresh };
}

/**
 * Hook for real-time employees
 */
export function useRealTimeEmployees(fetchFn) {
    return useRealTimeEntity('employee', fetchFn);
}

/**
 * Hook for real-time leave requests
 */
export function useRealTimeLeaveRequests(fetchFn) {
    return useRealTimeEntity('leave', fetchFn);
}

/**
 * Hook for real-time WFH requests
 */
export function useRealTimeWFHRequests(fetchFn) {
    return useRealTimeEntity('wfh', fetchFn);
}

/**
 * Hook for real-time request rooms
 */
export function useRealTimeRequestRooms(fetchFn) {
    return useRealTimeEntity('requestRoom', fetchFn);
}
```

- [ ] **Step 2: Export from index if needed**

Check if there's an index file in hooks folder, add export if needed.

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Mobile/hooks/useRealTime.js
git commit -m "feat: add real-time hooks for mobile"
```

---

### Task 8: Integrate hooks into mobile screens

**Files to modify (identify from existing code):**
- Employee directory screen
- Leave request screen
- WFH screen
- Request room screen

- [ ] **Step 1: Identify target screens**

Look at existing mobile screens that fetch and display employee/leave/wfh/requestRoom data. Common patterns:
- `app/(hr)/` folder for HR screens
- `app/(employee)/` folder for employee screens
- `app/(shared)/` folder for shared screens

- [ ] **Step 2: Replace useState/useEffect with useRealTime hook**

For each screen, find where data is fetched and replace:

```javascript
// OLD
const [employees, setEmployees] = useState([]);
useEffect(() => { fetchEmployees().then(setEmployees); }, []);
```

```javascript
// NEW
import { useRealTimeEmployees } from '../hooks/useRealTime';
const { data: employees, loading, refresh } = useRealTimeEmployees(fetchEmployees);
```

- [ ] **Step 3: Commit each screen**

```bash
git add infiApHRMS_Mobile/app/... 
git commit -m "feat: integrate real-time updates into [screen name]"
```

---

## Phase 3: Desktop (React JS) Implementation

### Task 9: Create desktop socket service

**Files:**
- Create: `infiApHRMS_Desktop/src/services/socket.js`

- [ ] **Step 1: Create socket client service**

```javascript
import { io } from 'socket.io-client';
import { API_CONFIG } from '../config';
import { getAuthToken } from './tokenStore';

let socket = null;
let isConnecting = false;

function getSocketURL() {
    return API_CONFIG.socketURL || window.location.origin;
}

export async function connectSocket() {
    if (socket?.connected) {
        return socket;
    }
    if (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return socket;
    }
    
    const token = getAuthToken();
    if (!token) {
        console.log('[Socket] No auth token, skipping connection');
        return null;
    }
    
    isConnecting = true;
    
    try {
        const url = getSocketURL();
        console.log('[Socket] Connecting to:', url);
        
        socket = io(url, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            timeout: 20000,
        });
        
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket?.id);
        });
        
        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection error:', err.message);
        });
        
        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });
        
        return socket;
    } finally {
        isConnecting = false;
    }
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function isSocketConnected() {
    return socket?.connected ?? false;
}

export function subscribeToEvent(event, callback) {
    const s = getSocket();
    if (!s) {
        console.log('[Socket] Cannot subscribe - not connected');
        return () => {};
    }
    
    s.on(event, callback);
    console.log(`[Socket] Subscribed to: ${event}`);
    
    return () => {
        s.off(event, callback);
        console.log(`[Socket] Unsubscribed from: ${event}`);
    };
}

export function subscribeToEntity(entity, callbacks) {
    const unsubscribers = [];
    
    if (callbacks.created) {
        unsubscribers.push(subscribeToEvent(`${entity}:created`, callbacks.created));
    }
    if (callbacks.updated) {
        unsubscribers.push(subscribeToEvent(`${entity}:updated`, callbacks.updated));
    }
    if (callbacks.deleted) {
        unsubscribers.push(subscribeToEvent(`${entity}:deleted`, callbacks.deleted));
    }
    
    return () => {
        unsubscribers.forEach(fn => fn());
    };
}
```

- [ ] **Step 2: Check desktop token store**

Verify `infiApHRMS_Desktop/src/services/tokenStore.js` has `getAuthToken` function or adjust accordingly.

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Desktop/src/services/socket.js
git commit -m "feat: add socket client for desktop"
```

---

### Task 10: Create desktop real-time hooks

**Files:**
- Create: `infiApHRMS_Desktop/src/hooks/useRealTime.js`

- [ ] **Step 1: Create the hook file**

```javascript
import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToEntity, connectSocket } from '../services/socket';

/**
 * Hook for real-time entity updates (Desktop version)
 */
export function useRealTimeEntity(entityType, fetchFn, options = {}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMounted = useRef(true);
    
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const result = await fetchFn();
            if (isMounted.current) {
                setData(result);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err.message);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [fetchFn]);
    
    useEffect(() => {
        isMounted.current = true;
        
        const init = async () => {
            await connectSocket();
            await loadData();
        };
        init();
        
        const unsubscribe = subscribeToEntity(entityType, {
            created: (payload) => {
                if (!isMounted.current) return;
                if (options.onCreated) {
                    options.onCreated(payload.data, setData);
                } else {
                    setData(prev => [payload.data, ...prev]);
                }
            },
            updated: (payload) => {
                if (!isMounted.current) return;
                if (options.onUpdated) {
                    options.onUpdated(payload.data, setData);
                } else {
                    setData(prev => prev.map(item => 
                        item._id === payload.data._id ? { ...item, ...payload.data } : item
                    ));
                }
            },
            deleted: (payload) => {
                if (!isMounted.current) return;
                if (options.onDeleted) {
                    options.onDeleted(payload.data, setData);
                } else {
                    setData(prev => prev.filter(item => item._id !== payload.data._id));
                }
            },
        });
        
        return () => {
            isMounted.current = false;
            unsubscribe();
        };
    }, [entityType, loadData]);
    
    const refresh = useCallback(async () => {
        await loadData();
    }, [loadData]);
    
    return { data, loading, error, refresh };
}

export function useRealTimeEmployees(fetchFn) {
    return useRealTimeEntity('employee', fetchFn);
}

export function useRealTimeLeaveRequests(fetchFn) {
    return useRealTimeEntity('leave', fetchFn);
}

export function useRealTimeWFHRequests(fetchFn) {
    return useRealTimeEntity('wfh', fetchFn);
}

export function useRealTimeRequestRooms(fetchFn) {
    return useRealTimeEntity('requestRoom', fetchFn);
}
```

- [ ] **Step 2: Commit**

```bash
git add infiApHRMS_Desktop/src/hooks/useRealTime.js
git commit -m "feat: add real-time hooks for desktop"
```

---

### Task 11: Integrate hooks into desktop components

**Files to identify:**
- Look at `infiApHRMS_Desktop/src/pages/` for employee, leave, WFH, request room components

- [ ] **Step 1: Identify target components**

- [ ] **Step 2: Replace useState/useEffect with useRealTime hook**

- [ ] **Step 3: Commit**

```bash
git add infiApHRMS_Desktop/src/pages/...
git commit -m "feat: integrate real-time updates into [component name]"
```

---

## Phase 4: Testing

### Task 12: Verify real-time sync

- [ ] **Step 1: Start backend server**

```bash
cd infiApBackend && npm run dev
```

- [ ] **Step 2: Start mobile app**

```bash
cd infiApHRMS_Mobile && npx expo start
```

- [ ] **Step 3: Start desktop app**

```bash
cd infiApHRMS_Desktop && npm run dev
```

- [ ] **Step 4: Test data changes**

1. Make a change via one client (e.g., create employee from desktop)
2. Verify other clients receive updates without refresh
3. Test update and delete scenarios

- [ ] **Step 5: Commit**

```bash
git commit -m "test: verify real-time sync works across all clients"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Backend | 1-5 | Add socket event emission in all controllers |
| Mobile | 6-8 | Enhance socket service, create hooks, integrate |
| Desktop | 9-11 | Create socket service, hooks, integrate |
| Testing | 12 | Verify real-time sync works |

---

## Self-Review Checklist

- [ ] Spec coverage: All 4 data types (employee, leave, wfh, requestRoom) covered
- [ ] No placeholders: All code blocks have actual implementation
- [ ] Type consistency: Entity names match across all tasks (`employee`, `leave`, `wfh`, `requestRoom`)
- [ ] Path consistency: Mobile uses `.ts` extension, Desktop uses `.js` (matching existing patterns)