import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@/context/UserContext';

export default function HRLayout() {
  const { isAuthenticated, isHydrating, user } = useUser();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const normalizedRole = (user.systemRole || '').toString().trim().toLowerCase();
  const isHR = normalizedRole === 'hr' || normalizedRole === 'admin' || normalizedRole === 'main_admin' || normalizedRole === 'superadmin';

  if (!isHR) {
    return <Redirect href="/(employee)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
