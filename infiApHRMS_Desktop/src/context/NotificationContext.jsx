import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../config';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [connected, setConnected] = useState(false);
    const [toasts, setToasts] = useState([]);

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
            setNotifications(prev => [{
                ...data,
                id: data.id || Date.now(),
                read: false,
                timestamp: data.timestamp || new Date().toISOString()
            }, ...prev]);
        });

        newSocket.on('toast', (data) => {
            addToast(data.type || 'info', data.message, data.duration);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [token, user]);

    const addToast = useCallback((type, message, duration = 4000) => {
        const id = Date.now();
        setToasts(prev => {
            const newToasts = [...prev, { id, type, message, duration }];
            return newToasts.slice(-3);
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

        if (socket) {
            socket.emit('notification', newNotification);
        }
    }, [socket]);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
        if (socket) {
            socket.emit('markAsRead', { notificationId: id });
        }
    }, [socket]);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
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
            connected,
            toasts,
            addToast,
            removeToast,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            emitEvent
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
