import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserProvider } from '../context/UserContext';
import { LeaveProvider } from '../context/LeaveContext';
import { NotificationProvider } from '../context/NotificationContext';
import { SidebarProvider } from '../context/SidebarContext';
import Sidebar from '../components/layout/Sidebar';
import NotificationToast from '../components/NotificationToast';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      const setupNavigationBar = async () => {
        // Keep Android in immersive mode and auto-hide system nav buttons.
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBackgroundColorAsync('#00000000');
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
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <LeaveProvider>
          <NotificationProvider>
            <SidebarProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Sidebar />
                <Stack>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(employee)" options={{ headerShown: false }} />
                  <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </SidebarProvider>
            <NotificationToast />
          </NotificationProvider>
        </LeaveProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
