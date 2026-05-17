import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Header from '../../components/layout/Header';
import { useUser } from '../../context/UserContext';
import { useAppTheme } from '@/context/ThemeContext';
import {
  fetchMyRequestRooms,
  type RequestRoom,
} from '../../services/requestRooms';
import { useRealtimeRequestRooms } from '../../hooks/useRealtime';

const StatusBadge = ({ status, styles }: { status: string; styles: any }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: '#fef9c3', text: '#ca8a04', label: 'Pending' },
    approved: { bg: '#dcfce7', text: '#16a34a', label: 'Approved' },
    rejected: { bg: '#fee2e2', text: '#dc2626', label: 'Rejected' },
  };
  const c = config[status] || config.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
};

export default function RequestRoomsPage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => RequestRoomsStyles(colors), [colors]);
  const { user } = useUser();
  const [rooms, setRooms] = useState<RequestRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchMyRequestRooms();
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load request rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useRealtimeRequestRooms((action, payload) => {
    console.log('[Realtime] RequestRoom event:', action, payload);
    loadRooms();
  });

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const getCreatorName = (createdBy: RequestRoom['createdBy']) => {
    if (typeof createdBy === 'string') return 'Employee';
    return createdBy?.name || 'Employee';
  };

  const canAct = ['hr', 'admin', 'superadmin', 'manager'].includes(user?.systemRole || '');

  return (
    <View style={styles.container}>
      <Header title="Request Rooms" showBack={true} />

      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>All requests from employees</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f39f6" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRooms}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : rooms.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyCenter}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Ionicons name="chatbubbles-outline" size={56} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No requests yet</Text>
          <Text style={styles.emptySubtitle}>
            {canAct
              ? 'When employees submit leave or other requests, they will appear here.'
              : 'Your submitted requests will appear here.'}
          </Text>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {rooms.map((room, index) => (
            <TouchableOpacity
              key={room._id || index}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(employee)/request-room-detail/[id]',
                  params: { id: room._id },
                })
              }
            >
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.typeIcon,
                      {
                        backgroundColor:
                          room.requestType === 'leave' ? '#eff6ff' : '#f5f3ff',
                      },
                    ]}
                  >
                    <Ionicons
                      name={room.requestType === 'leave' ? 'calendar' : 'chatbubble'}
                      size={20}
                      color={room.requestType === 'leave' ? '#3b82f6' : '#8b5cf6'}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {room.title}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {getCreatorName(room.createdBy)} · {room.leaveType || room.requestType}
                    </Text>
                  </View>
                </View>
                <StatusBadge status={room.status} styles={styles} />
              </View>
              {room.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {room.description}
                </Text>
              ) : null}
              {room.messages && room.messages.length > 0 && (
                <View style={styles.messagePreview}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.messagePreviewText} numberOfLines={1}>
                    {typeof room.messages[room.messages.length - 1].sender === 'string'
                      ? ''
                      : (room.messages[room.messages.length - 1].sender as any).name || ''}{' '}
                    {room.messages[room.messages.length - 1].text}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <BottomNav />
    </View>
  );
}

function RequestRoomsStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
}
