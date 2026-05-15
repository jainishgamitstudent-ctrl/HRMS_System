import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Platform, KeyboardAvoidingView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import { BottomNav } from '../../components/BottomNav';
import { useLeave } from '../../context/LeaveContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';

import { useAppTheme } from '@/context/ThemeContext';
export default function ApplyLeave() {
  const { colors } = useAppTheme();
  const { applyLeave, balances } = useLeave();
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateMode, setDateMode] = useState<'single' | 'range' | 'half'>('single');
  const [reason, setReason] = useState('');
  const [notifyManager, setNotifyManager] = useState(true);
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end'>('start');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(0); // 0 = current month, 1 = next month
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState({
    title: 'Leave Applied Successfully',
    sub: 'Your request has been sent for approval.'
  });

  // Animation values
  const successScale = useSharedValue(0.8);
  const successOpacity = useSharedValue(0);

  const LEAVE_TYPES = [
    { label: 'Casual Leave', icon: 'cafe-outline', color: '#f59e0b' },
    { label: 'Sick Leave', icon: 'medical-outline', color: '#ef4444' },
    { label: 'Paid Leave', icon: 'cash-outline', color: '#10b981' },
    { label: 'Half Day Leave', icon: 'time-outline', color: '#6366f1' },
    { label: 'Maternity/Paternity Leave', icon: 'heart-outline', color: '#ec4899' },
  ];

  // Generate month days for current or next month
  const generateMonthDays = (monthOffset: number = 0) => {
    const days = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + monthOffset;
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Fill empty spots for first week
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Fill days
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

  const monthDays = generateMonthDays(calendarMonth);

  const handleDateSelect = (dateString: string) => {
    if (calendarTarget === 'start') {
      setStartDate(dateString);

      if (dateMode === 'single' || dateMode === 'half' || !endDate || new Date(endDate) < new Date(dateString)) {
        setEndDate(dateString);
      }
    } else {
      setEndDate(dateString);
    }

    setIsCalendarVisible(false);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Step 6: System Validation (from Flowchart)
    const finalEndDate = dateMode === 'range' ? endDate : startDate;

    if (!leaveType || !startDate || !finalEndDate || !reason) {
      alert('Please fill in all required fields');
      return;
    }

    // Date conflict/Validation
    const start = new Date(startDate);
    const end = new Date(finalEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Please enter valid dates (YYYY-MM-DD)');
      return;
    }
    if (end < start) {
      alert('End date cannot be before start date');
      return;
    }

    // Leave balance check
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = dateMode === 'half'
      ? 0.5
      : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const typeKey = leaveType.toLowerCase().split(' ')[0] as keyof typeof balances;
    if (balances[typeKey] !== undefined && diffDays > balances[typeKey]) {
      alert(`Insufficient ${leaveType} balance. Available: ${balances[typeKey]} days.`);
      return;
    }
    
    // Step 5: Submit Request
    try {
      setIsSubmitting(true);

      await applyLeave({
        type: dateMode === 'half' ? `${leaveType} (Half Day)` : leaveType,
        startDate,
        endDate: finalEndDate,
        reason,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to submit leave request');
      setIsSubmitting(false);
      return;
    }
    
    // Show Success Modal with Animation
    setSuccessInfo({
      title: 'Leave Applied Successfully',
      sub: 'Your request has been sent for approval.'
    });
    setIsSuccessVisible(true);
    successScale.value = withSpring(1);
    successOpacity.value = withTiming(1, { duration: 400 });

    setTimeout(() => {
        setIsSuccessVisible(false);
        router.back();
    }, 2000);
  };

  const handleSaveDraft = async () => {
    // Partial validation for draft
    if (!leaveType && !startDate && !endDate) {
      alert('Please select at least a leave type or date to save a draft');
      return;
    }

    // Step 5: Save as Draft
    await applyLeave({
      type: leaveType || 'Unspecified Leave',
      startDate: startDate || 'Not set',
      endDate: endDate || 'Not set',
      reason: reason || 'No reason provided',
    }, 'DRAFT');
    
    // Show Success Modal with Animation
    setSuccessInfo({
      title: 'Draft Saved Successfully',
      sub: 'You can find this in your Drafts tab.'
    });
    setIsSuccessVisible(true);
    successScale.value = withSpring(1);
    successOpacity.value = withTiming(1, { duration: 400 });

    setTimeout(() => {
        setIsSuccessVisible(false);
        router.back();
    }, 2000);
  };

  const animatedSuccessStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  return (
    <View style={styles.root}>
      <Header title="Apply Leave" showBack={true} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconWrap}>
              <Ionicons name="calendar" size={24} color="#4f39f6" />
            </View>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitle}>Leave Application</Text>
              <Text style={styles.bannerSub}>Request time off from InfiAP portal</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.label}>Leave Type</Text>
            <TouchableOpacity 
              style={styles.dropdown} 
              activeOpacity={0.7}
              onPress={() => setIsTypeModalVisible(true)}
            >
              <Text style={leaveType ? styles.inputText : styles.placeholderText}>
                {leaveType || 'Select leave category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={dateMode === 'range' ? styles.halfWidth : styles.fullWidth}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.inputWrap} 
                  activeOpacity={0.7}
                  onPress={() => {
                    setCalendarTarget('start');
                    setCalendarMonth(0);
                    setIsCalendarVisible(true);
                  }}
                >
                  <Text style={startDate ? styles.inputText : styles.placeholderText}>
                    {startDate || 'YYYY-MM-DD'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                </TouchableOpacity>
              </View>
              {dateMode === 'range' && (
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity 
                    style={styles.inputWrap} 
                    activeOpacity={0.7}
                    onPress={() => {
                      setCalendarTarget('end');
                      setCalendarMonth(0);
                      setIsCalendarVisible(true);
                    }}
                  >
                    <Text style={endDate ? styles.inputText : styles.placeholderText}>
                      {endDate || 'YYYY-MM-DD'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.dateModeWrap}>
              <TouchableOpacity
                style={[styles.dateModeButton, dateMode === 'single' && styles.dateModeButtonActive]}
                activeOpacity={0.75}
                onPress={() => {
                  setDateMode('single');
                  if (startDate) setEndDate(startDate);
                }}
              >
                <Ionicons name="today-outline" size={16} color={dateMode === 'single' ? '#fff' : '#64748b'} />
                <Text style={[styles.dateModeText, dateMode === 'single' && styles.dateModeTextActive]}>Single day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateModeButton, dateMode === 'half' && styles.dateModeButtonActive]}
                activeOpacity={0.75}
                onPress={() => {
                  setDateMode('half');
                  if (startDate) setEndDate(startDate);
                }}
              >
                <Ionicons name="time-outline" size={16} color={dateMode === 'half' ? '#fff' : '#64748b'} />
                <Text style={[styles.dateModeText, dateMode === 'half' && styles.dateModeTextActive]}>Half day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateModeButton, dateMode === 'range' && styles.dateModeButtonActive]}
                activeOpacity={0.75}
                onPress={() => setDateMode('range')}
              >
                <Ionicons name="calendar-outline" size={16} color={dateMode === 'range' ? '#fff' : '#64748b'} />
                <Text style={[styles.dateModeText, dateMode === 'range' && styles.dateModeTextActive]}>Multiple days</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Reason for Leave</Text>
            <View style={[styles.inputWrap, styles.textAreaWrap]}>
              <TextInput
                style={styles.textArea}
                placeholder="Please provide details about your request..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.settingsCard}>
            <View style={styles.settingsIconWrap}>
              <Ionicons name="notifications-outline" size={22} color="#475569" />
            </View>
            <View style={styles.settingsTextWrap}>
              <Text style={styles.settingsTitle}>Notify Manager</Text>
              <Text style={styles.settingsSub}>Send instant alert to your supervisor</Text>
            </View>
            <Switch
              value={notifyManager}
              onValueChange={setNotifyManager}
              trackColor={{ false: '#e2e8f0', true: '#4f39f6' }}
              thumbColor={Platform.OS === 'ios' ? '#fff' : notifyManager ? '#fff' : '#f4f3f4'}
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#f59e0b" style={{ marginTop: 2 }} />
            <Text style={styles.infoText}>
              By submitting this form, you agree to follow the InfiAP leave policy. Your manager will receive a notification for approval.
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.draftBtn} onPress={handleSaveDraft} activeOpacity={0.7}>
              <Text style={styles.draftBtnText}>Save as Draft</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav />

        {/* Leave Type Selection Modal */}
        <Modal
          visible={isTypeModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsTypeModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setIsTypeModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Select Leave Type</Text>
              </View>
              
              <FlatList
                data={LEAVE_TYPES}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.typeOption}
                    onPress={() => {
                      setLeaveType(item.label);
                      if (item.label === 'Half Day Leave') {
                        setDateMode('half');
                        if (startDate) setEndDate(startDate);
                      }
                      setIsTypeModalVisible(false);
                    }}
                  >
                    <View style={[styles.typeIconWrap, { backgroundColor: `${item.color}15` }]}>
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <Text style={[
                      styles.typeOptionLabel,
                      leaveType === item.label && styles.typeOptionLabelActive
                    ]}>
                      {item.label}
                    </Text>
                    {leaveType === item.label && (
                      <Ionicons name="checkmark-circle" size={22} color="#4f39f6" />
                    )}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                contentContainerStyle={styles.modalList}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Custom Calendar Modal */}
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
                <Text style={styles.modalTitle}>Select {dateMode === 'range' ? (calendarTarget === 'start' ? 'Start' : 'End') : 'Leave'} Date</Text>
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
                   {['S','M','T','W','T','F','S'].map(d => <Text key={d} style={styles.weekDayText}>{d}</Text>)}
                </View>
                <View style={styles.calendarGrid}>
                  {monthDays.map((day, idx) => {
                    const now = new Date();
                    const currentDate = new Date(now.getFullYear(), now.getMonth() + calendarMonth, day || 1);
                    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day || 1).padStart(2, '0')}`;
                    const isToday = !!day && new Date(now.getFullYear(), now.getMonth() + calendarMonth, day).toDateString() === new Date().toDateString();
                    
                    return (
                      <TouchableOpacity 
                        key={idx} 
                        style={[
                          styles.calendarDay,
                          startDate === dateString && styles.calendarDayActive,
                          endDate === dateString && styles.calendarDayActive
                        ]}
                        disabled={!day}
                        onPress={() => {
                          if (day) {
                            handleDateSelect(dateString);
                          }
                        }}
                      >
                        <Text style={[
                           styles.calendarDayText,
                           !day && styles.calendarDayDisabled,
                           isToday && styles.calendarDayToday,
                           (startDate === dateString || endDate === dateString) && styles.calendarDayActiveText
                        ]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={isSuccessVisible}
          transparent={true}
          animationType="none"
        >
          <View style={styles.successOverlay}>
             <Animated.View style={[styles.successCard, animatedSuccessStyle]}>
                <View style={styles.successIconCircle}>
                   <Ionicons name={successInfo.title.includes('Draft') ? "save" : "checkmark"} size={40} color="#fff" />
                </View>
                <Text style={styles.successTitle}>{successInfo.title}</Text>
                <Text style={styles.successSub}>{successInfo.sub}</Text>
             </Animated.View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f39f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerTextWrap: {
    marginLeft: 16,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  bannerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
    marginTop: 16,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  inputText: {
    color: '#1e293b',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  halfWidth: {
    width: '48%',
  },
  fullWidth: {
    width: '100%',
  },
  inputWrap: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
  },
  input: {
    color: '#1e293b',
    fontSize: 15,
  },
  textAreaWrap: {
    height: 120,
    paddingTop: 12,
    justifyContent: 'flex-start',
  },
  textArea: {
    color: '#1e293b',
    fontSize: 15,
    minHeight: 100,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  settingsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settingsTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingsSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    marginLeft: 10,
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: '#4f39f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    shadowColor: '#4f39f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  draftBtn: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  draftBtnText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  dateModeWrap: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
  },
  dateModeButton: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateModeButtonActive: {
    backgroundColor: '#4f39f6',
  },
  dateModeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginLeft: 6,
  },
  dateModeTextActive: {
    color: '#fff',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    maxHeight: '80%',
  },
  calendarModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 8,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    color: '#1e293b',
  },
  modalList: {
    padding: 16,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  typeOptionLabelActive: {
    color: '#1e293b',
    fontWeight: '700',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },

  // Calendar Styles
  calendarContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  calendarMonthText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
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
    color: '#94a3b8',
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
  inputIcon: {
    position: 'absolute',
    right: 16,
  },

  // Success Modal Styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f39f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4f39f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});
