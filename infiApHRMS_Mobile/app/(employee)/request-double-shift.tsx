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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../../components/layout/Header';
import { BottomNav } from '../../components/BottomNav';
import { createDoubleShiftRequest, fetchMyDoubleShiftRequests, type DoubleShiftRequest } from '../../services/doubleShift';
import { useAppTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';

export default function RequestDoubleShiftScreen() {
  const { colors } = useAppTheme();
  const [requestDate, setRequestDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<DoubleShiftRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(0);

  const loadRequests = useCallback(async () => {
    setFetching(true);
    try {
      const response = await fetchMyDoubleShiftRequests();
      if (response.status === 'Success' && Array.isArray(response.data)) {
        setMyRequests(response.data);
      }
    } catch (error: any) {
      console.warn('[DoubleShift] Failed to load requests:', error.message);
    } finally {
      setFetching(false);
    }
  }, []);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleSubmit = async () => {
    if (!requestDate.trim()) {
      Alert.alert('Missing Date', 'Please select the date you want to work double shift.');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(requestDate.trim())) {
      Alert.alert('Invalid Date', 'Please use the calendar to select a valid date (YYYY-MM-DD).');
      return;
    }
    setLoading(true);
    try {
      await createDoubleShiftRequest(requestDate.trim(), reason.trim());
      Alert.alert('Submitted', 'Your double shift request has been submitted for review. HR and Admin will be notified.');
      setRequestDate('');
      setReason('');
      loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

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

  const generateMonthDays = (monthOffset: number = 0) => {
    const days = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + monthOffset;
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) days.push(i);
    return days;
  };

  const getMonthYear = (monthOffset: number = 0) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const monthName = date.toLocaleString('en-US', { month: 'long' }).toUpperCase();
    const year = date.getFullYear();
    return `${monthName} ${year}`;
  };

  const handleDateSelect = (dateString: string) => {
    setRequestDate(dateString);
    setIsCalendarVisible(false);
  };

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Header title="Request Double Shift" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.formCard}>
          <Text style={styles.formTitle}>New Request</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date *</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center' }]}
              activeOpacity={0.7}
              onPress={() => {
                setCalendarMonth(0);
                setIsCalendarVisible(true);
              }}
            >
              <Text style={requestDate ? styles.inputText : styles.placeholderText}>
                {requestDate || 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color="#94a3b8" style={{ position: 'absolute', right: 14 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Why do you need double shift?"
              placeholderTextColor="#94a3b8"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.sectionTitle}>My Requests</Text>

        {fetching ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : myRequests.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color="#e2e8f0" />
            <Text style={styles.emptyText}>No requests yet.</Text>
          </View>
        ) : (
          myRequests.map((req, idx) => (
            <Animated.View
              key={req._id}
              entering={FadeInDown.delay(idx * 60)}
              style={styles.requestCard}
            >
              <View style={styles.requestHeader}>
                <Text style={styles.requestDate}>{formatDate(req.requestDate)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(req.status) }]}>
                    {req.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              {req.reason ? <Text style={styles.reasonText}>{req.reason}</Text> : null}
              {req.reviewNotes ? (
                <Text style={styles.notesText}>Note: {req.reviewNotes}</Text>
              ) : null}
            </Animated.View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNav />

      {/* Calendar Modal */}
      <Modal
        visible={isCalendarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCalendarVisible(false)}
        >
          <View style={styles.calendarModalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Date</Text>
            </View>

            <View style={styles.calendarContainer}>
              <View style={styles.calendarMonthHeader}>
                <TouchableOpacity
                  onPress={() => setCalendarMonth(0)}
                  style={[styles.monthTab, calendarMonth === 0 && styles.monthTabActive]}
                >
                  <Text style={[styles.calendarMonthText, calendarMonth === 0 && styles.monthTabTextActive]}>
                    {getMonthYear(0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCalendarMonth(1)}
                  style={[styles.monthTab, calendarMonth === 1 && styles.monthTabActive]}
                >
                  <Text style={[styles.calendarMonthText, calendarMonth === 1 && styles.monthTabTextActive]}>
                    {getMonthYear(1)}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.calendarWeekRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                  <Text key={d} style={styles.weekDayText}>
                    {d}
                  </Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {generateMonthDays(calendarMonth).map((day, idx) => {
                  const now = new Date();
                  const currentDate = new Date(
                    now.getFullYear(),
                    now.getMonth() + calendarMonth,
                    day || 1
                  );
                  const dateString = `${currentDate.getFullYear()}-${String(
                    currentDate.getMonth() + 1
                  ).padStart(2, '0')}-${String(day || 1).padStart(2, '0')}`;
                  const isToday =
                    !!day &&
                    new Date(
                      now.getFullYear(),
                      now.getMonth() + calendarMonth,
                      day
                    ).toDateString() === new Date().toDateString();

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.calendarDay,
                        requestDate === dateString && styles.calendarDayActive,
                      ]}
                      disabled={!day}
                      onPress={() => {
                        if (day) {
                          handleDateSelect(dateString);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          !day && styles.calendarDayDisabled,
                          isToday && styles.calendarDayToday,
                          requestDate === dateString && styles.calendarDayActiveText,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginTop: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textSecondary,
      marginBottom: 16,
    },
    inputGroup: { marginBottom: 14 },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.textSecondary,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    submitBtn: {
      backgroundColor: '#4f46e5',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 4,
    },
    submitBtnText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textSecondary,
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    empty: {
      alignItems: 'center',
      marginTop: 40,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: 8,
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
      marginBottom: 8,
    },
    requestDate: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textSecondary,
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
    reasonText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
      marginTop: 4,
    },
    notesText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
      marginTop: 6,
      fontStyle: 'italic',
    },
    inputText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    placeholderText: {
      color: '#94a3b8',
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    calendarModalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 8,
    },
    modalHeader: {
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: '#e2e8f0',
      borderRadius: 2,
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    calendarContainer: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 24,
    },
    calendarMonthHeader: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 4,
      marginBottom: 20,
      gap: 0,
    },
    monthTab: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 8,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthTabActive: {
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    calendarMonthText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0,
    },
    monthTabTextActive: {
      color: '#4f39f6',
      fontWeight: '800',
    },
    calendarWeekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    weekDayText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMuted,
      width: '14.28%',
      textAlign: 'center',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
      borderRadius: 999,
    },
    calendarDayActive: {
      backgroundColor: '#4f39f6',
      shadowColor: '#4f39f6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    calendarDayText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#475569',
    },
    calendarDayActiveText: {
      color: '#fff',
      fontWeight: '700',
    },
    calendarDayDisabled: {
      color: '#e2e8f0',
    },
    calendarDayToday: {
      color: '#4f39f6',
      fontWeight: '800',
    },
  });
}
