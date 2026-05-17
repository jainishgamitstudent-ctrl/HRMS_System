import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/api';
import { getStoredAuthSession } from './auth';

let socket: Socket | null = null;
let isConnecting = false;

function getSocketURL(): string {
  // Remove /api/v1 suffix to get the base server URL
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
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
    socket.disconnect();
    socket = null;
    console.log('[Socket] Disconnected manually');
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
