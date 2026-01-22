import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function AddSetScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Add Set</Text>
      <Text variant="bodyMedium">Log your exercises here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
});
