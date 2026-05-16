import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
const OrganizationStructure = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>OrganizationStructure</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default OrganizationStructure;
