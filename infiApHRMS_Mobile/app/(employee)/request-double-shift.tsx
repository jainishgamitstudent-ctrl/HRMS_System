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
      Alert.alert('Missing Date', 'Please enter the date you want to work double shift.');
      return;
    }
    setLoading(true);
    try {
      await createDoubleShiftRequest(requestDate.trim(), reason.trim());
      Alert.alert('Submitted', 'Your double shift request has been submitted for review.');
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

  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Header title="Request Double Shift" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.formCard}>
          <Text style={styles.formTitle}>New Request</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2026-05-20"
              placeholderTextColor="#94a3b8"
              value={requestDate}
              onChangeText={setRequestDate}
              keyboardType="default"
              autoCapitalize="none"
            />
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
  });
}
