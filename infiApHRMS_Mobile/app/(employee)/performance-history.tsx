import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';
import { useAppTheme } from '@/context/ThemeContext';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  Layout,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const HISTORY_DATA = [
  { 
    year: '2025', 
    rating: '4.8', 
    label: 'Outstanding', 
    color: '#4f46e5',
    feedback: 'Consistently exceeded expectations in Q3 and Q4. Led the migration to the new architecture with zero downtime.',
    milestones: ['Promoted to Senior SE', 'Innovation Award Q4']
  },
  { 
    year: '2024', 
    rating: '4.5', 
    label: 'Exceeds Expectations', 
    color: '#10b981',
    feedback: 'Strong technical contribution to the core engine. Improved unit test coverage by 40%.',
    milestones: ['Quarterly Star Q2']
  },
  { 
    year: '2023', 
    rating: '4.2', 
    label: 'Fully Meets', 
    color: '#6366f1',
    feedback: 'Quick learner and great team player. Successfully integrated into the product team.',
    milestones: ['Completed Onboarding']
  },
];

const TimelineCard = ({ data, index }: { data: typeof HISTORY_DATA[0], index: number }) => {
  const { colors } = useAppTheme();
  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 200).springify()}
      style={styles.timelineItem}
    >
      {/* Left indicator */}
      <View style={styles.timelineLeft}>
        <View style={[styles.yearBadge, { backgroundColor: data.color }]}>
          <Text style={styles.yearText}>{data.year}</Text>
        </View>
        {index !== HISTORY_DATA.length - 1 && <View style={styles.timelineLine} />}
      </View>

      {/* Content card */}
      <View style={styles.timelineContent}>
        <View style={styles.contentHeader}>
          <View>
            <Text style={styles.yearTitle}>Annual Review {data.year}</Text>
            <View style={[styles.ratingTag, { backgroundColor: `${data.color}15` }]}>
              <Text style={[styles.ratingTagText, { color: data.color }]}>{data.label}</Text>
            </View>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{data.rating}</Text>
            <Ionicons name="star" size={12} color="#f59e0b" />
          </View>
        </View>

        <Text style={styles.feedbackText}>{data.feedback}</Text>

        <View style={styles.milestoneRow}>
          {data.milestones.map((m, i) => (
            <View key={i} style={styles.milestoneBadge}>
              <Ionicons name="trophy-outline" size={10} color={colors.textMuted} />
              <Text style={styles.milestoneText}>{m}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default function PerformanceHistory() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Unified Header */}
      <Header 
        title="Performance History" 
        subtitle="Track your career growth & ratings"
        showBack={true} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Growth Stats */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.statsOverview}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Avg. Rating</Text>
            <Text style={styles.statValue}>4.5</Text>
            <View style={styles.trendRow}>
              <Ionicons name="trending-up" size={12} color="#10b981" />
              <Text style={styles.trendText}>+0.3 YOY</Text>
            </View>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Reviews</Text>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statSub}>Completed</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Awards</Text>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statSub}>Earned</Text>
          </View>
        </Animated.View>

        {/* Timeline Header */}
        <Text style={styles.sectionTitle}>Review Timeline</Text>
        
        {/* Timeline List */}
        <View style={styles.timelineList}>
          {HISTORY_DATA.map((item, index) => (
            <TimelineCard key={item.year} data={item} index={index} />
          ))}
        </View>

        {/* Career Milestones Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Key Milestones</Text>
        <View style={styles.milestoneGrid}>
          {[
            { title: 'Joined InfiAP', date: 'Jan 2023', icon: 'business-outline', color: '#3b82f6' },
            { title: 'Probation Clear', date: 'Apr 2023', icon: 'checkmark-circle-outline', color: '#10b981' },
            { title: 'Direct Promotion', date: 'Feb 2024', icon: 'trending-up-outline', color: '#8b5cf6' },
            { title: 'Innovation Lead', date: 'Sep 2025', icon: 'rocket-outline', color: '#f59e0b' },
          ].map((m, i) => (
            <Animated.View 
              key={i} 
              entering={FadeInRight.delay(800 + i * 100).springify()}
              style={styles.milestoneCard}
            >
              <View style={[styles.mIconBox, { backgroundColor: `${m.color}15` }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
              <View>
                <Text style={styles.mTitle}>{m.title}</Text>
                <Text style={styles.mDate}>{m.date}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  statsOverview: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
  },
  statSub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  vDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  trendText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  timelineList: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 60,
  },
  yearBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  yearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#f1f5f9',
    marginTop: -4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  yearTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  ratingTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  ratingTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 4,
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
  },
  feedbackText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  milestoneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  milestoneText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
  },
  milestoneGrid: {
    gap: 12,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  mIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  mDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
