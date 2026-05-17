import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useNotifications, Notification, NotificationType } from '../../context/NotificationContext';
import Header from '../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';
import Animated, { 
  FadeInDown, 
  Layout, 
} from 'react-native-reanimated';

const iconBoxBase = { width: 48, height: 48, borderRadius: 16, justifyContent: 'center' as const, alignItems: 'center' as const, marginRight: 16 };

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const { colors } = useAppTheme();
  switch (type) {
    case 'leave':
      return <View style={[iconBoxBase, { backgroundColor: '#eff6ff' }]}><Ionicons name="calendar" size={20} color="#3b82f6" /></View>;
    case 'attendance':
      return <View style={[iconBoxBase, { backgroundColor: '#fef2f2' }]}><Ionicons name="time" size={20} color="#ef4444" /></View>;
    case 'payroll':
      return <View style={[iconBoxBase, { backgroundColor: '#f5f3ff' }]}><Ionicons name="cash" size={20} color="#8b5cf6" /></View>;
    case 'job':
      return <View style={[iconBoxBase, { backgroundColor: '#ecfdf5' }]}><Ionicons name="briefcase" size={20} color="#10b981" /></View>;
    case 'system':
      return <View style={[iconBoxBase, { backgroundColor: '#fff7ed' }]}><Ionicons name="megaphone" size={20} color="#f59e0b" /></View>;
    default:
      return <View style={[iconBoxBase, { backgroundColor: '#f1f5f9' }]}><Ionicons name="notifications" size={20} color={colors.textMuted} /></View>;
  }
};

export default function NotificationsPage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => NotificationsStyles(colors), [colors]);
  const { notifications, isLoading, error, refreshNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => !n.isRead);
  }, [notifications, filter]);

  const handleNotificationClick = (item: Notification) => {
    markAsRead(item.id);
    if (item.relatedRoomId) {
      router.push({
        pathname: '/(employee)/request-room-detail/[id]',
        params: { id: item.relatedRoomId },
      });
    } else {
      router.push({
        pathname: '/(employee)/notification-details/[id]',
        params: { id: item.id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Notifications" 
        showBack={true} 
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabsLeft}>
          <TouchableOpacity 
            onPress={() => setFilter('all')}
            style={[styles.tab, filter === 'all' && styles.activeTab]}
          >
            <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setFilter('unread')}
            style={[styles.tab, filter === 'unread' && styles.activeTab]}
          >
            <View style={styles.unreadTabContent}>
              <Text style={[styles.tabText, filter === 'unread' && styles.activeTabText]}>Unread</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadCountBadge}>
                  <Text style={styles.unreadCountText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => {
            markAllAsRead();
            Alert.alert('Success', 'All notifications have been marked as read.');
          }}
          activeOpacity={0.7}
          style={styles.markAllBtn}
        >
          <Ionicons name="checkmark-done" size={16} color="#4f46e5" style={{ marginRight: 4 }} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading notifications...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Unable to load notifications</Text>
            <Text style={styles.emptySub}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshNotifications} activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((item, index) => (
            <Animated.View 
              key={item.id}
              entering={FadeInDown.delay(index * 100).springify()}
              layout={Layout.springify()}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.notiCard,
                  !item.isRead && styles.unreadNotiCard,
                  pressed && styles.notiCardPressed
                ]}
                onPress={() => handleNotificationClick(item)}
              >
                <NotificationIcon type={item.type} />
                <View style={styles.notiBody}>
                  <View style={styles.notiHeader}>
                    <Text style={[styles.notiTitle, !item.isRead && styles.unreadText]}>{item.title}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
                  <Text style={styles.notiTime}>{item.time}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={60} color="#e2e8f0" />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No new notifications to display.</Text>
          </View>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

function NotificationsStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4f46e5',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tabsLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f5f7ff',
    borderRadius: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  activeTabText: {
    color: '#fff',
  },
  unreadTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadCountBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  notiCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  unreadNotiCard: {
    backgroundColor: '#f5f7ff',
    borderColor: '#e0e7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
  },
  notiCardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#f1f5f9',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notiBody: {
    flex: 1,
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  unreadText: {
    fontWeight: '800',
    color: '#0f172a',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
  },
  notiMessage: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  notiTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
}
