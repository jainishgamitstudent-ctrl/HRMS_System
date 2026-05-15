import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Header from '../../components/layout/Header';
import { useUser } from '../../context/UserContext';
import { submitResignation } from '../../services/auth';

const REASONS = [
  'Better Opportunity',
  'Relocation',
  'Personal Reasons',
  'Career Change',
  'Higher Education',
  'Other',
];

export default function ApplyResignationPage() {
  const { user } = useUser();
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState('');
  const [noticePeriodDays, setNoticePeriodDays] = useState('30');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalReason = reason === 'Other' ? otherReason : reason;

  const handleSubmit = async () => {
    if (!finalReason.trim()) {
      Alert.alert('Validation', 'Please select or enter a reason.');
      return;
    }
    if (!lastWorkingDate.trim()) {
      Alert.alert('Validation', 'Please enter your last working date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitResignation({
        userId: user._id || user.employeeId,
        employeeId: user.employeeId,
        employeeName: user.name,
        employeeEmail: user.email,
        department: user.department,
        designation: user.role,
        reason: finalReason,
        noticePeriodDays: Number(noticePeriodDays) || 30,
        lastWorkingDate,
        comments,
      });
      Alert.alert(
        'Resignation Submitted',
        'Your resignation request has been sent to HR for review.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit resignation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDateInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    placeholder: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.dateInputWrapper}>
        <Ionicons name="calendar-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, styles.dateInput]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <Header title="Apply Resignation" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color="#3b82f6" />
          <Text style={styles.infoText}>
            Submitting a resignation will notify HR and your manager. You can track the status in your settings.
          </Text>
        </View>

        {/* Employee Details (Read-only) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Employee Details</Text>
          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Name</Text>
            <Text style={styles.readOnlyValue}>{user.name}</Text>
          </View>
          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Employee ID</Text>
            <Text style={styles.readOnlyValue}>{user.employeeId}</Text>
          </View>
          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Department</Text>
            <Text style={styles.readOnlyValue}>{user.department}</Text>
          </View>
          <View style={[styles.readOnlyRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.readOnlyLabel}>Designation</Text>
            <Text style={styles.readOnlyValue}>{user.role}</Text>
          </View>
        </View>

        {/* Resignation Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Resignation Details</Text>

          {/* Reason */}
          <Text style={styles.inputLabel}>Reason</Text>
          <View style={styles.reasonList}>
            {REASONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.reasonChip, reason === r && styles.reasonChipActive]}
                onPress={() => setReason(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.reasonChipText, reason === r && styles.reasonChipTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {reason === 'Other' && (
            <TextInput
              style={[styles.textInput, { marginTop: 12 }]}
              value={otherReason}
              onChangeText={setOtherReason}
              placeholder="Specify your reason..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
            />
          )}

          {/* Last Working Date */}
          {renderDateInput('Last Working Date (YYYY-MM-DD)', lastWorkingDate, setLastWorkingDate, 'e.g. 2025-06-30')}

          {/* Notice Period */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notice Period (days)</Text>
            <TextInput
              style={styles.textInput}
              value={noticePeriodDays}
              onChangeText={setNoticePeriodDays}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Comments */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Comments</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={comments}
              onChangeText={setComments}
              placeholder="Any additional context for HR..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Submit Resignation</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  readOnlyLabel: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  readOnlyValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingLeft: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  reasonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reasonChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  reasonChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  reasonChipTextActive: {
    color: '#fff',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
