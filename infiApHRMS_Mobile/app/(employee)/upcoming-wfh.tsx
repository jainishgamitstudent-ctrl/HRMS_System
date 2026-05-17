import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/layout/Header';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAppTheme } from '@/context/ThemeContext';
import { checkMyWFHPermission } from '../../services/wfh';
import { useRealtimeWFH } from '../../hooks/useRealtime';
const MOCK_WFH: any[] = [];  // Empty initial data - will be fetched from API

const WFHCard = ({ item, index, styles }: { item: any, index: number, styles: any }) => {
  const { colors } = useAppTheme();
  const status = item.status || 'Pending';
  const isApproved = status.toLowerCase() === 'approved';

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.dayText}>{item.day}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: isApproved ? '#ecfdf5' : '#fff7ed' }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: isApproved ? '#059669' : '#d97706' }
          ]}>
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={styles.footerText}>{item.duration}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={16} color={colors.textMuted} />
          <Text style={styles.footerText}>Remote</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function UpcomingWFH() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => UpcomingWfhStyles(colors), [colors]);
  const [wfhList, setWfhList] = useState(MOCK_WFH);
  const [wfhEnabled, setWfhEnabled] = useState(false);
  const [permissionLevel, setPermissionLevel] = useState<string | null>(null);
  const [permissionNotes, setPermissionNotes] = useState<string | null>(null);
  const [checkingPermission, setCheckingPermission] = useState(true);

  const getDayOfWeek = (dateString: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? 'Workday' : days[d.getDay()];
  };

  useEffect(() => {
    const loadWfhData = async () => {
      try {
        setCheckingPermission(true);

        // Check WFH permission first
        const permResponse = await checkMyWFHPermission();
        const enabled = permResponse?.data?.wfhEnabled ?? false;
        const level = permResponse?.data?.level ?? null;
        const notes = permResponse?.data?.notes ?? null;
        setWfhEnabled(enabled);
        setPermissionLevel(level);
        setPermissionNotes(notes);

        if (!enabled) {
          setCheckingPermission(false);
          return;
        }

        // Load WFH data from backend
        const api = require('../../constants/api').API_BASE_URL;
        const response = await fetch(`${api}/wfh/upcoming`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const json = await response.json();
          if (json && json.data && Array.isArray(json.data)) {
            const mapped = json.data.map((d: any) => ({
              id: d.id || Math.random().toString(36).substr(2, 9),
              date: new Date(d.date || d.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              day: getDayOfWeek(d.date || d.Date),
              duration: d.duration || d.Duration || 'Full Day',
              status: d.status || d.Status || 'Pending'
            }));
            setWfhList(mapped);
          }
        }
      } catch (error) {
        console.log('Error fetching WFH data:', error);
      } finally {
        setCheckingPermission(false);
      }
    };

    loadWfhData();
  }, []);

  useRealtimeWFH((action, payload) => {
    console.log('[Realtime] WFH event:', action, payload);
    loadWfhData();
  });

  if (checkingPermission) {
    return (
      <View style={styles.container}>
        <Header title="Upcoming WFH" showBack={true} />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Checking WFH access...</Text>
        </View>
      </View>
    );
  }

  if (!wfhEnabled) {
    return (
      <View style={styles.container}>
        <Header title="Upcoming WFH" showBack={true} />
        <View style={styles.disabledState}>
          <View style={styles.disabledIconCircle}>
            <Ionicons name="lock-closed-outline" size={60} color="#cbd5e1" />
          </View>
          <Text style={styles.disabledTitle}>WFH Access Disabled</Text>
          <Text style={styles.disabledSub}>
            You do not have WFH access. Please contact HR/Admin to request permission.
          </Text>
          {permissionLevel && (
            <View style={styles.permissionTag}>
              <Text style={styles.permissionTagText}>Access level: {permissionLevel}</Text>
            </View>
          )}
          {permissionNotes && (
            <View style={styles.notesBanner}>
              <Ionicons name="information-circle-outline" size={18} color="#8b5cf6" />
              <Text style={styles.notesBannerText}>{permissionNotes}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Upcoming WFH" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {permissionNotes && (
          <View style={styles.notesBannerActive}>
            <Ionicons name="information-circle-outline" size={18} color="#8b5cf6" />
            <Text style={styles.notesBannerActiveText}>{permissionNotes}</Text>
          </View>
        )}
        {wfhList.length > 0 ? (
          wfhList.map((item, index) => (
            <WFHCard key={item.id} item={item} index={index} styles={styles} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="home-outline" size={60} color="#e2e8f0" />
            </View>
            <Text style={styles.emptyTitle}>No upcoming WFH scheduled</Text>
            <Text style={styles.emptySub}>When you have approved WFH dates, they will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function UpcomingWfhStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  dateInfo: {
    gap: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  dayText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
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
    shadowColor: '#000',
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  disabledState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 32,
  },
  disabledIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  disabledTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  disabledSub: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionTag: {
    backgroundColor: colors.textMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permissionTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  notesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginTop: 12,
    width: '100%',
  },
  notesBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6d28d9',
    flex: 1,
    lineHeight: 18,
  },
  notesBannerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginBottom: 16,
    marginHorizontal: 2,
  },
  notesBannerActiveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6d28d9',
    flex: 1,
    lineHeight: 18,
  },
});
}
