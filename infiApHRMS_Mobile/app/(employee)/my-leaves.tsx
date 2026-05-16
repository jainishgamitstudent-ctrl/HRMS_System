import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withRepeat,
  Easing,
  FadeInDown,
  LinearTransition // For smooth list layout changes
} from 'react-native-reanimated';
import { useLeave, LeaveRequest } from '../../context/LeaveContext';
import { BottomNav } from '../../components/BottomNav';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/layout/Header';

import { useAppTheme } from '@/context/ThemeContext';
const { width } = Dimensions.get('window');

const TABS = ['All', 'Pending', 'Approved', 'History', 'Drafts'];
const TAB_WIDTH = width / 5;

export default function MyLeavesPage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => MyLeavesStyles(colors), [colors]);
  const { leaves } = useLeave();
  const [activeTab, setActiveTab] = useState('All');
  const indicatorPosition = useSharedValue(0);

  // Animate tab indicator
  useEffect(() => {
    const tabIndex = TABS.indexOf(activeTab);
    indicatorPosition.value = withSpring(tabIndex * TAB_WIDTH, {
      damping: 20,
      stiffness: 150,
    });
  }, [activeTab]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  // Filter leaves based on active tab
  const filteredLeaves = leaves.filter((leave) => {
    if (activeTab === 'All') return leave.status !== 'DRAFT'; // Don't show drafts in 'All' to keep it clean, or show everything
    if (activeTab === 'Pending') return leave.status === 'PENDING';
    if (activeTab === 'Approved') return leave.status === 'APPROVED';
    if (activeTab === 'History') return leave.status === 'REJECTED' || leave.status === 'CANCELLED';
    if (activeTab === 'Drafts') return leave.status === 'DRAFT';
    return true;
  });

  // Removed bouncy badge animation - static styling instead
  const animatedBadgeStyle = useAnimatedStyle(() => ({
    // Static style - no animation
  }));

  // Helpers
  const formatDateRange = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const m1 = d1.toLocaleString('en-US', { month: 'short' });
    const m2 = d2.toLocaleString('en-US', { month: 'short' });
    const day1 = d1.getDate().toString().padStart(2, '0');
    const day2 = d2.getDate().toString().padStart(2, '0');
    const year = d1.getFullYear();

    if (start === end) {
      return `${m1} ${day1}, ${year}`;
    }
    return `${m1} ${day1} - ${m2} ${day2}, ${year}`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return { text: '#22c55e', bg: '#dcfce7' };
      case 'PENDING': return { text: '#ea580c', bg: '#ffedd5' };
      case 'REJECTED': return { text: '#ef4444', bg: '#fee2e2' };
      case 'DRAFT': return { text: '#64748b', bg: '#f1f5f9' };
      default: return { text: '#64748b', bg: '#f1f5f9' };
    }
  };

  const getIconForType = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('sick')) return 'medkit-outline';
    if (lowerType.includes('personal') || lowerType.includes('casual')) return 'briefcase-outline';
    if (lowerType.includes('wfh')) return 'home-outline';
    return 'calendar-outline';
  };

  return (
    <View style={styles.root}>
      <Header 
        title="Leave Requests" 
        showBack={true} 
        rightElement={
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => router.push('/(employee)/apply-leave')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Animated Indicator line */}
        <Animated.View style={[styles.indicatorContainer, animatedIndicatorStyle]}>
           <View style={styles.indicator} />
        </Animated.View>
      </View>

      {/* List */}
      <Animated.FlatList
        data={filteredLeaves}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        itemLayoutAnimation={LinearTransition.springify().damping(15)}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No leaves found in this category.</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const statusColors = getStatusColor(item.status);
          const iconName = getIconForType(item.type);

          return (
            <Animated.View 
              entering={FadeInDown.delay(index * 100).springify().damping(15)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                {/* Left side: Icon + Texts */}
                <View style={styles.cardLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name={iconName} size={28} color="#4f39f6" />
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.cardTitle}>{item.type}</Text>
                    <Text style={styles.cardDates}>{formatDateRange(item.startDate, item.endDate)}</Text>
                  </View>
                </View>

                {/* Right side: Badge */}
                <Animated.View style={[styles.badge, { backgroundColor: statusColors.bg }, animatedBadgeStyle]}>
                  <Text style={[styles.badgeText, { color: statusColors.text }]}>
                    {item.status}
                  </Text>
                </Animated.View>
              </View>

              {/* Divider (optional, but design implies visual separation) */}
              <View style={styles.divider} />

              <View style={styles.cardBottom}>
                <View style={styles.durationWrap}>
                  <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.durationText}>{item.days} day{item.days > 1 ? 's' : ''} total</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {item.status === 'PENDING' || item.status === 'DRAFT' ? (
                    <TouchableOpacity 
                      activeOpacity={0.6}
                      style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => router.push({ pathname: '/(employee)/edit-leave', params: { id: item.id } })}
                    >
                      <Ionicons name="pencil" size={14} color="#4f39f6" />
                      <Text style={[styles.viewDetailsText, { marginLeft: 4 }]}>Edit</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center', opacity: 0.5 }}>
                      <Ionicons name="pencil" size={14} color={colors.textMuted} />
                      <Text style={[styles.viewDetailsText, { color: colors.textMuted, marginLeft: 4 }]}>Edit</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    activeOpacity={0.6}
                    onPress={() => router.push({ pathname: '/(employee)/leave-details', params: { id: item.id } })}
                  >
                    <Text style={styles.viewDetailsText}>
                      {item.status === 'REJECTED' ? 'View Reason' : 'View Details'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />
      <BottomNav />
    </View>
  );
}

function MyLeavesStyles(colors: any) {
  return StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f39f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f39f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    position: 'relative',
    height: 48,
  },
  tab: {
    width: TAB_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#4f39f6',
    fontWeight: '700',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: TAB_WIDTH,
    alignItems: 'center',
    height: 3,
  },
  indicator: {
    width: 24, // Slightly narrower for 4 tabs
    height: 3,
    backgroundColor: '#4f39f6',
    borderRadius: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight, // Lighter border
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    // Slightly enhanced shadow as requested
    shadowColor: '#4f39f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.background, // Light purple background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoBox: {
    marginLeft: 14,
    justifyContent: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardDates: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
    marginTop: 16,
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginLeft: 6,
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#4f39f6',
    fontWeight: '700',
  },
});
}
