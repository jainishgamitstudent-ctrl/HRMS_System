import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';
import { useNotifications } from '../../context/NotificationContext';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, withTiming, FadeInDown } from 'react-native-reanimated';
import Header from '../../components/layout/Header';
import { useAttendanceSession } from '../../hooks/useAttendanceSession';
import { useUser } from '@/context/UserContext';
import { fetchAttendanceSummary, fetchDashboardHome, submitEmployeePunch } from '@/services/auth';
import { checkMyWFHPermission } from '@/services/wfh';
import { getExactCurrentLocation, formatExactLocationLabel } from '../../utils/location';
import { useAppTheme } from '@/context/ThemeContext';
const { width } = Dimensions.get('window');

// Mock SVGs / Images using Ionicons and Views
const CircularProgress = ({ value, total, color, label, subLabel }: { value: number, total: number, color: string, label: string, subLabel: string }) => {
  // A simple representation since SVG isn't available out of the box
  return (
    <View style={styles.leaveCard}>
      <View style={[styles.progressCircle, { borderColor: `${color}33` }]}>
        <View style={[styles.progressCircleInner, {
          borderTopColor: color,
          borderRightColor: color,
          borderBottomColor: value > total / 2 ? color : 'transparent',
          borderLeftColor: value > total * 0.75 ? color : 'transparent',
          transform: [{ rotate: '-45deg' }]
        }]} />
        <Text style={styles.progressValueText}>{value}</Text>
      </View>
      <Text style={styles.leaveTypeLabel}>{label}</Text>
      <Text style={styles.leaveTypeSub}>{subLabel}</Text>
    </View>
  );
};

