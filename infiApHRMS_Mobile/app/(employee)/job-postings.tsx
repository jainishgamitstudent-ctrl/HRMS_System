import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import Header from '../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchJobs, type JobItem } from '../../services/auth';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function JobPostingsPage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => JobPostingsStyles(colors), [colors]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetchJobs();
      const data = response.data || [];
      // Only show Open jobs to employees
      const openJobs = data.filter((j: JobItem) => j.status === 'Open');
      setJobs(openJobs);
    } catch (error) {
      Alert.alert('Error', 'Unable to load job postings right now.');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed';
    const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    return min ? fmt(min) : fmt(max!);
  };

  return (
    <View style={styles.container}>
      <Header title="Job Postings" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading open positions...</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="briefcase-outline" size={48} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>No Open Positions</Text>
            <Text style={styles.emptySub}>
              There are no active job openings at the moment. Check back later!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>{jobs.length}</Text>
              <Text style={styles.statsLabel}>Open Positions</Text>
            </View>

            {jobs.map((job, index) => (
              <Animated.View
                key={job._id}
                entering={FadeInDown.delay(index * 80).springify()}
              >
                <TouchableOpacity
                  style={styles.jobCard}
                  activeOpacity={0.9}
                  onPress={() => {
                    // Navigate to job detail (or show alert with details)
                    Alert.alert(
                      job.title,
                      `${job.department} • ${job.type}\n\n${job.description || 'No description provided.'}\n\nExperience: ${job.experienceYears || 0}+ years\nSalary: ${formatSalary(job.salaryRange?.min, job.salaryRange?.max)}\n\nApply by contacting HR.`,
                      [{ text: 'Got it', style: 'default' }]
                    );
                  }}
                >
                  <View style={styles.jobHeader}>
                    <View style={[styles.jobIconWrap, { backgroundColor: '#ecfdf5' }]}>
                      <Ionicons name="briefcase" size={20} color="#10b981" />
                    </View>
                    <View style={styles.jobMeta}>
                      <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                      <Text style={styles.jobDepartment}>{job.department}</Text>
                    </View>
                    <View style={styles.openBadge}>
                      <Text style={styles.openBadgeText}>Open</Text>
                    </View>
                  </View>

                  <View style={styles.jobDetailsRow}>
                    <View style={styles.detailPill}>
                      <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.detailPillText}>{job.type}</Text>
                    </View>
                    {job.location && (
                      <View style={styles.detailPill}>
                        <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                        <Text style={styles.detailPillText}>{job.location}</Text>
                      </View>
                    )}
                    <View style={styles.detailPill}>
                      <Ionicons name="trophy-outline" size={12} color={colors.textMuted} />
                      <Text style={styles.detailPillText}>{job.experienceYears || 0}+ yrs</Text>
                    </View>
                  </View>

                  <View style={styles.jobFooter}>
                    <Text style={styles.salaryText}>
                      {formatSalary(job.salaryRange?.min, job.salaryRange?.max)}
                    </Text>
                    <Text style={styles.postedText}>
                      {job.createdAt
                        ? `Posted ${new Date(job.createdAt).toLocaleDateString()}`
                        : 'Recently posted'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

function JobPostingsStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 20,
      paddingBottom: 100,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      paddingHorizontal: 24,
      lineHeight: 20,
    },
    statsCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      alignItems: 'center',
    },
    statsNumber: {
      fontSize: 32,
      fontWeight: '800',
      color: '#fff',
    },
    statsLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 4,
    },
    jobCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    jobHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    jobIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    jobMeta: {
      flex: 1,
    },
    jobTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    jobDepartment: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    openBadge: {
      backgroundColor: '#dcfce7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    openBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#15803d',
    },
    jobDetailsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    detailPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      gap: 4,
    },
    detailPillText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    jobFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      paddingTop: 10,
    },
    salaryText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    postedText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
  });
}
