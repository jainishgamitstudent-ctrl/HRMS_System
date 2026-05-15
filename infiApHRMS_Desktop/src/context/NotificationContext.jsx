import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const [toasts, setToasts] = useState([]);

    // Fetch initial notifications and unread count
    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_CONFIG.baseURL}/api/notifications/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.status === 'Success' && Array.isArray(json.data)) {
                setNotifications(json.data.map(n => ({
                    ...n,
                    id: n._id || n.id,
                    read: !!n.readAt || (n.readBy && n.readBy.some(rb => String(rb.user) === String(user?._id)))
                })));
            }
        } catch (err) {
            console.warn('[NotificationContext] fetchNotifications failed:', err.message);
        }
    }, [token, user]);

    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_CONFIG.baseURL}/api/notifications/me/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.status === 'Success' && json.data) {
                setUnreadCount(json.data.unreadCount || 0);
            }
        } catch (err) {
            console.warn('[NotificationContext] fetchUnreadCount failed:', err.message);
        }
    }, [token]);

    useEffect(() => {
        if (!token || !user) return;
        fetchNotifications();
        fetchUnreadCount();
    }, [token, user, fetchNotifications, fetchUnreadCount]);

    useEffect(() => {
        if (!token || !user) return;

        const newSocket = io(API_CONFIG.socketURL, {
            auth: { token },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
        });

        newSocket.on('notification', (data) => {
            const normalized = {
                ...data,
                id: data.id || data._id || Date.now(),
                read: false,
                timestamp: data.createdAt || data.timestamp || new Date().toISOString()
            };
            setNotifications(prev => {
                const exists = prev.some(n => String(n.id) === String(normalized.id) || String(n._id) === String(normalized.id));
                if (exists) return prev;
                return [normalized, ...prev];
            });
            setUnreadCount(prev => prev + 1);
            // Show a toast for incoming real-time notification
            addToast('info', normalized.headline || normalized.message || 'New notification', 5000);
        });

        newSocket.on('toast', (data) => {
            addToast(data.type || 'info', data.message, data.duration || 4000);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [token, user]);

    const addToast = useCallback((type, message, duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => {
            const newToasts = [...prev, { id, type, message, duration }];
            return newToasts.slice(-4);
        });

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            read: false,
            timestamp: new Date().toISOString(),
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
    }, []);

    const markAsRead = useCallback(async (id) => {
        setNotifications(prev => prev.map(n => (String(n.id) === String(id) || String(n._id) === String(id)) ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        if (token) {
            try {
                await fetch(`${API_CONFIG.baseURL}/api/notifications/${id}/read`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.warn('[NotificationContext] markAsRead API failed:', err.message);
            }
        }
    }, [token]);

    const markAllAsRead = useCallback(async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        if (token) {
            try {
                await fetch(`${API_CONFIG.baseURL}/api/notifications/me/read-all`, {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                console.warn('[NotificationContext] markAllAsRead API failed:', err.message);
            }
        }
    }, [token]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    const emitEvent = useCallback((event, data) => {
        if (socket) {
            socket.emit(event, data);
        }
    }, [socket]);

    return (
        <NotificationContext.Provider value={{
            socket,
            notifications,
            unreadCount,
            connected,
            toasts,
            addToast,
            removeToast,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            emitEvent,
            fetchNotifications,
            fetchUnreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
