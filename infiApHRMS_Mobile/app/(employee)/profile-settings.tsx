import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useUser } from '../../context/UserContext';
import Header from '../../components/layout/Header';
import { resolveImageSource } from '@/utils/image';
import { useAppTheme } from '@/context/ThemeContext';

export default function ProfileSettingsPage() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { user, updateSettings } = useUser();

  const styles = useMemo(() => StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    profileSummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      gap: 16,
    },
    miniAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: colors.border,
    },
    miniMeta: {
      flex: 1,
    },
    miniName: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
    },
    miniRole: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    editBtn: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    editBtnText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    section: {
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    sectionHeaderText: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.textSecondary,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    infoLabelText: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '600',
    },
    infoValueText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '700',
      flex: 1,
      textAlign: 'right',
      marginLeft: 16,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    itemContent: {
      flex: 1,
    },
    itemLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    itemValue: {
      fontSize: 12,
      color: colors.success,
      fontWeight: '600',
      marginTop: 2,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      marginTop: 32,
      marginBottom: 10,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.error,
    },
  }), [colors]);

  const renderSectionHeader = (icon: any, title: string) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const handleContactHR = () => {
    Alert.alert(
      'Contact HR',
      'Reach out to HR for any queries or assistance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call HR', onPress: () => Linking.openURL('tel:+919999999999') },
        {
          text: 'Email HR',
          onPress: () =>
            Linking.openURL('mailto:hr@infiap.com?subject=Employee%20Query&body=Hi%20HR%2C%0A%0A'),
        },
      ],
    );
  };

  const renderItem = (label: string, value?: string, hasArrow?: boolean, isSwitch?: boolean, switchValue?: boolean, onSwitchChange?: (v: boolean) => void, icon?: any, onPress?: () => void) => (
    <TouchableOpacity
      style={styles.itemRow}
      activeOpacity={0.7}
      disabled={isSwitch}
      onPress={onPress}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        {value && <Text style={styles.itemValue}>{value}</Text>}
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : hasArrow ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      ) : icon ? (
        <Ionicons name={icon} size={20} color={colors.textMuted} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <Header
        title="Settings"
        subtitle="App & Account Configuration"
        showBack={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Summary Card (Mini) */}
        <View style={styles.profileSummaryRow}>
          <Image source={resolveImageSource(user.avatar)} style={styles.miniAvatar} />
          <View style={styles.miniMeta}>
             <Text style={styles.miniName}>{user.name}</Text>
             <Text style={styles.miniRole}>{user.role}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push('/(employee)/edit-profile')}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          {renderSectionHeader('person-outline', 'Personal Info')}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelText}>Employee ID</Text>
            <Text style={styles.infoValueText}>{user.employeeId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelText}>Email</Text>
            <Text style={styles.infoValueText} numberOfLines={1}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabelText}>Department</Text>
            <Text style={styles.infoValueText}>{user.department}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabelText}>Joining Date</Text>
            <Text style={styles.infoValueText}>{user.joiningDate}</Text>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          {renderSectionHeader('settings-outline', 'App Settings')}
          {renderItem('Dark Mode', undefined, false, true, isDark, () => toggleTheme())}
          {renderItem('Language', user.settings.language, true)}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          {renderSectionHeader('notifications-outline', 'Notifications')}
          {renderItem('Push Notifications', undefined, false, true, user.settings.pushNotifications, (v) => updateSettings({ pushNotifications: v }))}
          {renderItem('Email Reports', undefined, false, true, user.settings.emailReports, (v) => updateSettings({ emailReports: v }))}
        </View>

        {/* Employment */}
        <View style={styles.section}>
          {renderSectionHeader('briefcase-outline', 'Employment')}
          {renderItem('Apply Resignation', 'Submit resignation request', true, false, false, undefined, undefined, () => router.push('/(employee)/apply-resignation'))}
          {renderItem('My Resignation Status', 'Track resignation status', true, false, false, undefined, undefined, () => router.push('/(employee)/my-resignation'))}
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          {renderSectionHeader('information-circle-outline', 'Support & Legal')}
          {renderItem('Contact HR', 'For any queries or assistance', false, false, false, undefined, 'mail-outline', handleContactHR)}
          {renderItem('Terms of Service', undefined, true, false, false, undefined, undefined, () => router.push('/(employee)/terms-of-service'))}
          {renderItem('Privacy Policy', undefined, true, false, false, undefined, undefined, () => router.push('/(employee)/privacy-policy'))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/(auth)/sign-in')}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
      <BottomNav />
    </View>
  );
}
