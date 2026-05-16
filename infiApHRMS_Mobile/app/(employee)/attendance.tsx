import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../../components/layout/Header';
import { useAttendanceSession } from '../../hooks/useAttendanceSession';
import { useUser } from '@/context/UserContext';
import { submitEmployeePunch, fetchAttendanceHistory } from '../../services/auth';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getExactCurrentLocation, formatExactLocationLabel } from '../../utils/location';

import { useAppTheme } from '@/context/ThemeContext';
// ── Types ──
interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  hoursWorked: string;
  department: string;
}

interface CorrectionRequest {
  id: string;
  date: string;
  originalTime: string;
  requestedTime: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  type: 'Check-In' | 'Check-Out';
  employee: string;
}

// ── Mock Data ──
const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Product', 'Sales', 'HR'];

// Fetch records from backend API instead of using static data
const generateRecords = (): AttendanceRecord[] => [];

// Fetch corrections from backend API instead of using static data
const INITIAL_CORRECTIONS: CorrectionRequest[] = [];

// ── Tab types ──
type TimeTab = 'Daily' | 'Weekly' | 'Monthly';
type CorrectionTab = 'Pending' | 'Approved' | 'Rejected';

export default function AttendancePage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => AttendanceStyles(colors), [colors]);
  // State
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>(INITIAL_CORRECTIONS);
  const [activeTab, setActiveTab] = useState<TimeTab>('Daily');
  const [selectedDept, setSelectedDept] = useState('All');
  const [correctionTab, setCorrectionTab] = useState<CorrectionTab>('Pending');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<CorrectionRequest | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [attendanceActionLoading, setAttendanceActionLoading] = useState(false);
  const {
    session,
    loading: attendanceLoading,
    recordCheckIn,
    recordCheckOut,
    toggleDoubleShift,
    canCheckIn,
    canCheckOut,
    isLockedForToday,
    doubleShiftEnabled,
    nextResetLabel,
  } = useAttendanceSession();
  const { user } = useUser();

  // ── Filtered Records ──
  const filteredRecords = useMemo(() => {
    let recs = [...allRecords];
    // Time filter
    if (activeTab === 'Daily') recs = recs.slice(0, 1);
    else if (activeTab === 'Weekly') recs = recs.slice(0, 7);
    else recs = recs.slice(0, 30);
    // Department filter
    if (selectedDept !== 'All') recs = recs.filter(r => r.department === selectedDept);
    return recs;
  }, [allRecords, activeTab, selectedDept]);

  // ── Statistics ──
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter(r => r.status === 'Present').length;
    const late = filteredRecords.filter(r => r.status === 'Late').length;
    const absent = filteredRecords.filter(r => r.status === 'Absent').length;
    const halfDay = filteredRecords.filter(r => r.status === 'Half Day').length;
    const attendanceRate = total > 0 ? Math.round(((present + late + halfDay) / total) * 100) : 0;
    return { total, present, late, absent, halfDay, attendanceRate };
  }, [filteredRecords]);

  // ── Correction Filters ──
  const filteredCorrections = useMemo(() =>
    corrections.filter(c => c.status === correctionTab),
    [corrections, correctionTab]
  );

  // ── Handlers ──
  const handleApprove = useCallback((id: string) => {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' as const } : c));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
    Alert.alert('✅ Approved', 'Correction request has been approved.');
  }, []);

  const handleRejectPress = useCallback((id: string) => {
    setRejectTargetId(id);
    setRejectReason('');
    setRejectModalVisible(true);
  }, []);

  const handleRejectConfirm = useCallback(() => {
    if (!rejectReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for rejection.');
      return;
    }
    if (rejectTargetId) {
      setCorrections(prev => prev.map(c => c.id === rejectTargetId ? { ...c, status: 'Rejected' as const } : c));
      setSelectedIds(prev => prev.filter(sid => sid !== rejectTargetId));
    }
    setRejectModalVisible(false);
    setRejectTargetId(null);
    setRejectReason('');
    Alert.alert('❌ Rejected', 'Correction request has been rejected.');
  }, [rejectReason, rejectTargetId]);

  const handleReview = useCallback((correction: CorrectionRequest) => {
    setSelectedCorrection(correction);
    setDetailModalVisible(true);
  }, []);

  const handleBulkApprove = useCallback(() => {
    if (selectedIds.length === 0) {
      Alert.alert('Select Items', 'Please select at least one request to approve.');
      return;
    }
    setCorrections(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, status: 'Approved' as const } : c));
    setSelectedIds([]);
    Alert.alert('✅ Bulk Approved', `${selectedIds.length} requests approved.`);
  }, [selectedIds]);

  // ── Load attendance from API ──
  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetchAttendanceHistory();
        // res.data should have { summary, records }
        const recs: any[] = (res && (res as any).data && Array.isArray((res as any).data.records))
          ? (res as any).data.records
          : [];

        if (!isMounted) return;

        const mapped: AttendanceRecord[] = recs.map(r => ({
          id: String(r.id ?? r._id ?? `${r.date}-${Math.random()}`),
          date: r.date || r.PunchDate || r.day || r.recordDate || r.createdAt || '',
          checkIn: r.checkInTime || r.CheckInTime || r.checkIn || r.in || '--',
          checkOut: r.checkOutTime || r.CheckOutTime || r.checkOut || r.out || '--',
          status: (r.status && (['Present','Absent','Late','Half Day'] as string[]).includes(r.status) ? r.status : (r.AttendanceStatus || 'Present')) as AttendanceRecord['status'],
          hoursWorked: r.duration || r.hoursWorked || r.totalHours || '--',
          department: r.department || r.dept || 'General',
        }));

        setAllRecords(mapped);
      } catch (error) {
        console.warn('Failed to load attendance:', error);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // ── Report PDF generation ──
  const buildReportHtml = (title: string, records: AttendanceRecord[], statsObj: any) => `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; color:#0f172a; padding:20px}
          .brand{font-weight:800;color:#007AFF;font-size:20px}
          .meta{color:#64748b;margin-top:6px}
          table{width:100%;border-collapse:collapse;margin-top:16px}
          th,td{padding:10px;border:1px solid #e6edf3;text-align:left}
          th{background:#f1f5f9}
          .center{text-align:center}
          .stats{display:flex;gap:12px;margin-top:12px}
          .stat{background:#f8fafc;padding:12px;border-radius:8px;flex:1}
        </style>
      </head>
      <body>
        <div class="brand">infiAp HRMS — ${title}</div>
        <div class="meta">Generated: ${new Date().toLocaleString()}</div>
        <div class="stats">
          <div class="stat"><div><strong>Attendance Rate</strong></div><div>${statsObj.attendanceRate}%</div></div>
          <div class="stat"><div><strong>Present</strong></div><div>${statsObj.present}</div></div>
          <div class="stat"><div><strong>Late</strong></div><div>${statsObj.late}</div></div>
          <div class="stat"><div><strong>Absent</strong></div><div>${statsObj.absent}</div></div>
        </div>
        <table>
          <thead>
            <tr><th>Date</th><th>Department</th><th>Check In</th><th>Check Out</th><th>Hours</th><th class="center">Status</th></tr>
          </thead>
          <tbody>
            ${records.map(r => `<tr><td>${r.date}</td><td>${r.department}</td><td>${r.checkIn}</td><td>${r.checkOut}</td><td>${r.hoursWorked}</td><td class="center">${r.status}</td></tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const exportReportPdf = async (useFiltered = true) => {
    try {
      setReportLoading(true);
      const recordsToExport = useFiltered ? filteredRecords : allRecords;
      const html = buildReportHtml(`${activeTab} — ${selectedDept}`, recordsToExport, stats);
      const { uri } = await Print.printToFileAsync({ html });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Attendance Report', UTI: 'com.adobe.pdf' });
      } else {
        // Fallback: open print dialog
        await Print.printAsync({ html });
      }
      setReportVisible(false);
    } catch (err) {
      Alert.alert('Export Failed', err instanceof Error ? err.message : String(err));
    } finally {
      setReportLoading(false);
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  }, []);

  const handleGenerateReport = useCallback(() => {
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      setReportVisible(true);
    }, 1500);
  }, []);

  const resolveCurrentLocation = useCallback(async () => getExactCurrentLocation(), []);

  const handleCheckIn = useCallback(async () => {
    if (!canCheckIn || attendanceLoading || attendanceActionLoading) {
      return;
    }

    try {
      setAttendanceActionLoading(true);
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const location = await resolveCurrentLocation();
      const snapshot = {
        time,
        location: formatExactLocationLabel(location),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      await submitEmployeePunch({
        PunchType: 1,
        Latitude: location.latitude,
        Longitude: location.longitude,
        WorkMode: 1,
      });

      await recordCheckIn(snapshot);
      Alert.alert('Checked In', `Check-in recorded at ${time}.`);
    } catch (error) {
      Alert.alert('Location Required', error instanceof Error ? error.message : 'Unable to complete check-in.');
    } finally {
      setAttendanceActionLoading(false);
    }
  }, [attendanceActionLoading, attendanceLoading, canCheckIn, recordCheckIn, resolveCurrentLocation]);

  const handleCheckOut = useCallback(async () => {
    if (!canCheckOut || attendanceLoading || attendanceActionLoading) {
      return;
    }

    try {
      setAttendanceActionLoading(true);
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const location = await resolveCurrentLocation();
      const snapshot = {
        time,
        location: formatExactLocationLabel(location),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      await submitEmployeePunch({
        PunchType: 2,
        Latitude: location.latitude,
        Longitude: location.longitude,
        WorkMode: 1,
      });

      await recordCheckOut(snapshot);
      Alert.alert('Checked Out', `Check-out recorded at ${time}. Next check-in unlocks at ${nextResetLabel}.`);
    } catch (error) {
      Alert.alert('Location Required', error instanceof Error ? error.message : 'Unable to complete check-out.');
    } finally {
      setAttendanceActionLoading(false);
    }
  }, [attendanceActionLoading, attendanceLoading, canCheckOut, nextResetLabel, recordCheckOut, resolveCurrentLocation]);

  const checkedIn = session.checkedIn;
  const checkedOut = session.checkedOut;
  const checkInTime = session.checkInSnapshot?.time ?? '--';
  const checkOutTime = session.checkOutSnapshot?.time ?? '--';
  const attendanceBannerText = checkedOut
    ? isLockedForToday
      ? `Checked out for today. Available again at ${nextResetLabel}.`
      : `First shift complete. Enable Double Shift to check in again.`
    : checkedIn
      ? `Checked in at ${checkInTime}.`
      : `Ready to check in. Daily reset happens at ${nextResetLabel}.`;

  // ── Status color helpers ──
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return { bg: '#dcfce7', text: '#16a34a' };
      case 'Late': return { bg: '#fef3c7', text: '#d97706' };
      case 'Absent': return { bg: '#fee2e2', text: '#dc2626' };
      case 'Half Day': return { bg: '#dbeafe', text: '#2563eb' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <View style={styles.root}>
      <Header title="Attendance" subtitle="Track your time & presence" showBack={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Check-in Toast */}
        {(checkedIn || checkedOut) && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.toast}>
            <View style={styles.toastIcon}>
              <Ionicons name={checkedOut ? 'lock-closed' : 'checkmark-circle'} size={18} color={checkedOut ? '#2563eb' : '#22c55e'} />
            </View>
            <Text style={[styles.toastText, checkedOut && styles.toastTextLocked]}>{attendanceBannerText}</Text>
          </Animated.View>
        )}

        {/* Today's Details Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.detailsSub}>Today’s Details</Text>
              <Text style={styles.detailsDate}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: checkedOut ? '#dbeafe' : checkedIn ? '#dcfce7' : '#f1f5f9' }]}>
              <Text style={[styles.statusText, { color: checkedOut ? '#2563eb' : checkedIn ? '#16a34a' : '#64748b' }]}>
                {checkedOut ? 'COMPLETED' : checkedIn ? 'PRESENT' : 'READY'}
              </Text>
            </View>
          </View>
          <View style={styles.checkRow}>
            <View style={styles.checkItem}>
              <Text style={styles.checkLabel}>CHECK-IN</Text>
              <Text style={styles.checkTime}>{checkedIn ? checkInTime : '--'}</Text>
              <Text style={styles.checkStatus}>{checkedIn ? 'On Time' : 'Pending'}</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkLabel}>CHECK-OUT</Text>
              <Text style={styles.checkTime}>{checkedOut ? checkOutTime : '--'}</Text>
              <Text style={checkedOut ? styles.checkStatusCompleted : styles.checkStatus}>{checkedOut ? 'Completed' : 'Pending'}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Double Shift Toggle */}
        <View style={styles.doubleShiftRow}>
          <View style={styles.doubleShiftLabelWrap}>
            <Ionicons
              name={doubleShiftEnabled ? 'moon' : 'moon-outline'}
              size={16}
              color={user.doubleShiftAllowed ? (doubleShiftEnabled ? '#4f46e5' : '#64748b') : '#94a3b8'}
            />
            <Text style={[styles.doubleShiftLabel, !user.doubleShiftAllowed && styles.doubleShiftLabelDisabled]}>
              Double Shift
            </Text>
            {!user.doubleShiftAllowed && (
              <Text style={styles.doubleShiftHint}>Contact HR</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.doubleShiftToggle,
              doubleShiftEnabled && styles.doubleShiftToggleActive,
              !user.doubleShiftAllowed && styles.doubleShiftToggleDisabled,
            ]}
            onPress={() => {
              if (user.doubleShiftAllowed) {
                toggleDoubleShift();
              }
            }}
            activeOpacity={user.doubleShiftAllowed ? 0.8 : 1}
          >
            <View
              style={[
                styles.doubleShiftKnob,
                doubleShiftEnabled && styles.doubleShiftKnobActive,
                !user.doubleShiftAllowed && styles.doubleShiftKnobDisabled,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {isLockedForToday ? (
          <View style={styles.actionRowSingle}>
            <View style={[styles.actionBtn, styles.actionBtnLocked]}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#2563eb" />
              <Text style={styles.actionBtnTextLocked}>Checked Out for Today</Text>
            </View>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, canCheckIn && styles.actionBtnActive]}
              onPress={handleCheckIn}
              disabled={!canCheckIn || attendanceLoading || attendanceActionLoading}
            >
              {attendanceActionLoading && canCheckIn ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="log-in-outline" size={24} color={canCheckIn ? '#fff' : '#94a3b8'} />
              )}
              <Text style={canCheckIn ? styles.actionBtnTextActive : styles.actionBtnTextDisabled}>
                {checkedIn ? (doubleShiftEnabled ? '2nd Check In' : 'Checked In') : 'Check In'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, canCheckOut && styles.actionBtnActive]}
              onPress={handleCheckOut}
              disabled={!canCheckOut || attendanceLoading || attendanceActionLoading}
            >
              {attendanceActionLoading && canCheckOut ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="log-out-outline" size={24} color={canCheckOut ? '#fff' : '#94a3b8'} />
              )}
              <Text style={canCheckOut ? styles.actionBtnTextActive : styles.actionBtnTextDisabled}>
                {checkedIn ? (session.todayPunchCount >= 3 ? '2nd Check Out' : 'Check Out') : 'Check In First'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ═══ TIME TABS ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ATTENDANCE RECORDS</Text>
          <View style={styles.tabRow}>
            {(['Daily', 'Weekly', 'Monthly'] as TimeTab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Department Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptFilter}>
            {DEPARTMENTS.map(dept => (
              <TouchableOpacity
                key={dept}
                style={[styles.deptChip, selectedDept === dept && styles.deptChipActive]}
                onPress={() => setSelectedDept(dept)}
              >
                <Text style={[styles.deptChipText, selectedDept === dept && styles.deptChipTextActive]}>{dept}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stats Summary */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#007AFF' }]}>
              <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#22c55e' }]}>
              <Text style={styles.statValue}>{stats.present}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#d97706' }]}>
              <Text style={styles.statValue}>{stats.late}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#dc2626' }]}>
              <Text style={styles.statValue}>{stats.absent}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </View>

          {/* Records List */}
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No records found for this filter</Text>
            </View>
          ) : (
            filteredRecords.map((rec, idx) => {
              const sc = getStatusColor(rec.status);
              return (
                <Animated.View key={rec.id} entering={FadeInDown.delay(idx * 50).duration(300)} style={styles.recordCard}>
                  <View style={styles.recordLeft}>
                    <Text style={styles.recordDate}>{rec.date}</Text>
                    <Text style={styles.recordDept}>{rec.department}</Text>
                  </View>
                  <View style={styles.recordCenter}>
                    <Text style={styles.recordTime}>{rec.checkIn} - {rec.checkOut}</Text>
                    <Text style={styles.recordHours}>{rec.hoursWorked}</Text>
                  </View>
                  <View style={[styles.recordBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.recordBadgeText, { color: sc.text }]}>{rec.status}</Text>
                  </View>
                </Animated.View>
              );
            })
          )}

          {/* Generate Report */}
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateReport} disabled={reportLoading}>
            {reportLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={20} color="#fff" />
                <Text style={styles.generateBtnText}>Generate Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ═══ CORRECTION REQUESTS ═══ */}
       

        {/* Shift & Schedule */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.shiftCard}>
          <View style={styles.shiftHeader}>
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <Text style={styles.shiftTitle}>Shift & Schedule</Text>
          </View>
          <View style={styles.shiftBody}>
            <View style={styles.shiftInfo}>
              <Text style={styles.shiftLabel}>Standard Shift</Text>
              <Text style={styles.shiftTime}>10:00 AM - 07:00 PM</Text>
              <Text style={styles.shiftDays}>Mon-Fri</Text>
            </View>
            <View style={styles.shiftDivider} />
            <View style={styles.shiftInfo}>
              <Text style={styles.shiftLabel}>Break Time</Text>
              <Text style={styles.shiftTime}>01:00 PM - 02:00 PM</Text>
              <Text style={styles.shiftDays}>Fixed 60 mins</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/(employee)/attendance-history')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="clipboard-outline" size={20} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>View Attendance History</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/(employee)/attendance-logging')}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>Attendance Correction</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => router.push('/(employee)/leave' as any)}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="calendar-outline" size={20} color="#ef4444" />
            </View>
            <Text style={styles.quickActionText}>Apply Leave</Text>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ═══ REPORT MODAL ═══ */}
      <Modal visible={reportVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.reportModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📊 Attendance Report</Text>
              <TouchableOpacity onPress={() => setReportVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.reportSubTitle}>{activeTab} — {selectedDept} Department</Text>

            <View style={styles.reportGrid}>
              <View style={styles.reportItem}>
                <Text style={styles.reportValue}>{stats.attendanceRate}%</Text>
                <Text style={styles.reportLabel}>Attendance Rate</Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={styles.reportValue}>{stats.present + stats.late}</Text>
                <Text style={styles.reportLabel}>Total Working Days</Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={styles.reportValue}>{stats.late}</Text>
                <Text style={styles.reportLabel}>Late Entries</Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={styles.reportValue}>{stats.absent}</Text>
                <Text style={styles.reportLabel}>Absent Days</Text>
              </View>
            </View>

            <View style={styles.exportRow}>
              <TouchableOpacity style={styles.exportBtn} onPress={() => exportReportPdf(true)} disabled={reportLoading}>
                {reportLoading ? <ActivityIndicator size="small" color="#007AFF" /> : <Ionicons name="document-outline" size={18} color="#007AFF" />}
                <Text style={styles.exportBtnText}>PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.exportBtn} onPress={() => exportReportPdf(true)}>
                <Ionicons name="share-outline" size={18} color="#007AFF" />
                <Text style={styles.exportBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ═══ REJECTION REASON MODAL ═══ */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.rejectModal}>
            <Text style={styles.modalTitle}>Rejection Reason</Text>
            <TextInput
              style={styles.rejectInput}
              placeholder="Enter reason for rejection..."
              placeholderTextColor="#94a3b8"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.rejectModalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmRejectBtn} onPress={handleRejectConfirm}>
                <Text style={styles.confirmRejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ═══ CORRECTION DETAIL MODAL ═══ */}
      <Modal visible={detailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Correction Detail</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {selectedCorrection && (
              <>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{selectedCorrection.date}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Type</Text><Text style={styles.detailValue}>{selectedCorrection.type}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Original Time</Text><Text style={styles.detailValue}>{selectedCorrection.originalTime}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Requested Time</Text><Text style={[styles.detailValue, { color: '#007AFF' }]}>{selectedCorrection.requestedTime}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Difference</Text><Text style={styles.detailValue}>~1h 10m</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Reason</Text><Text style={styles.detailValue}>{selectedCorrection.reason}</Text></View>
                {selectedCorrection.status === 'Pending' && (
                  <View style={styles.correctionActions}>
                    <TouchableOpacity style={styles.approveBtn} onPress={() => { handleApprove(selectedCorrection.id); setDetailModalVisible(false); }}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => { handleRejectPress(selectedCorrection.id); setDetailModalVisible(false); }}>
                      <Ionicons name="close" size={16} color="#ef4444" />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}

function AttendanceStyles(colors: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: 20 },

    // Toast
    toast: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', margin: 20, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#dcfce7' },
    toastIcon: { marginRight: 8 },
    toastText: { fontSize: 14, color: '#166534', fontWeight: '600' },
    toastTextLocked: { color: '#1d4ed8' },

    // Details
    detailsCard: { backgroundColor: colors.card, marginHorizontal: 20, borderRadius: 24, padding: 24, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, marginBottom: 20 },
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    detailsSub: { fontSize: 13, color: colors.textMuted, fontWeight: '500', marginBottom: 4 },
    detailsDate: { fontSize: 22, fontWeight: '800', color: colors.textSecondary },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '800' },
    checkRow: { flexDirection: 'row', gap: 12 },
    checkItem: { flex: 1, backgroundColor: colors.surfaceAlt, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight },
    checkLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, marginBottom: 8, letterSpacing: 0.5 },
    checkTime: { fontSize: 16, fontWeight: '800', color: colors.textSecondary, marginBottom: 4 },
    checkStatus: { fontSize: 11, color: '#10b981', fontWeight: '600' },
    checkStatusCompleted: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

    // Action Buttons
    actionRow: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginBottom: 20 },
    actionRowSingle: { marginHorizontal: 20, marginBottom: 20 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 8 },
    actionBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
    actionBtnLocked: { flex: undefined, backgroundColor: colors.primaryBg, borderColor: colors.heroBorder, justifyContent: 'flex-start', paddingHorizontal: 16, minHeight: 58 },
    actionBtnTextActive: { fontSize: 15, fontWeight: '700', color: '#fff' },
    actionBtnTextDisabled: { fontSize: 15, fontWeight: '700', color: colors.textMuted },
    actionBtnTextLocked: { fontSize: 15, fontWeight: '700', color: colors.primary },

    // Section
    section: { paddingHorizontal: 20, marginBottom: 24 },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.5, marginBottom: 16 },

    // Tabs
    tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.borderLight },
    tabBtnActive: { backgroundColor: colors.primary },
    tabBtnText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
    tabBtnTextActive: { color: '#fff' },

    // Department Filter
    deptFilter: { marginBottom: 16 },
    deptChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
    deptChipActive: { backgroundColor: colors.primaryBg, borderColor: colors.primary },
    deptChipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
    deptChipTextActive: { color: colors.primary },

    // Stats
    statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 12, padding: 12, borderLeftWidth: 3, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '800', color: colors.textSecondary },
    statLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, marginTop: 4, textTransform: 'uppercase' },

    // Records
    recordCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
    recordLeft: { flex: 1 },
    recordDate: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    recordDept: { fontSize: 11, color: colors.textMuted, fontWeight: '500', marginTop: 2 },
    recordCenter: { flex: 1, alignItems: 'center' },
    recordTime: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
    recordHours: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, marginTop: 2 },
    recordBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    recordBadgeText: { fontSize: 10, fontWeight: '800' },

    // Generate Report
    generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 16, gap: 8, marginTop: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
    generateBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

    // Corrections
    correctionCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight },
    checkbox: { marginRight: 12, justifyContent: 'center' },
    correctionBody: { flex: 1 },
    correctionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    correctionDate: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
    correctionType: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
    correctionTimes: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    correctionTimeItem: { alignItems: 'center' },
    correctionTimeLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
    correctionTimeValue: { fontSize: 14, fontWeight: '800', color: colors.textSecondary },
    correctionReason: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginBottom: 12 },
    correctionActions: { flexDirection: 'row', gap: 8 },
    approveBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#22c55e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    approveBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    rejectBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fef2f2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#fee2e2' },
    rejectBtnText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
    reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#c7d2fe' },
    reviewBtnText: { fontSize: 12, fontWeight: '700', color: '#007AFF' },

    // Bulk
    bulkRow: { marginBottom: 12 },
    bulkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#22c55e', paddingVertical: 10, borderRadius: 12 },
    bulkBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 32 },
    emptyText: { fontSize: 14, color: colors.textMuted, fontWeight: '600', marginTop: 12 },

    // Shift
    shiftCard: { backgroundColor: colors.primaryBg, marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 24 },
    shiftHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    shiftTitle: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
    shiftBody: { flexDirection: 'row', alignItems: 'center' },
    shiftInfo: { flex: 1 },
    shiftLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
    shiftTime: { fontSize: 14, fontWeight: '800', color: colors.textSecondary, marginBottom: 4 },
    shiftDays: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
    shiftDivider: { width: 1, height: 40, backgroundColor: colors.heroBorder, marginHorizontal: 16 },

    // Double Shift
    doubleShiftRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 16, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.borderLight },
    doubleShiftLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    doubleShiftLabel: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
    doubleShiftLabelDisabled: { color: colors.textMuted },
    doubleShiftHint: { fontSize: 11, fontWeight: '600', color: '#94a3b8', marginLeft: 4 },
    doubleShiftToggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: '#e2e8f0', justifyContent: 'center', paddingHorizontal: 4 },
    doubleShiftToggleActive: { backgroundColor: '#4f46e5' },
    doubleShiftToggleDisabled: { backgroundColor: '#f1f5f9' },
    doubleShiftKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
    doubleShiftKnobActive: { transform: [{ translateX: 20 }] },
    doubleShiftKnobDisabled: { backgroundColor: '#cbd5e1' },

    // Quick Actions
    quickActionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 16, marginBottom: 12, gap: 12 },
    quickActionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    quickActionText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textSecondary },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    reportModal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textSecondary },
    reportSubTitle: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginBottom: 20 },
    reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    reportItem: { width: '47%', backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 16, alignItems: 'center' },
    reportValue: { fontSize: 24, fontWeight: '800', color: colors.textSecondary },
    reportLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', marginTop: 4 },
    exportRow: { flexDirection: 'row', gap: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 10 },
    exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
    exportBtnText: { fontSize: 14, fontWeight: '700', color: colors.primary },

    // Reject Modal
    rejectModal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
    rejectInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, fontSize: 14, color: colors.inputText, minHeight: 80, textAlignVertical: 'top', marginVertical: 16 },
    rejectModalActions: { flexDirection: 'row', gap: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 10 },
    cancelModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.borderLight, alignItems: 'center' },
    cancelModalText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
    confirmRejectBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.error, alignItems: 'center' },
    confirmRejectText: { fontSize: 14, fontWeight: '700', color: '#fff' },

    // Detail Modal
    detailModal: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    detailLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    detailValue: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  });
}
