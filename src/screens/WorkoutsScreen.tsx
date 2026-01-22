import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function WorkoutsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Workouts</Text>
      <Text variant="bodyMedium">View your workout history</Text>
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
