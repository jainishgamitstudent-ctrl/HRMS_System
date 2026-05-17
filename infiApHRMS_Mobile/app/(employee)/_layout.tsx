import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '@/context/UserContext';

export default function EmployeeLayout() {
  const { isAuthenticated, isHydrating } = useUser();

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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="attendance-logging" />
      <Stack.Screen name="attendance-history" />
      <Stack.Screen name="leave" />
      <Stack.Screen name="apply-leave" />
      <Stack.Screen name="my-leaves" />
      <Stack.Screen name="payroll" />
      <Stack.Screen name="payroll-history" />
      <Stack.Screen name="payroll-tax" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="profile-settings" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="notification-details/[id]" />
      <Stack.Screen name="work-schedule" />
      <Stack.Screen name="activity-log" />
      <Stack.Screen name="directory" />
      <Stack.Screen name="leave-approvals" />
      <Stack.Screen name="leave-details" />
      <Stack.Screen name="edit-leave" />
      <Stack.Screen name="events" />
      <Stack.Screen name="upcoming-wfh" />
      <Stack.Screen name="apply-resignation" />
      <Stack.Screen name="my-resignation" />
      <Stack.Screen name="request-double-shift" />
      <Stack.Screen name="job-postings" />
    </Stack>
  );
}