// Swipe to Check-in Component
const SwipeToCheckIn = () => {
  const SWIPE_WIDTH = width - 72; // Dynamic width: window width - screen padding (40) - card padding (32)
  const KNOB_SIZE = 48;
  const MAX_TRANSLATE = SWIPE_WIDTH - KNOB_SIZE - 8;

  const translateX = useSharedValue(0);
  const { session, loading, recordCheckIn, recordCheckOut, resetSession, toggleDoubleShift, canCheckOut, isLockedForToday, doubleShiftEnabled, nextResetLabel } = useAttendanceSession();
  const { user } = useUser();
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const resolveCurrentLocation = async () => getExactCurrentLocation();

  const handleToggle = async () => {
    if (loading || isCapturingLocation || isLockedForToday) {
      translateX.value = withTiming(0);
      return;
    }

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setIsCapturingLocation(true);
    setLocationError('');

    try {
      const location = await resolveCurrentLocation();
      const snapshot = {
        time,
        location: formatExactLocationLabel(location),
        latitude: location.latitude,
        longitude: location.longitude,
      };

      await submitEmployeePunch({
        PunchType: canCheckOut ? 2 : 1,
        Latitude: location.latitude,
        Longitude: location.longitude,
        WorkMode: 1,
      });

      if (canCheckOut) {
        await recordCheckOut(snapshot);
      } else {
        await recordCheckIn(snapshot);
      }
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Unable to fetch current location');
      translateX.value = withTiming(0);
    } finally {
      setIsCapturingLocation(false);
      setTimeout(() => {
        translateX.value = withTiming(0);
      }, 500);
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!loading && !isCapturingLocation && !isLockedForToday)
    .onUpdate((event) => {
      translateX.value = Math.max(0, Math.min(event.translationX, MAX_TRANSLATE));
    })
    .onEnd(() => {
      if (translateX.value > MAX_TRANSLATE * 0.8) {
        translateX.value = withSpring(MAX_TRANSLATE, { damping: 10, mass: 1, overshootClamping: false });
        runOnJS(handleToggle)();
      } else {
        translateX.value = withSpring(0, { damping: 10, mass: 1, overshootClamping: false });
      }
    });

  const animatedKnobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: 1 - translateX.value / (MAX_TRANSLATE * 0.5),
  }));

  const activeSnapshot = session.checkedOut
    ? session.checkOutSnapshot ?? session.checkInSnapshot
    : session.checkedIn
      ? session.checkInSnapshot
      : null;
  const timeLabel = session.checkedOut ? 'Checked out at' : session.checkedIn ? 'Checked in at' : 'Last check';
  const timeValue = session.checkedOut
    ? session.checkOutSnapshot?.time ?? '--'
    : session.checkedIn
      ? session.checkInSnapshot?.time ?? '--'
      : session.checkInSnapshot?.time ?? '--';
  const locationLabel = isCapturingLocation
    ? 'Fetching current location...'
    : locationError || activeSnapshot?.location || (loading ? 'Loading attendance session...' : 'Current location will appear here');
  const hasLocationIssue = !isCapturingLocation && Boolean(locationError);
  const swipeTitle = loading
    ? 'LOADING SESSION...'
    : isCapturingLocation
      ? 'CAPTURING LOCATION...'
      : isLockedForToday
        ? 'CHECK-OUT COMPLETE'
        : canCheckOut
          ? 'SWIPE TO CHECK-OUT'
          : 'SWIPE TO CHECK-IN';
  const swipeHelpText = session.checkedIn && !isLockedForToday
    ? 'Today is active until you check out'
    : '';

  return (
    <View style={styles.swipeContainer}>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.swipeTrack, session.checkedIn && styles.swipeTrackSuccess, isLockedForToday && styles.swipeTrackLocked]}>
          <Animated.View style={[styles.swipeTextContainer, animatedTextStyle]}>
            <Text style={[styles.swipeText, session.checkedIn && { color: '#059669', marginLeft: 10 }, isLockedForToday && styles.swipeTextLocked]}>
              {swipeTitle}
            </Text>
          </Animated.View>
          <Animated.View style={[styles.swipeKnob, animatedKnobStyle, session.checkedIn && styles.swipeKnobSuccess, isLockedForToday && styles.swipeKnobLocked]}>
            {isCapturingLocation ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : isLockedForToday ? (
              <Ionicons name="lock-closed-outline" size={22} color="#fff" />
            ) : (
              <Ionicons name={canCheckOut ? "log-out-outline" : "log-in-outline"} size={22} color="#fff" />
            )}
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.swipeFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={14} color={session.checkedIn ? "#059669" : "#22c55e"} />
          <Text style={styles.footerText}>{timeLabel}: {timeValue}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={14} color={hasLocationIssue ? "#dc2626" : "#3b82f6"} />
          <Text
            style={[styles.footerText, hasLocationIssue && styles.footerTextError]}
            numberOfLines={2}
          >
            {locationLabel}
          </Text>
        </View>
      </View>
      {/* Double Shift Toggle */}
      <View style={styles.doubleShiftRow}>
        <View style={styles.doubleShiftLabelWrap}>
          <Ionicons
            name={doubleShiftEnabled ? "moon" : "moon-outline"}
            size={16}
            color={user.doubleShiftAllowed ? (doubleShiftEnabled ? '#4f46e5' : '#64748b') : '#94a3b8'}
          />
          <Text style={[styles.doubleShiftLabel, !user.doubleShiftAllowed && styles.doubleShiftLabelDisabled]}>
            Double Shift
          </Text>
          {!user.doubleShiftAllowed && (
            <Text style={styles.doubleShiftHint}>Contact HR</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.doubleShiftToggle,
            doubleShiftEnabled && styles.doubleShiftToggleActive,
            !user.doubleShiftAllowed && styles.doubleShiftToggleDisabled,
          ]}
          onPress={() => {
            if (user.doubleShiftAllowed) {
              toggleDoubleShift();
            }
          }}
          activeOpacity={user.doubleShiftAllowed ? 0.8 : 1}
        >
          <View
            style={[
              styles.doubleShiftKnob,
              doubleShiftEnabled && styles.doubleShiftKnobActive,
              !user.doubleShiftAllowed && styles.doubleShiftKnobDisabled,
            ]}
          />
        </TouchableOpacity>
      </View>

      {session.checkedIn && !isLockedForToday && (
        <Text style={styles.swipeNote}>{swipeHelpText}</Text>
      )}
    </View>
  );
};


const FeatureCard = ({ icon, title, sub, color, bgColor, route, delay, unreadCount, disabled }: { icon: any, title: string, sub: string, color: string, bgColor: string, route: string, delay: number, unreadCount?: number, disabled?: boolean }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.95, { damping: 10, mass: 1 });
  };

  const handlePressOut = () => {
    if (!disabled) scale.value = withSpring(1, { damping: 10, mass: 1 });
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()} style={animatedStyle}>
      <TouchableOpacity
        style={[styles.featureCard, { backgroundColor: disabled ? '#f1f5f9' : bgColor }, disabled && styles.featureCardDisabled]}
        onPress={() => { if (!disabled) router.push(route as any); }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={disabled ? 1 : 0.9}
        disabled={disabled}
      >
        <View style={[styles.featureIconWrap, { backgroundColor: disabled ? '#cbd5e1' : color }]}>
          <Ionicons name={icon} size={24} color="#fff" />
          {title === 'Notifications' && unreadCount !== undefined && unreadCount > 0 && (
            <View style={styles.notiBadge}>
              <Text style={styles.notiBadgeText}>{unreadCount}</Text>
            </View>
          )}
          {disabled && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color="#fff" />
            </View>
          )}
        </View>
        <Text style={[styles.featureTitle, disabled && styles.featureTitleDisabled]}>{title}</Text>
        <Text style={[styles.featureSub, disabled && styles.featureSubDisabled]}>{disabled ? 'Disabled' : sub}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};


