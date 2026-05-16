import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@/context/UserContext';

import { useAppTheme } from '@/context/ThemeContext';

const getRoleBasedRoute = (role: string) => {
  const normalized = (role || '').toString().trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'main_admin' || normalized === 'superadmin') {
    return '/(admin)';
  }
  return '/(employee)';
};

export default function Index() {
  const { colors } = useAppTheme();
  const { isHydrating, isAuthenticated, user } = useUser();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? (getRoleBasedRoute(user.systemRole) as any) : '/(auth)/sign-in'} />;
}
