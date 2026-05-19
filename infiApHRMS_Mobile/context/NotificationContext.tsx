import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  fetchMyNotifications,
  markAllNotificationsRead as apiMarkAllRead,
  markNotificationRead as apiMarkRead,
  type ApiNotification,
} from '../services/auth';
import {
  registerForPushNotificationsAsync,
  registerPushToken,
  configureNotificationHandler,
  setupAndroidNotificationChannel,
} from '../services/notifications';
import { useUser } from './UserContext';
import { connectSocket, disconnectSocket } from '../services/socket';

export type NotificationType = 'leave' | 'attendance' | 'payroll' | 'job' | 'resignation' | 'system';

export interface NotificationAttachment {
  name: string;
  size: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  description: string;
  time: string;
  timestamp: string;
  isRead: boolean;
  sender: string;
  division: string;
  isOnline: boolean;
  highlights?: string[];
  attachment?: NotificationAttachment;
  route?: string;
  relatedRoomId?: string | null;
}

interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getNotificationById: (id: string) => Notification | undefined;
  toast: Notification | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const getNotificationType = (category?: string): NotificationType => {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('leave')) return 'leave';
  if (normalized.includes('attendance')) return 'attendance';
  if (normalized.includes('payroll')) return 'payroll';
  if (normalized.includes('job')) return 'job';
  if (normalized.includes('resignation')) return 'resignation';
  return 'system';
};

const getNotificationRoute = (type: NotificationType) => {
  if (type === 'leave') return '/(employee)/leave';
  if (type === 'attendance') return '/(employee)/attendance';
  if (type === 'payroll') return '/(employee)/payroll';
  if (type === 'job') return '/(employee)/job-postings';
  if (type === 'resignation') return '/(employee)/my-resignation';
  return undefined;
};

const formatRelativeTime = (iso?: string) => {
  if (!iso) return 'Just now';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 'Just now';
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
};

const mapNotification = (record: ApiNotification, index: number): Notification => {
  const type = getNotificationType(record.category);
  const createdIso = record.createdAt || record.scheduleAt || undefined;
  return {
    id: record.id || `notification-${index + 1}`,
    type,
    title: record.headline || 'Notification',
    message: (record.details || '').slice(0, 120),
    description: record.details || '',
    time: formatRelativeTime(createdIso),
    timestamp: createdIso || new Date().toISOString(),
    isRead: !!record.isRead,
    sender: 'System',
    division: 'General',
    isOnline: true,
    route: getNotificationRoute(type),
    relatedRoomId: record.relatedRoomId || null,
  };
};

const POLL_INTERVAL_MS = 30000;

