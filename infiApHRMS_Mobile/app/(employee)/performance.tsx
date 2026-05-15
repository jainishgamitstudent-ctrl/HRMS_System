import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  FadeInDown,
  FadeInRight,
  withSpring,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { useUser } from '../../context/UserContext';
import { resolveImageSource } from '../../utils/image';
import { fetchEmployeePerformance, fetchPerformanceTrends, PerformanceData, PerformanceTrendItem } from '../../services/performance';

import { useAppTheme } from '@/context/ThemeContext';
const { width } = Dimensions.get('window');

// Components
const CountUpScore = ({ target }: { target: number }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 2000;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const current = progress * target;
      setDisplayScore(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [target]);

  return (
    <Text style={styles.scoreNumber}>{displayScore.toFixed(1)}<Text style={styles.scoreTotal}>/5.0</Text></Text>
  );
};

const CircularProgress = ({ value, color, label }: { value: number; color: string; label: string }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withDelay(800, withTiming(value * 360, { duration: 1500 }));
  }, [value]);

  // High-fidelity fallback for circular progress without react-native-svg
  return (
    <View style={styles.kpiItem}>
      <View style={[styles.kpiCircle, { borderColor: '#f1f5f9' }]}>
        <View style={[styles.kpiInternal, { backgroundColor: `${color}10` }]}>
          <Text style={[styles.kpiValueText, { color }]}>{Math.round(value * 100)}%</Text>
        </View>
        {/* Animated Overlay Piece - Simplified for demonstration */}
        <View style={[styles.kpiProgressOverlay, { borderTopColor: color, borderRightColor: color, transform: [{ rotate: '-45deg' }] }]} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
};

