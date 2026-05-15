import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { router, usePathname } from 'expo-router';
import { useSidebar } from '../../context/SidebarContext';
import { useUser } from '../../context/UserContext';
import { useNotifications } from '../../context/NotificationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveImageSource } from '@/utils/image';
import { signOutUser } from '@/services/auth';
// import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(width * 0.76, 328);
const OVERLAY_OPACITY = 0.24;
const OPEN_DURATION = 320;
const CLOSE_DURATION = 220;

const MENU_CONFIG = {
  employee: [
    { icon: 'grid-outline', label: 'Dashboard', route: '/(employee)/' },
    { icon: 'person-outline', label: 'My Profile', route: '/(employee)/profile' },
    { icon: 'calendar-outline', label: 'Leave Management', route: '/(employee)/leave' },
    { icon: 'chatbubbles-outline', label: 'Request Rooms', route: '/(employee)/request-rooms' },
    { icon: 'time-outline', label: 'Attendance', route: '/(employee)/attendance' },
    { icon: 'cash-outline', label: 'Payroll', route: '/(employee)/payroll' },
    { icon: 'trending-up-outline', label: 'Performance', route: '/(employee)/performance' },
    { icon: 'notifications-outline', label: 'Notifications', route: '/(employee)/notifications' },
    { icon: 'settings-outline', label: 'Settings', route: '/(employee)/profile-settings' },
  ],
};

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();
  const { user, clearUserSession } = useUser();
  const { notifications } = useNotifications();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const [isMounted, setIsMounted] = useState(isOpen);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const menuItems = MENU_CONFIG.employee;

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }

    progress.value = withTiming(
      isOpen ? 1 : 0,
      {
        duration: isOpen ? OPEN_DURATION : CLOSE_DURATION,
        easing: isOpen
          ? Easing.bezier(0.22, 1, 0.36, 1)
          : Easing.bezier(0.4, 0, 1, 1),
      },
      (finished) => {
        if (finished && !isOpen) {
          runOnJS(setIsMounted)(false);
        }
      }
    );
  }, [isOpen, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-SIDEBAR_WIDTH - 24, 0]);
    const scale = interpolate(progress.value, [0, 1], [0.985, 1]);
    const opacity = interpolate(progress.value, [0, 1], [0.9, 1]);

    return {
      opacity,
      transform: [{ translateX }, { scale }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, OVERLAY_OPACITY]),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.35, 1]),
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-18, 0]) }],
  }));

  const handleNavigate = (route: string) => {
    closeSidebar();
    router.push(route as any);
  };

  const handleSignOut = async () => {
    closeSidebar();
    try {
      await signOutUser();
    } finally {
      clearUserSession();
      router.replace('/(auth)/sign-in');
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.flex1} onPress={closeSidebar} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          {
            paddingTop: insets.top + 10,
            paddingBottom: Math.max(insets.bottom, 12),
          },
          animatedStyle,
        ]}>
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.header}>
            <View style={styles.logoAndName}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.brandCopy}>
                <Text style={styles.appName} numberOfLines={1}>infiAp HRMS</Text>
                <Text style={styles.appTagline}>Modern Workforce</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeSidebar} style={styles.closeBtn} activeOpacity={0.75}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.userProfile}
            onPress={() => handleNavigate('/(employee)/profile')}
            activeOpacity={0.82}
          >
            <Image source={resolveImageSource(user.avatar)} style={styles.userAvatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.userRole} numberOfLines={1}>{user.role}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, index) => {
              const isActive = pathname === item.route || (item.route === '/(employee)/' && (pathname === '/(employee)' || pathname === '/(employee)/'));
              const isNotifications = item.label === 'Notifications';
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, isActive && styles.activeMenuItem]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.82}
                >
                  <View style={[styles.iconWrap, isActive && styles.activeIconWrap]}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={isActive ? '#334155' : '#64748b'}
                    />
                  </View>
                  <Text style={[styles.menuLabel, isActive && styles.activeMenuLabel]}>
                    {item.label}
                  </Text>
                  {isNotifications && unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>v1.0.0 (Pre-Alpha)</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    zIndex: 9998,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    zIndex: 9999,
    borderTopRightRadius: 34,
    borderBottomRightRadius: 34,
    shadowColor: '#000',
    shadowOffset: { width: 12, height: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
    elevation: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoAndName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
  },
  logo: {
    width: 52,
    height: 22,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  appTagline: {
    marginTop: 2,
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    marginLeft: 10,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 22,
    backgroundColor: '#f8fbff',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  userRole: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  menuScroll: {
    flex: 1,
  },
  menuContainer: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 6,
  },
  activeMenuItem: {
    backgroundColor: '#f8fafc',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activeIconWrap: {
    backgroundColor: '#f1f5f9',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    flex: 1,
  },
  activeMenuLabel: {
    color: '#475569',
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eef2f7',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 46,
    marginBottom: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ef4444',
  },
  versionText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});

export default Sidebar;
