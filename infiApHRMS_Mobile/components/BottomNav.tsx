import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { UI } from '@/constants/ui';

const { width } = Dimensions.get('window');

const NAV_ITEMS = [
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

const NavItem = ({ item, isActive }: { item: typeof NAV_ITEMS[0], isActive: boolean }) => {
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
      <Animated.View style={[animatedIconStyle, isActive && styles.iconGlow]}>
        <Ionicons
          name={(isActive ? item.activeIcon : item.icon) as any}
          size={24}
          color={isActive ? UI.colors.primary : '#94a3b8'}
        />
      </Animated.View>
      <Animated.Text style={[styles.navLabel, isActive && styles.navLabelActive, animatedTextStyle]}>
        {item.label}
      </Animated.Text>
      {isActive && (
        <Animated.View
          style={styles.activeIndicator}
        />
      )}
    </TouchableOpacity>
  );
};

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.floatingNav}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = pathname === item.route ||
            (item.route === '/(employee)/' && pathname === '/(employee)') ||
            (item.route === '/(employee)/directory' && pathname === '/(employee)/directory') ||
            ((item.route === '/(employee)/attendance') &&
              (pathname === '/(employee)/attendance' || pathname === '/(employee)/attendance-logging' || pathname === '/(employee)/attendance-history'));

          return <NavItem key={i} item={item} isActive={isActive} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 0,
    zIndex: 1000,
    // backgroundColor: "red",
  },
  floatingNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: width * 0.9,
    height: 70,
    borderRadius: 35,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    // Elevation for Android
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
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
    color: '#94a3b8',
    marginTop: 4,
  },
  navLabelActive: {
    color: UI.colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: UI.colors.primary,
  },
  iconGlow: {
    shadowColor: UI.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  }
});
