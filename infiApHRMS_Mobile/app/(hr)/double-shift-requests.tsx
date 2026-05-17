import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../../components/layout/Header';
import { BottomNav } from '../../components/BottomNav';
import {
  fetchAllDoubleShiftRequests,
  reviewDoubleShiftRequest,
  type DoubleShiftRequestWithEmployee,
} from '../../services/doubleShift';
import { useAppTheme } from '@/context/ThemeContext';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function DoubleShiftRequestsScreen() {
  const { colors } = useAppTheme();
  const [requests, setRequests] = useState<DoubleShiftRequestWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const loadRequests = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetchAllDoubleShiftRequests(filter === 'all' ? undefined : filter);
      if (response.status === 'Success' && Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests(false);
  }, [loadRequests]);

  const handleReview = async (requestId: string, status: 'approved' | 'rejected') => {
    setReviewingId(requestId);
    try {
      await reviewDoubleShiftRequest(requestId, status, reviewNotes.trim() || undefined);
      Alert.alert('Success', `Request ${status}.`);
      setReviewNotes('');
      loadRequests(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${status} request.`);
    } finally {
      setReviewingId(null);
    }
  };

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return requests.filter((r) => {
      const emp = r.employeeId;
      if (!emp) return true;
      return (
        emp.name?.toLowerCase().includes(query) ||
        emp.employeeId?.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query)
      );
    });
  }, [requests, searchQuery]);

  const getStatusColor = (status: string) => {
    if (status === 'approved') return '#22c55e';
    if (status === 'rejected') return '#ef4444';
    return '#f59e0b';
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    };
  }, [requests]);

  const tabs: FilterStatus[] = ['all', 'pending', 'approved', 'rejected'];

  return (
    <View style={styles.container}>
      <Header title="Double Shift Requests" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, filter === tab && styles.tabActive]}
              onPress={() => setFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID or department..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>No requests found.</Text>
          </View>
        ) : (
          filtered.map((req, idx) => (
            <Animated.View
              key={req._id}
              entering={FadeInDown.delay(idx * 40)}
              style={styles.requestCard}
            >
              <View style={styles.requestHeader}>
                <View style={styles.employeeInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {req.employeeId?.name?.charAt(0).toUpperCase() || 'E'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.employeeName}>{req.employeeId?.name || 'Unknown'}</Text>
                    <Text style={styles.employeeMeta}>
                      {req.employeeId?.employeeId || ''}
                      {req.employeeId?.department ? ` · ${req.employeeId.department}` : ''}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>
                    {req.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                <Text style={styles.detailText}>{formatDate(req.requestDate)}</Text>
              </View>

              {req.reason ? (
                <View style={styles.detailsRow}>
                  <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.detailText}>{req.reason}</Text>
                </View>
              ) : null}

              {req.status === 'pending' && (
                <View style={styles.actionsRow}>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Optional notes..."
                    placeholderTextColor="#94a3b8"
                    value={reviewNotes}
                    onChangeText={setReviewNotes}
                  />
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReview(req._id, 'rejected')}
                    disabled={reviewingId === req._id}
                    activeOpacity={0.8}
                  >
                    {reviewingId === req._id ? (
                      <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleReview(req._id, 'approved')}
                    disabled={reviewingId === req._id}
                    activeOpacity={0.8}
                  >
                    {reviewingId === req._id ? (
                      <ActivityIndicator size="small" color="#22c55e" />
                    ) : (
                      <Text style={styles.approveBtnText}>Approve</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {req.reviewNotes ? (
                <Text style={styles.reviewedNote}>Note: {req.reviewNotes}</Text>
              ) : null}
            </Animated.View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    tabsRow: { flexDirection: 'row', marginTop: 16, marginBottom: 12 },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.card,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    tabActive: {
      backgroundColor: '#4f46e5',
      borderColor: '#4f46e5',
    },
    tabText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: '#fff',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      height: 44,
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    empty: {
      alignItems: 'center',
      marginTop: 60,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: 12,
    },
    requestCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    requestHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    employeeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primaryBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    employeeName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    employeeMeta: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
      marginTop: 1,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    detailText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
      flex: 1,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    notesInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 13,
      color: colors.textSecondary,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    actionBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
    },
    rejectBtn: {
      backgroundColor: '#fef2f2',
      borderWidth: 1,
      borderColor: '#fecaca',
    },
    rejectBtnText: {
      color: '#ef4444',
      fontSize: 13,
      fontWeight: '700',
    },
    approveBtn: {
      backgroundColor: '#f0fdf4',
      borderWidth: 1,
      borderColor: '#bbf7d0',
    },
    approveBtnText: {
      color: '#22c55e',
      fontSize: 13,
      fontWeight: '700',
    },
    reviewedNote: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
      marginTop: 8,
      fontStyle: 'italic',
    },
  });
}
