import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useNotifications, NotificationType } from '../context/NotificationContext';
import { useAppTheme } from '../context/ThemeContext';

const ICON_BY_TYPE: Record<NotificationType, { name: any; color: string; bg: string }> = {
  leave: { name: 'calendar', color: '#3b82f6', bg: '#eff6ff' },
  attendance: { name: 'time', color: '#ef4444', bg: '#fef2f2' },
  payroll: { name: 'cash', color: '#8b5cf6', bg: '#f5f3ff' },
  system: { name: 'megaphone', color: '#f59e0b', bg: '#fff7ed' },
};

const AUTO_DISMISS_MS = 5000;

export const NotificationToast: React.FC = () => {
  const { toast, dismissToast, markAsRead } = useNotifications();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => dismissToast(), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  const styles = useMemo(() => StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 99999,
      elevation: 99999,
    },
    wrapper: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 56 : 24,
      left: 12,
      right: 12,
      zIndex: 99999,
      elevation: 20,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    body: { flex: 1 },
    title: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    message: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    closeBtn: {
      padding: 4,
      marginLeft: 8,
    },
  }), [colors]);

  if (!toast) return null;

  const meta = ICON_BY_TYPE[toast.type] || ICON_BY_TYPE.system;

  const handlePress = () => {
    markAsRead(toast.id);
    dismissToast();
    router.push({
      pathname: '/(employee)/notification-details/[id]',
      params: { id: toast.id },
    });
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        entering={FadeInUp.duration(280)}
        exiting={FadeOutUp.duration(220)}
        style={styles.wrapper}
        pointerEvents="box-none"
      >
        <Pressable style={styles.card} onPress={handlePress} android_ripple={{ color: colors.borderLight }}>
          <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.name} size={22} color={meta.color} />
          </View>
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={1}>
              {toast.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {toast.message || toast.description}
            </Text>
          </View>
          <Pressable hitSlop={8} onPress={dismissToast} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default NotificationToast;