const PerformanceBar = ({ item, index }: any) => {
  const heightValue = useSharedValue(0);

  useEffect(() => {
    heightValue.value = withDelay(index * 100 + 1000, withTiming(item.score * 20, { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
  }));

  return (
    <View style={styles.barContainer}>
      <Animated.View 
        style={[
          styles.bar, 
          item.active ? styles.activeBar : styles.inactiveBar,
          animatedStyle
        ]} 
      />
      <Text style={[styles.barLabel, item.active && styles.activeBarLabel]}>{item.month}</Text>
    </View>
  );
};

export default function PerformanceDashboard() {
  const { colors } = useAppTheme();
  const { user } = useUser();
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [trends, setTrends] = useState<PerformanceTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [perfRes, trendRes] = await Promise.all([
        fetchEmployeePerformance(),
        fetchPerformanceTrends().catch(() => ({ success: true, data: [] })),
      ]);
      setPerformance(perfRes.data);
      setTrends(trendRes.data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load performance data');
      console.warn('[Performance] Load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build trend bars from API data; fallback to mock if empty
  const trendData: { month: string; score: number; active?: boolean }[] = React.useMemo(() => {
    if (trends.length > 0) {
      return trends.map((t, i) => ({
        month: t.month.slice(0, 3).toUpperCase(),
        score: Math.min(Math.max(parseFloat(t.avgScore as any) / 20, 0), 5),
        active: i === trends.length - 1,
      }));
    }
    return [
      { month: 'MAY', score: 4.2 },
      { month: 'JUN', score: 4.4 },
      { month: 'JUL', score: 4.3 },
      { month: 'AUG', score: 4.6 },
      { month: 'SEP', score: 4.5 },
      { month: 'OCT', score: 4.8, active: true },
    ];
  }, [trends]);

  // Build KPIs from real data
  const kpis = React.useMemo(() => {
    if (!performance) return [];
    return [
      { label: 'Efficiency', value: (performance.coreMetrics.efficiency || 0) / 100, color: '#4f46e5' },
      { label: 'Quality', value: (performance.coreMetrics.quality || 0) / 100, color: '#10b981' },
      { label: 'Reliability', value: (performance.coreMetrics.reliability || 0) / 100, color: '#f59e0b' },
    ];
  }, [performance]);

  // Compute stars from monthlyScore (0-100 mapped to 1-5)
  const starCount = React.useMemo(() => {
    if (!performance) return 5;
    return Math.min(5, Math.max(1, Math.round((performance.monthlyScore || 0) / 20)));
  }, [performance]);

  const avatarSource = resolveImageSource(user.avatar);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Header title="Performance" showBack={true} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Loading performance data...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Section */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.profileCard}>
           <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={avatarSource} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                />
                <View style={styles.statusDot} />
              </View>
              <View style={styles.profileInfo}>
                 <Text style={styles.empName}>{user.name || 'Employee'}</Text>
                 <Text style={styles.empRole}>{user.role || 'Employee'}</Text>
                 <View style={styles.teamTag}>
                    <Text style={styles.teamText}>{user.department || 'General'} • ID: {user.employeeId || 'N/A'}</Text>
                 </View>
              </View>
           </View>
        </Animated.View>

        {/* Score Section */}
        <View style={styles.row}>
           <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.scoreCard}>
              <Text style={styles.cardLabel}>Monthly Score</Text>
              <CountUpScore target={performance ? performance.monthlyScore / 20 : 0} />
              <View style={styles.improvementRow}>
                 <Ionicons name="trending-up" size={16} color="#10b981" />
                 <Text style={styles.improvementText}>{performance?.month || 'Current Month'}</Text>
              </View>
           </Animated.View>

           <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.statsCard}>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => router.push('/(employee)/performance-history')}
              >
                <Text style={[styles.cardLabel, styles.statsCard_label]}>Project Rating</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.statValue}>{performance ? (performance.monthlyScore >= 85 ? 'Excellent' : performance.monthlyScore >= 70 ? 'Good' : 'Average') : 'N/A'}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
                <View style={styles.starsRow}>
                  {[1,2,3,4,5].map(s => (
                    <Ionicons key={s} name={s <= starCount ? "star" : "star-outline"} size={14} color="#f59e0b" />
                  ))}
                </View>
              </TouchableOpacity>
           </Animated.View>
        </View>

        {/* trend Section */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.sectionCard}>
           <Text style={styles.sectionTitle}>Performance Trend</Text>
           <View style={styles.chartArea}>
              {trendData.map((item, index) => (
                <PerformanceBar key={item.month} item={item} index={index} />
              ))}
           </View>
        </Animated.View>

        {/* KPIs Row */}
        <View style={styles.kpiRow}>
           {kpis.map((kpi, index) => (
             <Animated.View key={kpi.label} entering={FadeInDown.delay(500 + index * 100).springify()}>
                <CircularProgress {...kpi} />
             </Animated.View>
           ))}
        </View>

        {/* Goal Tracker */}
        <View style={styles.sectionHeaderRow}>
           <Text style={styles.sectionTitle}>Active Goals</Text>
           <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.goalsList}>
           {(performance?.goalsTracking || []).map((goal, index) => (
             <Animated.View 
               key={String(goal.id)} 
               entering={FadeInRight.delay(700 + index * 100).springify()}
               style={styles.goalCard}
             >
                <View style={styles.goalHeader}>
                   <Text style={styles.goalTitle}>{goal.title}</Text>
                   <View style={[styles.statusBadge, { backgroundColor: goal.status === 'Completed' ? '#ecfdf5' : '#fff7ed' }]}>
                      <Text style={[styles.statusText, { color: goal.status === 'Completed' ? '#059669' : '#f97316' }]}>{goal.status}</Text>
                   </View>
                </View>
                <View style={styles.progressContainer}>
                   <View style={styles.progressBarBg}>
                      <Animated.View 
                         entering={FadeInRight.delay(1000 + index * 100).duration(1000)}
                         style={[styles.progressBarFill, { width: `${Math.min(goal.progress, 100)}%`, backgroundColor: goal.status === 'Completed' ? '#10b981' : '#4f46e5' }]} 
                      />
                   </View>
                   <Text style={styles.progressText}>{Math.round(goal.progress)}%</Text>
                </View>
             </Animated.View>
           ))}
        </View>

        {/* Achievements */}
        {performance && (performance.achievements || []).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
               {(performance.achievements || []).map((ach, i) => (
                 <Animated.View 
                   key={ach.title + i} 
                   entering={FadeInRight.delay(1200 + i * 100).springify()}
                   style={styles.badgeCard}
                 >
                    <View style={[styles.badgeIconBox, { backgroundColor: '#f59e0b15' }]}>
                       <Ionicons name="trophy" size={24} color="#f59e0b" />
                    </View>
                    <Text style={styles.badgeTitle}>{ach.title}</Text>
                 </Animated.View>
               ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      )}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4f46e5',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  empRole: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  teamTag: {
    marginTop: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  teamText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  scoreCard: {
    flex: 1.5,
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  statsCard_label: {
     color: '#64748b',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
  },
  scoreTotal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  improvementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  improvementText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '800',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 12,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  inactiveBar: {
    backgroundColor: '#f1f5f9',
  },
  activeBar: {
    backgroundColor: '#4f46e5',
  },
  barLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '800',
  },
  activeBarLabel: {
    color: '#4f46e5',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  kpiItem: {
    alignItems: 'center',
    gap: 10,
  },
  kpiCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  kpiInternal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValueText: {
    fontSize: 16,
    fontWeight: '900',
  },
  kpiProgressOverlay: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4f46e5',
    fontWeight: '700',
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    width: 35,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  badgeScroll: {
    paddingRight: 20,
    gap: 12,
    marginTop: 10,
  },
  badgeCard: {
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  badgeIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
});
