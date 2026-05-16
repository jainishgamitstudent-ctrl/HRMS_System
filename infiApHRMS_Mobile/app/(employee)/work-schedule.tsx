import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
const WorkSchedule = () => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => WorkScheduleStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>WorkSchedule</Text>
    </View>
  );
};

function WorkScheduleStyles(colors: any) {
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

export default WorkSchedule;
