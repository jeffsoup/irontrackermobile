import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function ProgressionScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Progression</Text>
      <Text variant="bodyMedium">Track your progress with charts</Text>
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
