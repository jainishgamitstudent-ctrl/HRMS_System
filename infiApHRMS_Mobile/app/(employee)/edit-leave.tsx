import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Platform, KeyboardAvoidingView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated';
import { useLeave } from '../../context/LeaveContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';

import { useAppTheme } from '@/context/ThemeContext';
export default function EditLeave() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { leaves, updateLeave, balances } = useLeave();
  
  const leave = leaves.find(l => l.id === id);

  const [leaveType, setLeaveType] = useState(leave?.type || '');
  const [startDate, setStartDate] = useState(leave?.startDate || '');
  const [endDate, setEndDate] = useState(leave?.endDate || '');
  const [reason, setReason] = useState(leave?.reason || '');
  const [notifyManager, setNotifyManager] = useState(true);
  
  const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end'>('start');
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  // Animation values
  const successScale = useSharedValue(0.8);
  const successOpacity = useSharedValue(0);

  // If leaf not found or not pending, return early or show error
  useEffect(() => {
    if (!leave) {
      alert('Leave not found');
      router.back();
    } else if (leave.status !== 'PENDING') {
      alert('Only pending leaves can be edited');
      router.back();
    }
  }, [leave]);

  const LEAVE_TYPES = [
    { label: 'Casual Leave', icon: 'cafe-outline', color: '#f59e0b' },
    { label: 'Sick Leave', icon: 'medical-outline', color: '#ef4444' },
    { label: 'Privilege Leave', icon: 'star-outline', color: '#6366f1' },
    { label: 'Maternity/Paternity Leave', icon: 'heart-outline', color: '#ec4899' },
  ];

  // Simple Month Days Generator
  const generateMonthDays = () => {
    const days = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Fill empty spots for first week
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Fill days
    for (let i = 1; i <= lastDate; i++) days.push(i);
    
    return days;
  };

  const monthDays = generateMonthDays();

  const handleUpdate = () => {
    if (!leaveType || !startDate || !endDate || !reason) {
      alert('Please fill in all required fields');
      return;
    }

    // Date conflict/Validation
    const start = new Date(startDate);
    const end = new Date(endDate);
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const typeKey = leaveType.toLowerCase().split(' ')[0] as keyof typeof balances;
    
    // Adjusted balance check considering the previously applied days if type is same
    const appliedDays = leave?.type === leaveType ? leave.days : 0;
    const effectiveAvailable = (balances[typeKey] || 0) + appliedDays;

    if (balances[typeKey] !== undefined && diffDays > effectiveAvailable) {
      alert(`Insufficient ${leaveType} balance.`);
      return;
    }
    
    // Update Request
    updateLeave(id as string, {
      type: leaveType,
      startDate,
      endDate,
      reason,
    });
    
    // Show Success Modal with Animation
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

  if (!leave || leave.status !== 'PENDING') return null;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Header title="Edit Leave" showBack={true} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Start Date</Text>
                <TouchableOpacity 
                  style={styles.inputWrap} 
                  activeOpacity={0.7}
                  onPress={() => {
                    setCalendarTarget('start');
                    setIsCalendarVisible(true);
                  }}
                >
                  <Text style={startDate ? styles.inputText : styles.placeholderText}>
                    {startDate || 'YYYY-MM-DD'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                </TouchableOpacity>
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>End Date</Text>
                <TouchableOpacity 
                  style={styles.inputWrap} 
                  activeOpacity={0.7}
                  onPress={() => {
                    setCalendarTarget('end');
                    setIsCalendarVisible(true);
                  }}
                >
                  <Text style={endDate ? styles.inputText : styles.placeholderText}>
                    {endDate || 'YYYY-MM-DD'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                </TouchableOpacity>
              </View>
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

          {/* Action Buttons */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate} activeOpacity={0.8}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>

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
            <View style={[styles.modalContent, { minHeight: '40%' }]}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Select {calendarTarget === 'start' ? 'Start' : 'End'} Date</Text>
              </View>
              
              <View style={styles.calendarContainer}>
                <View style={styles.calendarGrid}>
                  {monthDays.map((day, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.calendarDay,
                        day === parseInt(calendarTarget === 'start' ? startDate.split('-')[2] : endDate.split('-')[2], 10) && styles.calendarDayActive
                      ]}
                      disabled={!day}
                      onPress={() => {
                        if (day) {
                          const formatted = `2026-10-${day.toString().padStart(2, '0')}`;
                          if (calendarTarget === 'start') setStartDate(formatted);
                          else setEndDate(formatted);
                          setIsCalendarVisible(false);
                        }
                      }}
                    >
                      <Text style={[
                         styles.calendarDayText,
                         !day && styles.calendarDayDisabled,
                         day === parseInt(calendarTarget === 'start' ? startDate.split('-')[2] : endDate.split('-')[2], 10) && styles.calendarDayActiveText
                      ]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
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
                   <Ionicons name="checkmark" size={40} color="#fff" />
                </View>
                <Text style={styles.successTitle}>Leave Updated Successfully ✅</Text>
                <Text style={styles.successSub}>Your changes have been saved.</Text>
             </Animated.View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  formSection: {
    marginBottom: 30,
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
  inputWrap: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    justifyContent: 'center',
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
  calendarContainer: {
    padding: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
  },
  calendarDayActive: {
    backgroundColor: '#4f39f6',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  calendarDayActiveText: {
    color: '#fff',
  },
  calendarDayDisabled: {
    color: '#e2e8f0',
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
  },
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
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#22c55e',
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
