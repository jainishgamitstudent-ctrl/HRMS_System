import { io } from 'socket.io-client';
import { API_CONFIG } from '../config';
import { tokenStore } from './tokenStore';

let socket = null;
let isConnecting = false;

const entityEventMap = new Map();

function getSocketURL() {
  return API_CONFIG.socketURL;
}

function ensureSocketConnected() {
  if (!socket?.connected) {
    console.warn('[Socket] Not connected; call connectSocket() first');
  }
  return socket;
}

export async function connectSocket() {
  if (socket?.connected) {
    return socket;
  }
  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return socket;
  }

  const token = tokenStore.getToken();
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
      reconnectionDelayMax: 10000,
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

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    entityEventMap.forEach((callbacks, eventName) => {
      callbacks.forEach((cb) => socket?.off(eventName, cb));
    });
    entityEventMap.clear();
    socket.disconnect();
    socket = null;
    console.log('[Socket] Disconnected manually');
  }
}

export function isSocketConnected() {
  return socket?.connected ?? false;
}

/**
 * Subscribe to a specific socket event.
 */
export function subscribeToEvent(eventName, callback) {
  const s = ensureSocketConnected();
  if (!s) return;
  s.on(eventName, callback);
}

/**
 * Unsubscribe from a specific socket event.
 */
export function unsubscribeFromEvent(eventName, callback) {
  const s = ensureSocketConnected();
  if (!s) return;
  s.off(eventName, callback);
}

/**
 * Subscribe to all entity change events (created, updated, deleted) for a given entity type.
 */
export function subscribeToEntityEvents(entityType, callback) {
  const actions = ['created', 'updated', 'deleted'];

  actions.forEach((action) => {
    const eventName = `${entityType}:${action}`;
    const wrapper = (payload) => callback(action, payload);

    if (!entityEventMap.has(eventName)) {
      entityEventMap.set(eventName, new Set());
    }
    entityEventMap.get(eventName).add(wrapper);
    subscribeToEvent(eventName, wrapper);
  });
}

/**
 * Unsubscribe from all entity change events for a given entity type.
 * If callback is omitted, unsubscribes all listeners for this entity type.
 */
export function unsubscribeFromEntityEvents(entityType, callback) {
  const actions = ['created', 'updated', 'deleted'];
  actions.forEach((action) => {
    const eventName = `${entityType}:${action}`;
    const callbacks = entityEventMap.get(eventName);
    if (!callbacks) return;

    if (callback) {
      callbacks.forEach((cb) => unsubscribeFromEvent(eventName, cb));
      entityEventMap.delete(eventName);
    } else {
      callbacks.forEach((cb) => unsubscribeFromEvent(eventName, cb));
      entityEventMap.delete(eventName);
    }
  });
}
