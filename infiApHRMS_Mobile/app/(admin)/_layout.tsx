import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@/context/UserContext';

export default function AdminLayout() {
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
  const isAdmin = normalizedRole === 'admin' || normalizedRole === 'main_admin' || normalizedRole === 'superadmin';

  if (!isAdmin) {
    return <Redirect href="/(employee)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="manage-hr" />
      <Stack.Screen name="resignation-management" />
      <Stack.Screen name="wfh-permissions" />
    </Stack>
  );
}
