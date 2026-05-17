import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import Header from '../../components/layout/Header';
import { BottomNav } from '../../components/BottomNav';
import {
  fetchEmployeesForDoubleShift,
  updateEmployeeDoubleShiftPermission,
  EmployeeWithDoubleShift,
} from '../../services/doubleShift';
import { useAppTheme } from '@/context/ThemeContext';

export default function DoubleShiftPermissionsScreen() {
  const { colors } = useAppTheme();
  const [employees, setEmployees] = useState<EmployeeWithDoubleShift[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const loadEmployees = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetchEmployeesForDoubleShift(1, 100);
      if (response.success && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else {
        setEmployees([]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load employees.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEmployees(false);
  }, []);

  const handleToggle = async (employee: EmployeeWithDoubleShift) => {
    const nextValue = !employee.doubleShiftAllowed;
    setTogglingIds((prev) => new Set(prev).add(employee._id));
    try {
      const response = await updateEmployeeDoubleShiftPermission(employee._id, nextValue);
      if (response.success) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp._id === employee._id ? { ...emp, doubleShiftAllowed: nextValue } : emp
          )
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update permission.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update permission.');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(employee._id);
        return next;
      });
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (emp.employeeId || '').toLowerCase().includes(query) ||
      (emp.department || '').toLowerCase().includes(query)
    );
  });

  const styles = useMemo(() => DoubleShiftPermissionsStyles(colors), [colors]);

  const allowedCount = employees.filter((e) => e.doubleShiftAllowed).length;

  return (
    <View style={styles.container}>
      <Header title="Double Shift Permissions" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{employees.length}</Text>
            <Text style={styles.summaryLab}>Total</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#4f46e5' }]}>{allowedCount}</Text>
            <Text style={styles.summaryLab}>Allowed</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: '#94a3b8' }]}>
              {employees.length - allowedCount}
            </Text>
            <Text style={styles.summaryLab}>Not Allowed</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, ID or department..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>Employees</Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredEmployees.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={64} color="#e2e8f0" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No employees match your search.' : 'No employees found.'}
            </Text>
          </View>
        ) : (
          filteredEmployees.map((emp, idx) => (
            <Animated.View
              key={emp._id}
              entering={FadeInDown.delay(idx * 40).springify()}
              style={styles.employeeCard}
            >
              <View style={styles.employeeHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{emp.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{emp.name}</Text>
                  <Text style={styles.role}>
                    {emp.designation || 'Employee'}
                    {emp.department ? ` · ${emp.department}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detail}>
                  <Ionicons name="mail-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.detailText}>{emp.email}</Text>
                </View>
                {emp.employeeId && (
                  <View style={styles.detail}>
                    <Ionicons name="id-card-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.detailText}>{emp.employeeId}</Text>
                  </View>
                )}
              </View>

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelWrap}>
                  <Ionicons
                    name={emp.doubleShiftAllowed ? 'moon' : 'moon-outline'}
                    size={16}
                    color={emp.doubleShiftAllowed ? '#4f46e5' : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.toggleLabel,
                      emp.doubleShiftAllowed && styles.toggleLabelActive,
                    ]}
                  >
                    {emp.doubleShiftAllowed ? 'Double Shift Enabled' : 'Double Shift Disabled'}
                  </Text>
                </View>
                {togglingIds.has(emp._id) ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <TouchableOpacity
                    style={[styles.toggle, emp.doubleShiftAllowed && styles.toggleActive]}
                    onPress={() => handleToggle(emp)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.knob, emp.doubleShiftAllowed && styles.knobActive]} />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function DoubleShiftPermissionsStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 120,
    },
    summaryCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginTop: 16,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryItem: {
      flex: 1,
      alignItems: 'center',
    },
    summaryVal: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    summaryLab: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      marginTop: 4,
    },
    divider: {
      width: 1,
      backgroundColor: colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingHorizontal: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 44,
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textSecondary,
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    employeeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    employeeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    role: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
      marginTop: 2,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 12,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: 12,
    },
    toggleLabelWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    toggleLabelActive: {
      color: '#4f46e5',
    },
    toggle: {
      width: 48,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#e2e8f0',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    toggleActive: {
      backgroundColor: '#4f46e5',
    },
    knob: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    knobActive: {
      transform: [{ translateX: 20 }],
    },
    empty: {
      alignItems: 'center',
      marginTop: 60,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: 12,
    },
  });
}