const buildNotificationFromSocketPayload = (payload: any): Notification => {
  const type = getNotificationType(payload.category);
  const createdIso = payload.createdAt || new Date().toISOString();
  return {
    id: String(payload.id || Date.now()),
    type,
    title: payload.headline || 'Notification',
    message: (payload.details || '').slice(0, 120),
    description: payload.details || '',
    time: 'Just now',
    timestamp: createdIso,
    isRead: false,
    sender: 'System',
    division: 'General',
    isOnline: true,
    route: getNotificationRoute(type),
    relatedRoomId: payload.relatedRoomId ? String(payload.relatedRoomId) : null,
  };
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<Notification | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);
  const { isAuthenticated } = useUser();

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    try {
      setError(null);
      const response = await fetchMyNotifications();
      console.log('[Notifications] API response:', JSON.stringify(response, null, 2));
      const records = Array.isArray(response.data) ? response.data : [];
      console.log('[Notifications] Records count:', records.length);
      const mapped = records.map(mapNotification);

      // On first successful load, seed seenIds (no popup for existing items).
      if (isFirstLoadRef.current) {
        mapped.forEach((n) => seenIdsRef.current.add(n.id));
        isFirstLoadRef.current = false;
      } else {
        // Find newest unseen unread notification to surface as a toast.
        const newOnes = mapped.filter((n) => !seenIdsRef.current.has(n.id) && !n.isRead);
        newOnes.forEach((n) => seenIdsRef.current.add(n.id));
        if (newOnes.length > 0) {
          console.log('[Notifications] New unread notification:', newOnes[0].title);
          setToast(newOnes[0]);
        }
      }

      setNotifications(mapped);
    } catch (fetchError) {
      console.error('[Notifications] Fetch error:', fetchError);
      // Don't wipe existing list on transient error.
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    refreshNotifications();
    const id = setInterval(() => {
      refreshNotifications();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshNotifications, isAuthenticated]);

  // Socket.IO real-time notification setup
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }

    let socketInstance: Socket | null = null;
    let isActive = true;

    const onNotification = (payload: any) => {
      if (!isActive) return;
      console.log('[Socket] Notification received:', payload.headline);
      const notification = buildNotificationFromSocketPayload(payload);
      seenIdsRef.current.add(notification.id);
      setToast(notification);
      refreshNotifications();
    };

    const onToast = (payload: any) => {
      if (!isActive) return;
      console.log('[Socket] Toast received:', payload.message);
      const notification: Notification = {
        id: String(payload.id || Date.now()),
        type: getNotificationType(payload.category) || 'system',
        title: payload.message || 'Notification',
        message: (payload.message || '').slice(0, 120),
        description: payload.message || '',
        time: 'Just now',
        timestamp: new Date().toISOString(),
        isRead: false,
        sender: 'System',
        division: 'General',
        isOnline: true,
        route: undefined,
        relatedRoomId: null,
      };
      setToast(notification);
    };

    const setupSocket = async () => {
      const socket = await connectSocket();
      if (!socket || !isActive) return;
      socketInstance = socket;
      socket.on('notification', onNotification);
      socket.on('toast', onToast);
    };

    setupSocket();

    return () => {
      isActive = false;
      if (socketInstance) {
        socketInstance.off('notification', onNotification);
        socketInstance.off('toast', onToast);
      }
    };
  }, [isAuthenticated, refreshNotifications]);

  // Push notification setup
  useEffect(() => {
    if (!isAuthenticated) return;
    let cleanup = () => {};

    const setupPush = async () => {
      configureNotificationHandler();
      await setupAndroidNotificationChannel();

      const token = await registerForPushNotificationsAsync();
      console.log('[Push] Expo token received:', token ? 'Yes' : 'No');
      if (token) {
        try {
          await registerPushToken(token);
          console.log('[Push] Token registered with backend - SUCCESS');
        } catch (e) {
          console.error('[Push] Token registration FAILED:', e);
        }
      }

      // Foreground notification received
      const foregroundSubscription = Notifications.addNotificationReceivedListener((event) => {
        console.log('[Push] Foreground notification received:', event.request.content.title);
        const data = event.request.content.data || {};
        const pushNotification: Notification = {
          id: String(data.notificationId || event.request.identifier),
          type: getNotificationType(data.category as string),
          title: event.request.content.title || 'Notification',
          message: (event.request.content.body || '').slice(0, 120),
          description: event.request.content.body || '',
          time: 'Just now',
          timestamp: new Date().toISOString(),
          isRead: false,
          sender: 'System',
          division: 'General',
          isOnline: true,
          route: getNotificationRoute(getNotificationType(data.category as string)),
          relatedRoomId: data.relatedRoomId ? String(data.relatedRoomId) : null,
        };
        setToast(pushNotification);
        refreshNotifications();
      });

      // Notification response (user tapped the notification)
      const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data || {};
        const relatedRoomId = String(data.relatedRoomId || '');
        const notificationId = String(data.notificationId || '');
        if (relatedRoomId) {
          router.push({
            pathname: '/(employee)/request-room-detail/[id]',
            params: { id: relatedRoomId },
          });
        } else if (notificationId) {
          router.push({
            pathname: '/(employee)/notification-details/[id]',
            params: { id: notificationId },
          });
        }
      });

      cleanup = () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      };
    };

    setupPush();
    return () => cleanup();
  }, [refreshNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    apiMarkRead(id).catch(() => {
      // Non-fatal: revert handled on next poll.
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    apiMarkAllRead().catch(() => {});
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const getNotificationById = useCallback(
    (id: string) => notifications.find((item) => item.id === id),
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      isLoading,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      getNotificationById,
      toast,
      dismissToast,
    }),
    [notifications, isLoading, error, refreshNotifications, markAsRead, markAllAsRead, getNotificationById, toast, dismissToast]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
