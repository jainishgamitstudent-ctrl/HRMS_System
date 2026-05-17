import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AdminBottomNav } from '../../components/AdminBottomNav';
import Header from '../../components/layout/Header';
import { ADMIN_API_URL } from '../../constants/api';

import { useAppTheme } from '@/context/ThemeContext';
export default function ManageHR() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => ManageHRStyles(colors), [colors]);
  const [hrStaff, setHRStaff] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHRStaff = async () => {
    try {
      const response = await fetch(`${ADMIN_API_URL}/hr-staff`);
      const json = await response.json();
      if (json.success) {
        setHRStaff(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch HR staff:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHRStaff();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHRStaff();
  }, []);

  const handleDeleteHR = (id: string, name: string) => {
    Alert.alert(
      'Remove HR Staff',
      `Are you sure you want to remove ${name} from the HR department?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
             try {
               const response = await fetch(`${ADMIN_API_URL}/hr-staff/${id}`, { method: 'DELETE' });
               const json = await response.json();
               if (json.success) {
                 setHRStaff(prev => prev.filter(h => h._id !== id));
                 Alert.alert('Success', 'HR staff removed successfully.');
               }
             } catch {
               Alert.alert('Error', 'Failed to remove staff.');
             }
          }
        }
      ]
    );
  };

  const handleUpdatePermissions = (id: string) => {
    Alert.alert('Edit Permissions', 'Feature to toggle specific HR permissions (Payroll, Recruitment, Leaves) is coming soon.');
  };

  return (
    <View style={styles.container}>
      <Header title="Manage HR Dept" showBack={true} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{hrStaff.length}</Text>
            <Text style={styles.summaryLab}>Total HR</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#10b981' }]}>
               {hrStaff.filter(h => h.status === 'Active').length}
            </Text>
            <Text style={styles.summaryLab}>Active</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>HR Personnel</Text>

        {hrStaff.map((hr, idx) => (
          <Animated.View key={hr._id} entering={FadeInDown.delay(idx * 100).springify()} style={styles.hrCard}>
            <View style={styles.hrHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{hr.fullName[0]}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{hr.fullName}</Text>
                <Text style={styles.role}>{hr.designation || 'HR Specialist'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: hr.status === 'Active' ? '#f0fdf4' : '#fef2f2' }]}>
                <Text style={[styles.statusText, { color: hr.status === 'Active' ? '#10b981' : '#ef4444' }]}>
                  {hr.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detail}>
                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                <Text style={styles.detailText}>Joined: {new Date(hr.joiningDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detail}>
                <Ionicons name="key-outline" size={14} color={colors.textMuted} />
                <Text style={styles.detailText}>{hr.permissions?.length || 0} Permissions</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdatePermissions(hr._id)}>
                <Ionicons name="settings-outline" size={18} color="#4f46e5" />
                <Text style={styles.actionBtnText}>Permissions</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.deleteBtn]} 
                onPress={() => handleDeleteHR(hr._id, hr.fullName)}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        {hrStaff.length === 0 && !loading && (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>No HR staff found</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminBottomNav />
    </View>
  );
}

function ManageHRStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20 },
  summaryCard: { 
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: 24, padding: 20, 
    marginBottom: 24, borderWidth: 1, borderColor: colors.borderLight, shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 24, fontWeight: '800', color: colors.textSecondary },
  summaryLab: { fontSize: 12, fontWeight: '600', color: colors.textMuted, marginTop: 4 },
  divider: { width: 1, backgroundColor: '#f1f5f9', height: '100%' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.textSecondary, marginBottom: 16 },
  hrCard: { backgroundColor: colors.card, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  hrHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  role: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  detailsRow: { flexDirection: 'row', gap: 16, marginTop: 16, borderTopWidth: 1, borderColor: colors.borderLight, paddingTop: 16 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.actionBg 
  },
  deleteBtn: { backgroundColor: '#fef2f2' },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#4f46e5' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: colors.textMuted, fontWeight: '600', marginTop: 12 },
});
}
