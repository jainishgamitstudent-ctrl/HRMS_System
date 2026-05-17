import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useUser } from '@/context/UserContext';
import { useAppTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const BASE_NAV_ITEMS = [
  {
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Home',
    route: '/(employee)/'
  },
  {
    icon: 'people-outline',
    activeIcon: 'people',
    label: 'Directory',
    route: '/(employee)/directory'
  },
  {
    icon: 'time-outline',
    activeIcon: 'time',
    label: 'Attendance',
    route: '/(employee)/attendance'
  },
  {
    icon: 'person-outline',
    activeIcon: 'person',
    label: 'Profile',
    route: '/(employee)/profile'
  },
];

const ADMIN_NAV_ITEMS = [
  {
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'Home',
    route: '/(employee)/'
  },
  {
    icon: 'shield-outline',
    activeIcon: 'shield',
    label: 'Manage',
    route: '/(admin)/manage-hr'
  },
  {
    icon: 'time-outline',
    activeIcon: 'time',
    label: 'Attendance',
    route: '/(employee)/attendance'
  },
  {
    icon: 'moon-outline',
    activeIcon: 'moon',
    label: 'Double Shift',
    route: '/(hr)/double-shift-permissions'
  },
  {
    icon: 'person-outline',
    activeIcon: 'person',
    label: 'Profile',
    route: '/(employee)/profile'
  },
];

type NavItemType = { icon: string; activeIcon: string; label: string; route: string };

const NavItem = ({ item, isActive }: { item: NavItemType; isActive: boolean }) => {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.15 : 1);
    opacity.value = withTiming(isActive ? 1 : 0.6);
  }, [isActive]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => router.push(item.route as any)}
      activeOpacity={0.7}
    >
      <Animated.View style={[animatedIconStyle, isActive && { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 }]}>
        <Ionicons
          name={(isActive ? item.activeIcon : item.icon) as any}
          size={24}
          color={isActive ? colors.primary : colors.navInactive}
        />
      </Animated.View>
      <Animated.Text style={[styles.navLabel, { color: isActive ? colors.primary : colors.navInactive }, animatedTextStyle]}>
        {item.label}
      </Animated.Text>
      {isActive && (
        <Animated.View
          style={[styles.activeIndicator, { backgroundColor: colors.primary }]}
        />
      )}
    </TouchableOpacity>
  );
};

export const BottomNav = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const { colors } = useAppTheme();

  const normalizedRole = (user.systemRole || '').toString().trim().toLowerCase();
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'main_admin' || normalizedRole === 'superadmin';
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : BASE_NAV_ITEMS;

  const navStyles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 32,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: Platform.OS === 'ios' ? 24 : 0,
      zIndex: 1000,
    },
    floatingNav: {
      flexDirection: 'row',
      backgroundColor: colors.navBg,
      width: width * 0.9,
      height: 70,
      borderRadius: 35,
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 15,
      borderWidth: 1,
      borderColor: colors.navBorder,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      height: '100%',
    },
    navLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.navInactive,
      marginTop: 4,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 8,
      width: 4,
      height: 4,
      borderRadius: 2,
    },
  }), [colors]);

  return (
    <View style={navStyles.container}>
      <View style={navStyles.floatingNav}>
        {navItems.map((item: NavItemType, i: number) => {
          const isActive = pathname === item.route ||
            (item.route === '/(employee)/' && pathname === '/(employee)') ||
            (item.route === '/(employee)/directory' && pathname === '/(employee)/directory') ||
            ((item.route === '/(employee)/attendance') &&
              (pathname === '/(employee)/attendance' || pathname === '/(employee)/attendance-logging' || pathname === '/(employee)/attendance-history')) ||
            (item.route === '/(admin)/manage-hr' && pathname.startsWith('/(admin)')) ||
            (item.route === '/(hr)/double-shift-permissions' && pathname.startsWith('/(hr)/double-shift-permissions'));

          return <NavItem key={i} item={item} isActive={isActive} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
