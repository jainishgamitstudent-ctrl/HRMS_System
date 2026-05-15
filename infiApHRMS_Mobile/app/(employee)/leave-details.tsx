import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLeave } from '../../context/LeaveContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';

import { useAppTheme } from '@/context/ThemeContext';
export default function LeaveDetails() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { leaves } = useLeave();
  
  const leave = leaves.find(l => l.id === id);

  if (!leave) {
    return (
      <View style={styles.root}>
        <Header title="Leave Details" showBack={true} />
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyText}>Leave not found</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return { text: '#22c55e', bg: '#dcfce7' };
      case 'PENDING': return { text: '#ea580c', bg: '#ffedd5' };
      case 'REJECTED': return { text: '#ef4444', bg: '#fee2e2' };
      default: return { text: '#64748b', bg: '#f1f5f9' };
    }
  };

  const statusColors = getStatusColor(leave.status);
  const approverName = leave.approverName || 'Reporting Manager';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const getIconForType = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sick')) return 'medkit-outline';
    if (lowerType.includes('personal') || lowerType.includes('casual')) return 'briefcase-outline';
    if (lowerType.includes('wfh')) return 'home-outline';
    return 'calendar-outline';
  };

  return (
    <View style={styles.root}>
      <Header 
        title="Leave Details" 
        showBack={true} 
        rightElement={
          leave.status === 'PENDING' ? (
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/(employee)/edit-leave', params: { id: leave.id } })}
              style={{ padding: 4 }}
            >
              <Ionicons name="pencil" size={20} color="#4f39f6" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify().damping(15)} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name={getIconForType(leave.type)} size={28} color="#4f39f6" />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.leaveType}>{leave.type}</Text>
              <Text style={styles.appliedDate}>Applied on {formatDate(leave.appliedDate)}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.badgeText, { color: statusColors.text }]}>{leave.status}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>{formatDate(leave.startDate)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={styles.detailValue}>{formatDate(leave.endDate)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.detailLabel}>Total Days</Text>
              <Text style={styles.detailValue}>{leave.days} Day{leave.days > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.detailLabel}>Approver</Text>
              <Text style={styles.detailValue}>{approverName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.approvalRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
            <View style={styles.approvalTextWrap}>
              <Text style={styles.approvalLabel}>Approval Status</Text>
              <Text style={styles.approvalValue}>
                {leave.status === 'PENDING'
                  ? `Waiting for ${approverName} to approve`
                  : leave.status === 'APPROVED'
                    ? `Approved by ${approverName}`
                    : leave.status === 'REJECTED'
                      ? `Rejected by ${approverName}`
                      : leave.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.reasonSection}>
            <Text style={styles.detailLabel}>Reason for Leave</Text>
            <Text style={styles.reasonText}>{leave.reason}</Text>
          </View>

          {leave.status === 'REJECTED' && leave.rejectionReason && (
            <View style={styles.rejectedSection}>
              <View style={styles.rejectedHeader}>
                <Ionicons name="alert-circle" size={18} color="#ef4444" />
                <Text style={styles.rejectedLabel}>Rejection Reason</Text>
              </View>
              <Text style={styles.rejectedText}>{leave.rejectionReason}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4f39f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  headerTextWrap: {
    marginLeft: 14,
    flex: 1,
  },
  leaveType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  appliedDate: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
  summaryItem: {
    width: '48%',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  approvalTextWrap: {
    flex: 1,
  },
  approvalLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 3,
  },
  approvalValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '700',
    lineHeight: 20,
  },
  reasonSection: {
    flex: 1,
  },
  reasonText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginTop: 4,
  },
  rejectedSection: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  rejectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rejectedLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
    marginLeft: 6,
  },
  rejectedText: {
    fontSize: 15,
    color: '#991b1b',
    lineHeight: 22,
  },
});
