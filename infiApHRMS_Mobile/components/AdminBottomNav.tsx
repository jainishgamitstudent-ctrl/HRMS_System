import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const NAV_ITEMS = [
  {
    icon: 'people-outline',
    activeIcon: 'people',
    label: 'Manage HR',
    route: '/(admin)/manage-hr',
  },
  {
    icon: 'log-out-outline',
    activeIcon: 'log-out',
    label: 'Resignations',
    route: '/(admin)/resignation-management',
  },
  {
    icon: 'home-outline',
    activeIcon: 'home',
    label: 'WFH Access',
    route: '/(admin)/wfh-permissions',
  },
  {
    icon: 'moon-outline',
    activeIcon: 'moon',
    label: 'Double Shift',
    route: '/(hr)/double-shift-permissions',
  },
];

const NavItem = ({ item, isActive }: { item: typeof NAV_ITEMS[number]; isActive: boolean }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.15 : 1);
    opacity.value = withTiming(isActive ? 1 : 0.6);
  }, [isActive, opacity, scale]);

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
          color={isActive ? '#007AFF' : '#94a3b8'}
        />
      </Animated.View>
      <Animated.Text style={[styles.navLabel, isActive && styles.navLabelActive, animatedTextStyle]}>
        {item.label}
      </Animated.Text>
      {isActive ? <View style={styles.activeIndicator} /> : null}
    </TouchableOpacity>
  );
};

export const AdminBottomNav = () => {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.floatingNav}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.route} item={item} isActive={pathname === item.route} />
        ))}
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
  },
  floatingNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: width * 0.9,
    minHeight: 70,
    borderRadius: 35,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#007AFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
  iconGlow: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
