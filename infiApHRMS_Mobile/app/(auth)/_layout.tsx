import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@/context/UserContext';

const getRoleBasedRoute = (role: string) => {
  const normalized = (role || '').toString().trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'main_admin' || normalized === 'superadmin') {
    return '/(admin)';
  }
  return '/(employee)';
};

export default function AuthLayout() {
  const { isAuthenticated, isHydrating, user } = useUser();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={getRoleBasedRoute(user.systemRole) as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="two-factor-auth" />
    </Stack>
  );
}
