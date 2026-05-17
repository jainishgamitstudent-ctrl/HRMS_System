import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
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
    const lastPolledUnreadRef = useRef(0);
    const fallbackIntervalRef = useRef(null);
    const swalQueueRef = useRef([]);
    const swalShowingRef = useRef(false);

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

    // Minimal queued SweetAlert2 toast to prevent overlapping popups
    const processSwalQueue = useCallback(() => {
        if (swalShowingRef.current || swalQueueRef.current.length === 0) return;
        swalShowingRef.current = true;
        const { title, text, type } = swalQueueRef.current.shift();
        const iconMap = { info: 'info', success: 'success', error: 'error', warning: 'warning' };
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: iconMap[type] || 'info',
            title: title || 'Notification',
            text: text || '',
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            width: '380px',
            padding: '0.75rem',
            customClass: { popup: 'swal-minimal-toast' },
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
            willClose: () => {
                swalShowingRef.current = false;
                setTimeout(() => processSwalQueue(), 300);
            }
        });
    }, []);

    const showSwalNotification = useCallback((title, text, type = 'info') => {
        swalQueueRef.current.push({ title, text, type });
        processSwalQueue();
    }, [processSwalQueue]);

    useEffect(() => {
        if (!token || !user) return;
        fetchNotifications();
        fetchUnreadCount();
    }, [token, user, fetchNotifications, fetchUnreadCount]);

    useEffect(() => {
        if (!token || !user) return;

        const newSocket = io(API_CONFIG.socketURL, {
            auth: { token },
            transports: ['websocket', 'polling']
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
            // Show SweetAlert2 popup for incoming real-time notification
            showSwalNotification(
                normalized.headline || normalized.message || 'New notification',
                normalized.details || normalized.message || '',
                'info'
            );
            // Also show internal toast
            addToast('info', normalized.headline || normalized.message || 'New notification', 5000);
        });

        newSocket.on('toast', (data) => {
            // Show SweetAlert2 popup for socket toast
            showSwalNotification(
                data.message || 'Notification',
                data.details || '',
                data.type || 'info'
            );
            addToast(data.type || 'info', data.message, data.duration || 4000);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
            if (fallbackIntervalRef.current) {
                clearInterval(fallbackIntervalRef.current);
                fallbackIntervalRef.current = null;
            }
        };
    }, [token, user, addToast, showSwalNotification]);

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

    // Fallback polling: if socket disconnects, poll every 10 seconds
    useEffect(() => {
        if (!token || !user) return;

        const startFallbackPolling = () => {
            if (fallbackIntervalRef.current) return;
            fallbackIntervalRef.current = setInterval(async () => {
                try {
                    const res = await fetch(`${API_CONFIG.baseURL}/api/notifications/me/unread-count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const json = await res.json();
                    if (json.status === 'Success' && json.data) {
                        const serverUnread = json.data.unreadCount || 0;
                        setUnreadCount(serverUnread);
                        // If unread count increased while socket was down, show SweetAlert
                        if (serverUnread > lastPolledUnreadRef.current) {
                            showSwalNotification(
                                'New Notification',
                                'You have new unread notifications.',
                                'info'
                            );
                        }
                        lastPolledUnreadRef.current = serverUnread;
                    }
                } catch (err) {
                    console.warn('[NotificationContext] Fallback poll failed:', err.message);
                }
            }, 10000); // every 10 seconds
        };

        const stopFallbackPolling = () => {
            if (fallbackIntervalRef.current) {
                clearInterval(fallbackIntervalRef.current);
                fallbackIntervalRef.current = null;
            }
        };

        if (connected) {
            stopFallbackPolling();
            lastPolledUnreadRef.current = 0;
        } else {
            startFallbackPolling();
        }

        return () => stopFallbackPolling();
    }, [token, user, connected, showSwalNotification]);

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
