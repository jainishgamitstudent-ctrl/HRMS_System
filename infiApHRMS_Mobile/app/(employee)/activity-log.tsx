import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
const ActivityLog = () => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => ActivityLogStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ActivityLog</Text>
    </View>
  );
};

function ActivityLogStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    text: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.textSecondary,
    },
  });
}

export default ActivityLog;
