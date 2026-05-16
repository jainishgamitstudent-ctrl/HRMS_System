import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AdminBottomNav } from '../../components/AdminBottomNav';
import Header from '../../components/layout/Header';
import { fetchResignations, updateResignationStatus } from '../../services/auth';

const statusFilters = ['All', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Withdrawn'];

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  Submitted: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Under Review': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  Approved: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  Rejected: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  Withdrawn: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  Pending: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
};

export default function ResignationManagement() {
  const [resignations, setResignations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadResignations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchResignations();
      const data = response.data || [];
      setResignations(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load resignations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResignations();
  }, [loadResignations]);

  useEffect(() => {
    let list = [...resignations];
    if (activeFilter !== 'All') {
      list = list.filter((r) => r.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          (r.employeeName || '').toLowerCase().includes(q) ||
          (r.employeeEmail || '').toLowerCase().includes(q) ||
          (r.department || '').toLowerCase().includes(q) ||
          (r.reason || '').toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [activeFilter, searchQuery, resignations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResignations();
  }, [loadResignations]);

  const handleAction = async (id: string, action: string) => {
    setProcessingId(id);
    try {
      await updateResignationStatus({ resignationId: id, status: action });
      Alert.alert('Success', `Resignation ${action.toLowerCase()}.`);
      loadResignations();
    } catch (err: any) {
      Alert.alert('Error', err.message || `Failed to ${action.toLowerCase()} resignation.`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const counts = {
    total: resignations.length,
    pending: resignations.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length,
    approved: resignations.filter((r) => r.status === 'Approved').length,
    rejected: resignations.filter((r) => r.status === 'Rejected').length,
  };

  return (
    <View style={styles.container}>
      <Header title="Resignation Management" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{counts.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{counts.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{counts.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{counts.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search employee, department, reason..."
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading resignations...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="document-text-outline" size={64} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>No Resignations</Text>
            <Text style={styles.emptySubtitle}>No resignation requests match your filters.</Text>
          </View>
        ) : (
          filtered.map((item, idx) => {
            const statusStyle = statusColors[item.status] || statusColors.Pending;
            const isProcessing = processingId === item._id;
            return (
              <Animated.View
                key={item._id}
                entering={FadeInDown.delay(idx * 60).springify()}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.employeeName || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.employeeName || 'Unknown'}</Text>
                    <Text style={styles.meta}>
                      {item.department || 'N/A'} • {item.designation || 'Employee'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {item.employeeEmail || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reason</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>
                      {item.reason}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Last Working Day</Text>
                    <Text style={styles.detailValue}>{formatDate(item.lastWorkingDate)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Notice Period</Text>
                    <Text style={styles.detailValue}>{item.noticePeriodDays} days</Text>
                  </View>
                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.detailLabel}>Submitted On</Text>
                    <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>

                {item.status === 'Submitted' || item.status === 'Under Review' ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleAction(item._id, 'Approved')}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={styles.actionBtnText}>Approve</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleAction(item._id, 'Rejected')}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle-outline" size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </Animated.View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  filterList: {
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4f46e5',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  detailLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
});
