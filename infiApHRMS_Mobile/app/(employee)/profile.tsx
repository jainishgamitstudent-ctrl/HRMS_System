import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useUser } from '../../context/UserContext';
import Header from '../../components/layout/Header';
import { resolveImageSource } from '@/utils/image';

import { useAppTheme } from '@/context/ThemeContext';
const activityFeed = [
  { title: 'Address details updated', date: 'Oct 12, 2023 • 11:45 AM', completed: true },
  { title: 'Emergency contact added', date: 'Sep 05, 2023 • 09:20 AM', completed: false },
];

const InfoRow = ({
  label,
  value,
  fullWidth,
  singleLine = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
  singleLine?: boolean;
}) => (
  <View style={[styles.infoItem, fullWidth && styles.infoItemFull]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text
      style={styles.infoValue}
      numberOfLines={singleLine ? 1 : undefined}
      ellipsizeMode={singleLine ? 'tail' : undefined}
    >
      {value || 'Not added yet'}
    </Text>
  </View>
);

export default function PersonalProfilePage() {
  const { colors } = useAppTheme();
  const { user } = useUser();

  return (
    <View style={styles.root}>
      <Header title="My Profile" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.identityWrap}>
              <View style={styles.avatarWrap}>
                <Image source={resolveImageSource(user.avatar)} style={styles.avatar} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileRole}>{user.role || 'Employee'}</Text>
                <View style={styles.profileMetaRow}>
                  <Ionicons name="business-outline" size={12} color="#007AFF" />
                  <Text style={styles.metaText} numberOfLines={1}>{user.department || 'Team'}</Text>
                  <View style={styles.metaDot} />
                  <Ionicons name="card-outline" size={12} color="#007AFF" />
                  <Text style={styles.metaText} numberOfLines={1}>{user.employeeId || 'Employee'}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/(employee)/edit-profile')}
              activeOpacity={0.85}
            >
              <Ionicons name="create-outline" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-outline" size={16} color="#007AFF" />
            <Text style={styles.sectionHeaderTitle}>Personal Information</Text>
          </View>

          <View style={styles.infoGrid}>
            <InfoRow label="Full Name" value={user.name} />
            <InfoRow label="Joining Date" value={user.joiningDate} />
            <InfoRow label="Phone" value={user.phone || ''} />
            <InfoRow label="Email" value={user.email} fullWidth singleLine />
            <InfoRow label="Address" value={user.address || ''} fullWidth />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="briefcase-outline" size={16} color="#007AFF" />
            <Text style={styles.sectionHeaderTitle}>Professional Information</Text>
          </View>

          <View style={styles.infoGrid}>
            <InfoRow label="Department" value={user.department || ''} />
            <InfoRow label="Role" value={user.role || ''} />
            <InfoRow label="Employee ID" value={user.employeeId || ''} />
            <InfoRow label="System Role" value={user.systemRole} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="time-outline" size={16} color="#007AFF" />
            <Text style={styles.sectionHeaderTitle}>Profile Activity</Text>
          </View>

          <View style={styles.feedList}>
            {activityFeed.map((feed, idx) => (
              <View key={idx} style={styles.feedItem}>
                <View style={styles.feedTimeline}>
                  <View style={[styles.feedDot, feed.completed && styles.feedDotActive]} />
                  {idx < activityFeed.length - 1 ? <View style={styles.feedLine} /> : null}
                </View>
                <View style={styles.feedContent}>
                  <Text style={styles.feedTitle}>{feed.title}</Text>
                  <Text style={styles.feedDate}>{feed.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
  },
  topCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6e9ee',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  identityWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '500',
    color: '#667085',
    marginTop: 1,
    marginBottom: 6,
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'nowrap',
  },
  metaText: {
    fontSize: 11,
    color: '#667085',
    fontWeight: '500',
    maxWidth: '38%',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c7ced8',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#cfe2ff',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6e9ee',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    width: '48%',
    minHeight: 66,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#f8f9fb',
  },
  infoItemFull: {
    width: '100%',
    minHeight: 0,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#98a2b3',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  feedList: {
    gap: 10,
  },
  feedItem: {
    flexDirection: 'row',
    gap: 10,
  },
  feedTimeline: {
    alignItems: 'center',
    width: 18,
  },
  feedDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#cbd5e1',
  },
  feedDotActive: {
    backgroundColor: '#007AFF',
  },
  feedLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    backgroundColor: '#e2e8f0',
  },
  feedContent: {
    flex: 1,
    paddingBottom: 8,
  },
  feedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  feedDate: {
    fontSize: 11,
    color: '#98a2b3',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 96,
  },
});
