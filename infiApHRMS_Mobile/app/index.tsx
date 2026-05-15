import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@/context/UserContext';

import { useAppTheme } from '@/context/ThemeContext';
export default function Index() {
  const { colors } = useAppTheme();
  const { isHydrating, isAuthenticated } = useUser();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(employee)' : '/(auth)/sign-in'} />;
}
