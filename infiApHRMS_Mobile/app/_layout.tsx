import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import 'react-native-reanimated';

import { UserProvider } from '../context/UserContext';
import { LeaveProvider } from '../context/LeaveContext';
import { NotificationProvider } from '../context/NotificationContext';
import { SidebarProvider } from '../context/SidebarContext';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import NotificationToast from '../components/NotificationToast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutContent() {
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      const setupNavigationBar = async () => {
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBackgroundColorAsync(colors.background + '00');
      };

      setupNavigationBar();

      const appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          setupNavigationBar();
        }
      });

      return () => {
        appStateSubscription.remove();
      };
    }
  }, [colors.background]);

  const navigationTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <SidebarProvider>
      <NavigationThemeProvider value={navigationTheme}>
        <Sidebar />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(employee)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationThemeProvider>
      <NotificationToast />
    </SidebarProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <LeaveProvider>
          <NotificationProvider>
            <ThemeProvider>
              <RootLayoutContent />
            </ThemeProvider>
          </NotificationProvider>
        </LeaveProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
