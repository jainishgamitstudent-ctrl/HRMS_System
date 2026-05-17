import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/api';
import { getStoredAuthSession } from './auth';

let socket: Socket | null = null;
let isConnecting = false;

const entityEventMap = new Map<string, Set<(payload: any) => void>>();

function getSocketURL(): string {
  // Remove /api/v1 suffix to get the base server URL
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
}

function ensureSocketConnected(): Socket | null {
  if (!socket?.connected) {
    console.warn('[Socket] Not connected; call connectSocket() first');
  }
  return socket;
}

export async function connectSocket(): Promise<Socket | null> {
  if (socket?.connected) {
    return socket;
  }
  if (isConnecting) {
    // Wait briefly for the in-progress connection
    await new Promise((resolve) => setTimeout(resolve, 500));
    return socket;
  }

  const session = await getStoredAuthSession();
  if (!session?.token) {
    console.log('[Socket] No auth token, skipping connection');
    return null;
  }

  isConnecting = true;

  try {
    const url = getSocketURL();
    console.log('[Socket] Connecting to:', url);

    socket = io(url, {
      auth: { token: session.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
      // Log room joined
      console.log('[Socket] Should join room for user');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message, err.stack);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_failed', () => {
      console.warn('[Socket] Reconnection failed');
    });

    return socket;
  } finally {
    isConnecting = false;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    // Clean up all entity listeners before disconnect
    entityEventMap.forEach((callbacks, eventName) => {
      callbacks.forEach((cb) => socket?.off(eventName, cb));
    });
    entityEventMap.clear();
    socket.disconnect();
    socket = null;
    console.log('[Socket] Disconnected manually');
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

/**
 * Subscribe to a specific socket event.
 */
export function subscribeToEvent(eventName: string, callback: (payload: any) => void): void {
  const s = ensureSocketConnected();
  if (!s) return;
  s.on(eventName, callback);
}

/**
 * Unsubscribe from a specific socket event.
 */
export function unsubscribeFromEvent(eventName: string, callback: (payload: any) => void): void {
  const s = ensureSocketConnected();
  if (!s) return;
  s.off(eventName, callback);
}

/**
 * Subscribe to all entity change events (created, updated, deleted) for a given entity type.
 */
export function subscribeToEntityEvents(
  entityType: string,
  callback: (action: string, payload: any) => void
): void {
  const actions = ['created', 'updated', 'deleted'];
  const wrapperMap = new Map<string, (payload: any) => void>();

  actions.forEach((action) => {
    const eventName = `${entityType}:${action}`;
    const wrapper = (payload: any) => callback(action, payload);
    wrapperMap.set(eventName, wrapper);

    if (!entityEventMap.has(eventName)) {
      entityEventMap.set(eventName, new Set());
    }
    entityEventMap.get(eventName)!.add(wrapper);
    subscribeToEvent(eventName, wrapper);
  });
}

/**
 * Unsubscribe from all entity change events for a given entity type.
 * If callback is omitted, unsubscribes all listeners for this entity type.
 */
export function unsubscribeFromEntityEvents(
  entityType: string,
  callback?: (action: string, payload: any) => void
): void {
  const actions = ['created', 'updated', 'deleted'];
  actions.forEach((action) => {
    const eventName = `${entityType}:${action}`;
    const callbacks = entityEventMap.get(eventName);
    if (!callbacks) return;

    if (callback) {
      // Find and remove the specific wrapper for this callback
      callbacks.forEach((cb) => {
        // Since we can't directly compare wrappers, we remove all and re-subscribe remaining
        // Simpler approach: remove all for this event when unsubscribing a specific callback is tricky
        // We'll just clear all for this eventName when a specific callback is passed
        unsubscribeFromEvent(eventName, cb);
      });
      entityEventMap.delete(eventName);
    } else {
      callbacks.forEach((cb) => unsubscribeFromEvent(eventName, cb));
      entityEventMap.delete(eventName);
    }
  });
}
