import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
const OrganizationStructure = () => {
  const { colors } = useAppTheme();
  const styles = useMemo(() => OrganizationStructureStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>OrganizationStructure</Text>
    </View>
  );
};

function OrganizationStructureStyles(colors: any) {
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

export default OrganizationStructure;
