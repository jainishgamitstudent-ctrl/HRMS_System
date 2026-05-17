import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Header from '../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function LeaveManagement() {
  const { colors } = useAppTheme();

  const styles = useMemo(() => StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    heroSection: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    heroIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: colors.primaryBg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.heroBorder,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
    },
    heroSubtitle: {
      fontSize: 16,
      color: colors.textMuted,
      fontWeight: '500',
    },
    menuContainer: {
      gap: 16,
    },
    menuCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.borderLight,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBox: {
      width: 45,
      height: 45,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    cardInfo: {
      justifyContent: 'center',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
    },
  }), [colors]);

  const menuItems = [
    {
      id: 'apply',
      title: 'Apply Leave',
      subtitle: 'Submit leave request',
      icon: 'calendar-outline',
      color: colors.primary,
      route: '/(employee)/apply-leave',
    },
    {
      id: 'my-leaves',
      title: 'My Leave Applications',
      subtitle: 'View all your leaves',
      icon: 'document-text-outline',
      color: colors.primary,
      route: '/(employee)/my-leaves',
    },
    {
      id: 'approvals',
      title: 'Leaves Tracking',
      subtitle: 'Approve/reject leaves',
      icon: 'checkmark-circle-outline',
      color: colors.primary,
      route: '/(employee)/leave-approvals',
    },
  ];

  return (
    <View style={styles.root}>
      <Header
        title="Leave Management"
        showBack={true}
      />

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="calendar" size={40} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Leave Management</Text>
          <Text style={styles.heroSubtitle}>Manage time off • 3 features</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              activeOpacity={0.7}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}10` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <BottomNav />
    </View>
  );
}
