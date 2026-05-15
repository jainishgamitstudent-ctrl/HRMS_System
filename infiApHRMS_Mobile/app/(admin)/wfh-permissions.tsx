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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Header from '../../components/layout/Header';
import { AdminBottomNav } from '../../components/AdminBottomNav';
import { ADMIN_API_URL } from '../../constants/api';
import {
  fetchWFHPermissions,
  grantWFHPermission,
  revokeWFHPermission,
  WFHPermissionRecord,
} from '../../services/wfh';
import { getAuthHeaders } from '../../services/auth';
import { useAppTheme } from '@/context/ThemeContext';

type Level = 'global' | 'employee' | 'team' | 'department';

interface Employee {
  _id: string;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
}

interface Team {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
}

export default function WFHPermissionsScreen() {
  const { colors } = useAppTheme();
  const [permissions, setPermissions] = useState<WFHPermissionRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level>('global');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [notes, setNotes] = useState('');
  const [granting, setGranting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'revoked'>('all');

  const loadPermissions = async () => {
    try {
      const response = await fetchWFHPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load WFH permissions.');
    }
  };

  const loadReferences = async () => {
    try {
      const headers = await getAuthHeaders();

      const [empRes, teamRes, deptRes] = await Promise.all([
        fetch(`${ADMIN_API_URL}/admin-dashboard/staff-directory`, { headers }),
        fetch(`${ADMIN_API_URL}/admin-dashboard/teams`, { headers }),
        fetch(`${ADMIN_API_URL}/admin-dashboard/departments`, { headers }),
      ]);

      if (empRes.ok) {
        const empJson = await empRes.json();
        setEmployees(empJson.data || []);
      }
      if (teamRes.ok) {
        const teamJson = await teamRes.json();
        setTeams(teamJson.data || []);
      }
      if (deptRes.ok) {
        const deptJson = await deptRes.json();
        setDepartments(deptJson.data || []);
      }
    } catch (error) {
      console.log('Failed to load reference data:', error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([loadPermissions(), loadReferences()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, []);

  const handleGrant = async () => {
    if (selectedLevel === 'employee' && !selectedEmployeeId) {
      Alert.alert('Validation', 'Please select an employee.');
      return;
    }
    if (selectedLevel === 'team' && !selectedTeamId) {
      Alert.alert('Validation', 'Please select a team.');
      return;
    }
    if (selectedLevel === 'department' && !selectedDepartmentId) {
      Alert.alert('Validation', 'Please select a department.');
      return;
    }

    setGranting(true);
    try {
      await grantWFHPermission({
        level: selectedLevel,
        employeeId: selectedLevel === 'employee' ? selectedEmployeeId : undefined,
        teamId: selectedLevel === 'team' ? selectedTeamId : undefined,
        departmentId: selectedLevel === 'department' ? selectedDepartmentId : undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', `WFH permission granted at ${selectedLevel} level.`);
      setGrantModalVisible(false);
      resetGrantForm();
      loadPermissions();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to grant permission.');
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = (permission: WFHPermissionRecord) => {
    Alert.alert(
      'Revoke Permission',
      `Are you sure you want to revoke this ${permission.level} WFH permission?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeWFHPermission(permission.id);
              Alert.alert('Success', 'Permission revoked.');
              loadPermissions();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to revoke permission.');
            }
          },
        },
      ]
    );
  };

  const resetGrantForm = () => {
    setSelectedLevel('global');
    setSelectedEmployeeId('');
    setSelectedTeamId('');
    setSelectedDepartmentId('');
    setNotes('');
  };

  const filteredPermissions = permissions.filter((p) => {
    if (filter === 'active') return p.isActive;
    if (filter === 'revoked') return !p.isActive;
    return true;
  });

  const activeCount = permissions.filter((p) => p.isActive).length;
  const revokedCount = permissions.filter((p) => !p.isActive).length;

  const getTargetLabel = (p: WFHPermissionRecord) => {
    if (p.level === 'global') return 'All Employees';
    if (p.level === 'employee') return p.employee?.name || 'Unknown Employee';
    if (p.level === 'team') return p.team?.name || 'Unknown Team';
    if (p.level === 'department') return p.department?.name || 'Unknown Department';
    return 'Unknown';
  };

  const getLevelIcon = (level: Level) => {
    switch (level) {
      case 'global': return 'globe-outline';
      case 'employee': return 'person-outline';
      case 'team': return 'people-outline';
      case 'department': return 'business-outline';
    }
  };

  const getLevelColor = (level: Level) => {
    switch (level) {
      case 'global': return '#8b5cf6';
      case 'employee': return '#3b82f6';
      case 'team': return '#10b981';
      case 'department': return '#f59e0b';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="WFH Permissions" showBack={true} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading permissions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="WFH Permissions" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{permissions.length}</Text>
            <Text style={styles.summaryLab}>Total</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#10b981' }]}>{activeCount}</Text>
            <Text style={styles.summaryLab}>Active</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#ef4444' }]}>{revokedCount}</Text>
            <Text style={styles.summaryLab}>Revoked</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['all', 'active', 'revoked'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grant Button */}
        <TouchableOpacity style={styles.grantButton} onPress={() => setGrantModalVisible(true)}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.grantButtonText}>Grant WFH Permission</Text>
        </TouchableOpacity>

        {/* Permissions List */}
        <Text style={styles.sectionTitle}>Permission Records</Text>

        {filteredPermissions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="shield-checkmark-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No permissions found</Text>
            <Text style={styles.emptySub}>Grant WFH access to employees, teams, or departments.</Text>
          </View>
        ) : (
          filteredPermissions.map((p, idx) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(idx * 80).springify()} style={styles.permissionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor(p.level)}15` }]}>
                  <Ionicons name={getLevelIcon(p.level)} size={14} color={getLevelColor(p.level)} />
                  <Text style={[styles.levelBadgeText, { color: getLevelColor(p.level) }]}>
                    {p.level.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: p.isActive ? '#f0fdf4' : '#fef2f2' }]}>
                  <Text style={[styles.statusBadgeText, { color: p.isActive ? '#10b981' : '#ef4444' }]}>
                    {p.isActive ? 'ACTIVE' : 'REVOKED'}
                  </Text>
                </View>
              </View>

              <Text style={styles.targetLabel}>{getTargetLabel(p)}</Text>

              {p.level === 'employee' && p.employee?.employeeId && (
                <Text style={styles.targetMeta}>ID: {p.employee.employeeId}</Text>
              )}

              <View style={styles.cardFooter}>
                <Text style={styles.cardMeta}>
                  By {p.grantedBy?.name || 'Admin'} • {new Date(p.grantedAt).toLocaleDateString()}
                </Text>
                {p.isActive && (
                  <TouchableOpacity style={styles.revokeBtn} onPress={() => handleRevoke(p)}>
                    <Text style={styles.revokeBtnText}>Revoke</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Grant Modal */}
      <Modal visible={grantModalVisible} animationType="slide" transparent onRequestClose={() => setGrantModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Grant WFH Permission</Text>
              <TouchableOpacity onPress={() => { setGrantModalVisible(false); resetGrantForm(); }}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Level Selector */}
              <Text style={styles.inputLabel}>Access Level</Text>
              <View style={styles.levelSelector}>
                {(['global', 'employee', 'team', 'department'] as Level[]).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.levelOption, selectedLevel === lvl && styles.levelOptionActive]}
                    onPress={() => setSelectedLevel(lvl)}
                  >
                    <Ionicons
                      name={getLevelIcon(lvl)}
                      size={16}
                      color={selectedLevel === lvl ? '#fff' : '#64748b'}
                    />
                    <Text style={[styles.levelOptionText, selectedLevel === lvl && styles.levelOptionTextActive]}>
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Employee Selector */}
              {selectedLevel === 'employee' && (
                <>
                  <Text style={styles.inputLabel}>Select Employee</Text>
                  <ScrollView style={styles.selectorList} nestedScrollEnabled>
                    {employees.map((emp) => (
                      <TouchableOpacity
                        key={emp.id}
                        style={[styles.selectorItem, selectedEmployeeId === emp.id && styles.selectorItemActive]}
                        onPress={() => setSelectedEmployeeId(emp.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.selectorItemText}>{emp.staffName}</Text>
                          <Text style={styles.selectorItemSub}>{emp.contactInfo?.email || emp.employeeId || '—'}</Text>
                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                            {emp.staffDepartment && (
                              <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '700' }}>{emp.staffDepartment}</Text>
                              </View>
                            )}
                            {emp.staffJobRole && (
                              <View style={{ backgroundColor: '#f5f3ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, color: '#8b5cf6', fontWeight: '700' }}>{emp.staffJobRole}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                        {selectedEmployeeId === emp.id && (
                          <Ionicons name="checkmark-circle" size={18} color="#8b5cf6" style={styles.selectorCheck} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Team Selector */}
              {selectedLevel === 'team' && (
                <>
                  <Text style={styles.inputLabel}>Select Team</Text>
                  <ScrollView style={styles.selectorList} nestedScrollEnabled>
                    {teams.map((t) => (
                      <TouchableOpacity
                        key={t._id}
                        style={[styles.selectorItem, selectedTeamId === t._id && styles.selectorItemActive]}
                        onPress={() => setSelectedTeamId(t._id)}
                      >
                        <Text style={styles.selectorItemText}>{t.name}</Text>
                        {selectedTeamId === t._id && (
                          <Ionicons name="checkmark-circle" size={18} color="#8b5cf6" style={styles.selectorCheck} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Department Selector */}
              {selectedLevel === 'department' && (
                <>
                  <Text style={styles.inputLabel}>Select Department</Text>
                  <ScrollView style={styles.selectorList} nestedScrollEnabled>
                    {departments.map((d) => (
                      <TouchableOpacity
                        key={d._id}
                        style={[styles.selectorItem, selectedDepartmentId === d._id && styles.selectorItemActive]}
                        onPress={() => setSelectedDepartmentId(d._id)}
                      >
                        <Text style={styles.selectorItemText}>{d.name}</Text>
                        {selectedDepartmentId === d._id && (
                          <Ionicons name="checkmark-circle" size={18} color="#8b5cf6" style={styles.selectorCheck} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Notes */}
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add a note..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.confirmButton, granting && styles.confirmButtonDisabled]}
                onPress={handleGrant}
                disabled={granting}
              >
                {granting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Grant Permission</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b', fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 4 },
  summaryLab: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { width: 1, backgroundColor: '#e2e8f0' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterTab: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterTabActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  filterTabText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  filterTabTextActive: { color: '#fff' },
  grantButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  grantButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 16, marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 40 },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  levelBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  targetLabel: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  targetMeta: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  cardMeta: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  revokeBtn: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#fee2e2' },
  revokeBtnText: { color: '#ef4444', fontSize: 11, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  inputLabel: { fontSize: 13, fontWeight: '800', color: '#1e293b', marginBottom: 10, marginTop: 8 },
  levelSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  levelOptionActive: { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' },
  levelOptionText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  levelOptionTextActive: { color: '#fff' },
  selectorList: { maxHeight: 200, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', padding: 4 },
  selectorItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorItemActive: { backgroundColor: '#f5f3ff', borderWidth: 1, borderColor: '#ddd6fe' },
  selectorItemText: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  selectorItemSub: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  selectorCheck: { marginLeft: 8 },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    fontSize: 14,
    color: '#1e293b',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  confirmButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
