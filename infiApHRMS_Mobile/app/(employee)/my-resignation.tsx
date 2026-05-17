import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Header from '../../components/layout/Header';
import { useUser } from '../../context/UserContext';
import { fetchMyResignation } from '../../services/auth';
import { useAppTheme } from '@/context/ThemeContext';

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  Submitted: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  'Under Review': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Approved: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Rejected: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  Withdrawn: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  Pending: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
};

export default function MyResignationPage() {
  const { user } = useUser();
  const { colors } = useAppTheme();
  const styles = useMemo(() => MyResignationStyles(colors), [colors]);
  const [resignations, setResignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadResignations = useCallback(async () => {
    try {
      setError('');
      const response = await fetchMyResignation();
      const data = response.data || [];
      setResignations(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load resignation data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResignations();
  }, [loadResignations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResignations();
  }, [loadResignations]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.root}>
      <Header title="My Resignation" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadResignations}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : resignations.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="document-text-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No Resignation Found</Text>
            <Text style={styles.emptySubtitle}>
              You have not submitted any resignation request yet.
            </Text>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => router.push('/(employee)/apply-resignation')}
            >
              <Text style={styles.applyBtnText}>Apply Resignation</Text>
            </TouchableOpacity>
          </View>
        ) : (
          resignations.map((item) => {
            const displayStatus = item.status === 'Approved' || item.status === 'Rejected'
              ? item.status
              : 'Pending';
            const statusStyle = statusColors[displayStatus] || statusColors.Pending;
            return (
              <View key={item._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Resignation Request</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {displayStatus}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.detailLabel}>Reason</Text>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {item.reason}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.detailLabel}>Last Working Day</Text>
                  <Text style={styles.detailValue}>{formatDate(item.lastWorkingDate)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.detailLabel}>Notice Period</Text>
                  <Text style={styles.detailValue}>{item.noticePeriodDays} days</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="create-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.detailLabel}>Submitted On</Text>
                  <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
                </View>

                {item.actionedBy && (item.status === 'Approved' || item.status === 'Rejected') ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.detailLabel}>
                      {item.status === 'Approved' ? 'Approved by' : 'Rejected by'}
                    </Text>
                    <Text style={styles.detailValue}>{item.actionedBy}</Text>
                  </View>
                ) : null}

                {item.managerRemarks ? (
                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.detailLabel}>HR Remarks</Text>
                    <Text style={styles.detailValue}>{item.managerRemarks}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function MyResignationStyles(colors: any) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryBtnText: {
    color: colors.card,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  applyBtn: {
    marginTop: 24,
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  applyBtnText: {
    color: colors.card,
    fontWeight: '800',
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    width: 110,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
    textAlign: 'right',
  },
});
}
