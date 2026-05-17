import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useAppTheme } from '@/context/ThemeContext';

export default function HRDashboard() {
  const { user } = useUser();
  const { colors } = useAppTheme();
  const styles = useMemo(() => HRDashboardStyles(colors), [colors]);

  const menuItems = [
    { label: 'Employee Directory', icon: 'people-outline', route: '/(employee)/directory' },
    { label: 'Double Shift Permissions', icon: 'moon-outline', route: '/(hr)/double-shift-permissions' },
    { label: 'Double Shift Requests', icon: 'mail-unread-outline', route: '/(hr)/double-shift-requests' },
    { label: 'Leave Approvals', icon: 'checkmark-circle-outline', route: '/(employee)/leave-approvals' },
    { label: 'Attendance Records', icon: 'time-outline', route: '/(employee)/attendance-history' },
    { label: 'My Profile', icon: 'person-outline', route: '/(employee)/profile' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>HR Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user.name}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.8}
          >
            <Ionicons name={item.icon as any} size={24} color={colors.primary} />
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function HRDashboardStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 4,
  },
  menu: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
}