export default function EmployeeDashboard() {
  const { colors } = useAppTheme();
  const { notifications } = useNotifications();
  const { user } = useUser();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const defaultToday = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const [welcomeTitle, setWelcomeTitle] = useState(`Welcome, ${user.name || 'Employee'}!`);
  const [welcomeSubTitle, setWelcomeSubTitle] = useState(`Today is ${defaultToday}.`);
  const [welcomeDate, setWelcomeDate] = useState(defaultToday.toUpperCase());
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, leaves: 0, holiday: 0 });
  const [leaveBalance, setLeaveBalance] = useState({
    privilegeLeave: 0,
    casualLeave: 0,
    sickLeave: 0,
    totalBalance: 0,
    earlyOutRecord: 0,
    lateIn: "0/5",
    earlyOut: "0/5",
    halfDay: 0
  });
  const [missedPunches, setMissedPunches] = useState<any[]>([]);
  const [birthdays, setBirthdays] = useState({
    countThisWeek: 0,
    message: "",
    list: [] as any[]
  });
  const [isBirthdayModalVisible, setIsBirthdayModalVisible] = useState(false);
  const [wfhEnabled, setWfhEnabled] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollIndex = useRef(0);
  const totalItems = 4;
  const itemWidth = 212;

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollViewRef.current) {
        scrollIndex.current = (scrollIndex.current + 1) % totalItems;
        scrollViewRef.current.scrollTo({
          x: scrollIndex.current * itemWidth,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hydrateDashboard = async () => {
      try {
        const homeResponse = await fetchDashboardHome();
        const greeting = homeResponse.data.greeting;
        if (greeting?.message) {
          setWelcomeTitle(greeting.message);
        }
        if (greeting?.subMessage) {
          setWelcomeSubTitle(greeting.subMessage);
        }
        if (greeting?.today) {
          setWelcomeDate(greeting.today.toUpperCase());
        }
        // Update Attendance Summary
        if (homeResponse.data.attendanceSummary) {
          setAttendanceSummary(homeResponse.data.attendanceSummary);
        }

        // Update Missed Punches
        if (homeResponse.data.missedPunches) {
          setMissedPunches(homeResponse.data.missedPunches);
        }
        // Update Birthdays
        if (homeResponse.data.birthdays) {
          setBirthdays(homeResponse.data.birthdays);
        }

        if (homeResponse.data.leaveBalance) {
          setLeaveBalance(homeResponse.data.leaveBalance);
        }
      } catch (error) {
        setWelcomeTitle(`Welcome, ${user.name || 'Employee'}!`);
        setWelcomeSubTitle(`Today is ${defaultToday}.`);
      }

      try {
        const summaryResponse = await fetchAttendanceSummary();
        setAttendanceSummary({
          present: summaryResponse.data.present || 0,
          leaves: summaryResponse.data.leaves || 0,
          holiday: summaryResponse.data.holiday || 0,
        });
      } catch (error) {
        setAttendanceSummary({ present: 0, leaves: 0, holiday: 0 });
      }
    };

    hydrateDashboard();
  }, [defaultToday, user.name]);

  useEffect(() => {
    const checkWFH = async () => {
      try {
        const response = await checkMyWFHPermission();
        setWfhEnabled(response?.data?.wfhEnabled ?? false);
      } catch (error) {
        setWfhEnabled(false);
      }
    };
    checkWFH();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        <Animated.View entering={FadeInDown.duration(800).springify()} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <Header
              title="Employee Dashboard"
            />

            <View style={styles.contentPadding}>

              {/* Welcome Banner */}
              <View style={styles.bannerContainer}>
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeText}>{welcomeDate}</Text>
                </View>
                <Text style={styles.bannerTitle}>{welcomeTitle}</Text>
                <Text style={styles.bannerSubtitle}>{welcomeSubTitle}</Text>
              </View>

              {/* Check-In Section */}
              <Text style={styles.sectionHeader}>Check-In</Text>
              <SwipeToCheckIn />

              {/* Leave Balance Section */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Leave Balance</Text>
                <TouchableOpacity>
                  <Text style={styles.historyLink}>History</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.leaveGrid}>
                <CircularProgress value={leaveBalance.privilegeLeave} total={6} color="#3b82f6" label="Privilege Leave" subLabel="AVAILABLE" />
                <CircularProgress value={leaveBalance.casualLeave} total={6} color="#6366f1" label="Casual Leave" subLabel="AVAILABLE" />
                <CircularProgress value={leaveBalance.sickLeave} total={6} color="#22c55e" label="Sick Leave" subLabel="AVAILABLE" />
                <View style={[styles.leaveCard, styles.darkCard]}>
                  <View style={styles.darkCircle}>
                    <Text style={styles.darkCircleValue}>{leaveBalance.totalBalance}</Text>
                  </View>
                  <Text style={[styles.leaveTypeLabel, { color: '#fff' }]}>Total Balance</Text>
                  <Text style={styles.leaveTypeSubDark}>DAYS</Text>
                </View>
              </View>

              <View style={styles.statsRowGrid}>
                <View style={styles.statBadge}>
                  <View style={styles.statBadgeContent}>
                    <Text style={styles.statBadgeLabel}>EARLY OUT RECORD</Text>
                    <Text style={styles.statBadgeValue}>{leaveBalance.earlyOutRecord}</Text>
                  </View>
                </View>
                <View style={[styles.statBadge, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
                  <View style={styles.statBadgeContent}>
                    <Text style={styles.statBadgeLabel}>LATE IN</Text>
                    <Text style={[styles.statBadgeValue, { color: '#d97706' }]}>{leaveBalance.lateIn}</Text>
                  </View>
                </View>
                <View style={styles.statBadge}>
                  <View style={styles.statBadgeContent}>
                    <Text style={styles.statBadgeLabel}>EARLY OUT</Text>
                    <Text style={styles.statBadgeValue}>{leaveBalance.earlyOut}</Text>
                  </View>
                </View>
                <View style={styles.statBadge}>
                  <View style={styles.statBadgeContent}>
                    <Text style={styles.statBadgeLabel}>HALF DAY</Text>
                    <Text style={styles.statBadgeValue}>{leaveBalance.halfDay}</Text>
                  </View>
                </View>
              </View>

              {/* Attendance Summary */}
              <Text style={styles.sectionHeader}>Attendance Summary</Text>
              <View style={styles.attendanceSummaryContainer}>
                <View style={styles.attendanceItem}>
                  <View style={[styles.attIconWrap, { backgroundColor: '#dcfce7' }]}>
                    <Ionicons name="person-circle" size={24} color="#22c55e" />
                  </View>
                  <Text style={styles.attNumber}>{attendanceSummary.present}</Text>
                  <Text style={styles.attLabel}>PRESENT</Text>
                </View>
                <View style={styles.attendanceItem}>
                  <View style={[styles.attIconWrap, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="calendar" size={20} color="#ef4444" />
                  </View>
                  <Text style={styles.attNumber}>{attendanceSummary.leaves}</Text>
                  <Text style={styles.attLabel}>LEAVES</Text>
                </View>
                <View style={styles.attendanceItem}>
                  <View style={[styles.attIconWrap, { backgroundColor: '#dbeafe' }]}>
                    <Ionicons name="umbrella" size={20} color="#3b82f6" />
                  </View>
                  <Text style={styles.attNumber}>{attendanceSummary.holiday}</Text>
                  <Text style={styles.attLabel}>HOLIDAY</Text>
                </View>
              </View>
              {/* Quick Features Section */}
              <Text style={styles.sectionHeader}>Quick Actions</Text>
              <View style={styles.featuresGrid}>
                <FeatureCard
                  icon="calendar-outline"
                  title="Leave Requests"
                  sub="Manage"
                  color="#3b82f6"
                  bgColor="#eff6ff"
                  route="/(employee)/leave"
                  delay={100}
                />
                <FeatureCard
                  icon="laptop-outline"
                  title="Upcoming WFH"
                  sub="Schedule"
                  color="#8b5cf6"
                  bgColor="#f5f3ff"
                  route="/(employee)/upcoming-wfh"
                  delay={200}
                  disabled={!wfhEnabled}
                />
             
                <FeatureCard
                  icon="cash-outline"
                  title="Payroll"
                  sub="Salary Slips"
                  color="#4f46e5"
                  bgColor="#f5f3ff"
                  route="/(employee)/payroll"
                  delay={300}
                />
                {/* <FeatureCard
                  icon="trending-up-outline"
                  title="Performance"
                  sub="Metrics"
                  color="#6366f1"
                  bgColor="#f5f3ff"
                  route="/(employee)/performance"
                  delay={400}
                /> */}
                <FeatureCard
                  icon="notifications-outline"
                  title="Notifications"
                  sub="Alerts"
                  color="#ef4444"
                  bgColor="#fef2f2"
                  route="/(employee)/notifications"
                  delay={500}
                  unreadCount={unreadCount}
                />
              </View>

              {/* Missed Punches Carousel */}
              <Text style={[styles.sectionHeader, { marginTop: 12, marginBottom: 16 }]}>Missed Punches</Text>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.missedPunchesCarousel}
                snapToInterval={212}
                decelerationRate="fast"
              >
                {missedPunches.length > 0 ? (
                  missedPunches.map((item, index) => (
                    <View key={index} style={styles.missedPunchCard}>
                      <View style={styles.missedPunchRow}>
                        <Text style={styles.missedPunchDate}>{item.date}</Text>
                        <Ionicons name="warning-outline" size={16} color="#ef4444" />
                      </View>
                      <Text style={styles.missedPunchTitle}>{item.type}</Text>
                      <TouchableOpacity onPress={() => router.push('/(employee)/attendance-correction')}>
                        <Text style={styles.missedPunchAction}>APPLY PUNCH</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={[styles.missedPunchCard, { width: itemWidth, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={[styles.missedPunchTitle, { color: '#666', fontSize: 12 }]}>No Missed Punches</Text>
                  </View>
                )}
              </ScrollView>


              {/* Employee of the Month */}
              <View style={styles.eomCard}>
                <View style={styles.eomContent}>
                  <View style={styles.eomAvatarWrap}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }}
                      style={styles.eomAvatar}
                    />
                    <View style={styles.eomBadge}>
                      <Ionicons name="star" size={10} color="#fff" />
                    </View>
                  </View>
                  <View>
                    <Text style={styles.eomLabel}>EMPLOYEE OF THE MONTH</Text>
                    <Text style={styles.eomName}>Siddharth Rao</Text>
                    <Text style={styles.eomRole}>Senior Product Designer</Text>
                  </View>
                </View>
                {/* background watermark star */}
                <Ionicons name="ribbon" size={100} color="rgba(255,255,255,0.05)" style={styles.eomWatermark} />
              </View>

              <TouchableOpacity 
                style={styles.birthdayCard}
                onPress={() => setIsBirthdayModalVisible(true)}
              >
                <View style={styles.birthdayHeader}>
                  <Text style={styles.birthdayTitle}>Birthdays</Text>
                  <View style={styles.birthdayTag}>
                    <Text style={styles.birthdayTagText}>{birthdays.countThisWeek} This Week</Text>
                  </View>
                </View>
                <View style={styles.avatarsRow}>
                  {birthdays.list.slice(0, 3).map((item, index) => (
                    <Image 
                      key={index} 
                      source={{ uri: item.profileImage }} 
                      style={[styles.avatarOverlap, { zIndex: 10 - index, marginLeft: index === 0 ? 0 : -12 }]} 
                    />
                  ))}
                  {birthdays.list.length > 3 && (
                    <View style={[styles.avatarOverlap, styles.avatarMore, { marginLeft: -12 }]}>
                      <Text style={styles.avatarMoreText}>+{birthdays.list.length - 3}</Text>
                    </View>
                  )}
                  <Text style={styles.birthdayMessage}>
                    {birthdays.message}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
        <BottomNav />
      </View>

      {/* Birthday List Modal */}
      <Modal
        visible={isBirthdayModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBirthdayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upcoming Birthdays</Text>
              <TouchableOpacity onPress={() => setIsBirthdayModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.birthdayList}>
              {birthdays.list.length > 0 ? (
                birthdays.list.map((item, index) => (
                  <View key={index} style={styles.birthdayListItem}>
                    <Image source={{ uri: item.profileImage }} style={styles.listAvatar} />
                    <View style={styles.listInfo}>
                      <Text style={styles.listName}>{item.name}</Text>
                      <Text style={styles.listDept}>{item.department}</Text>
                    </View>
                    <Text style={styles.listDate}>{item.date}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyBirthday}>
                  <Ionicons name="gift-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No birthdays coming up this week!</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    paddingBottom: 140,
  },
  contentPadding: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Banner
  bannerContainer: {
    backgroundColor: '#2e4ce6',
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#2e4ce6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  bannerBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  sendWelcomeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sendWelcomeText: {
    color: '#2e4ce6',
    fontWeight: '700',
    fontSize: 13,
  },

  // Typography Elements
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  historyLink: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 13,
  },

  // Swipe Card
  swipeContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  swipeTrack: {
    width: width - 72,
    height: 56,
    backgroundColor: '#f8fafc',
    borderRadius: 28,
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  swipeTrackSuccess: {
    backgroundColor: '#dcfce7',
    borderColor: '#bbf7d0',
  },
  swipeTrackLocked: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  swipeKnob: {
    width: 48,
    height: 48,
    backgroundColor: '#2e4ce6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 4,
    shadowColor: '#2e4ce6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  swipeKnobSuccess: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
  },
  swipeKnobLocked: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
  },
  swipeTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
    marginLeft: 30, // Offset for the knob
  },
  swipeTextLocked: {
    color: '#2563eb',
    marginLeft: 10,
  },
  swipeFooter: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
    minWidth: '45%',
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  footerTextError: {
    color: '#dc2626',
  },
  swipeNote: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  swipeNoteLocked: {
    color: '#2563eb',
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Double Shift Toggle
  doubleShiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  doubleShiftLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  doubleShiftLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  doubleShiftLabelDisabled: {
    color: '#94a3b8',
  },
  doubleShiftHint: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginLeft: 4,
  },
  doubleShiftToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  doubleShiftToggleActive: {
    backgroundColor: '#4f46e5',
  },
  doubleShiftToggleDisabled: {
    backgroundColor: '#e2e8f0',
    opacity: 0.6,
  },
  doubleShiftKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ translateX: 0 }],
  },
  doubleShiftKnobActive: {
    transform: [{ translateX: 20 }],
  },
  doubleShiftKnobDisabled: {
    backgroundColor: '#f8fafc',
  },

  // Leave Balance Grid
  leaveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  leaveCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  darkCard: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  progressCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    ...StyleSheet.absoluteFillObject,
    left: -4, top: -4,
  },
  progressValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  leaveTypeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    textAlign: 'center',
  },
  leaveTypeSub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  darkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  darkCircleValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  leaveTypeSubDark: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Stats Grid Mini
  statsRowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    width: '48%',
    padding: 4,
  },
  statBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    flex: 1,
  },
  statBadgeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    marginLeft: 8,
  },

  // Attendance Summary
  attendanceSummaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  attendanceItem: {
    alignItems: 'center',
    width: '30%',
  },
  attIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
  },
  attLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },

  // Missed Punches Carousel
  missedPunchesCarousel: {
    paddingRight: 20, // To allow the last card to be centered or at least have some space
    gap: 12,
    paddingBottom: 24,
  },
  missedPunchCard: {
    width: 200,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 16,
    padding: 16,
    // Add shadow to make it pop more in the carousel
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  missedPunchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missedPunchDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  missedPunchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  missedPunchAction: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
  },

  // Approvals List
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemBody: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  listItemSub: {
    fontSize: 12,
    color: '#64748b',
  },
  listDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2, // 20 padding * 2 + 12 gap = 52
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 2,
    textAlign: 'center',
  },
  featureSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  featureCardDisabled: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureTitleDisabled: {
    color: '#94a3b8',
  },
  featureSubDisabled: {
    color: '#cbd5e1',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#64748b',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notiBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },

  // Employee of the Month
  eomCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  eomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  eomAvatarWrap: {
    position: 'relative',
    marginRight: 16,
  },
  eomAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  eomBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  eomLabel: {
    color: '#6366f1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  eomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  eomRole: {
    color: '#94a3b8',
    fontSize: 12,
  },
  eomWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },

  // Birthdays
  birthdayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  birthdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  birthdayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  birthdayTag: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  birthdayTagText: {
    color: '#db2777',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarOverlap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarMore: {
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMoreText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  birthdayMsg: {
    fontSize: 13,
    color: '#64748b',
  },
  birthdayMessage: {
    marginLeft: 12,
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  birthdayList: {
    flex: 1,
  },
  birthdayListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  listInfo: {
    flex: 1,
    marginLeft: 16,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listDept: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  listDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  emptyBirthday: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
});
