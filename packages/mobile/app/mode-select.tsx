import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AgentModeSelector } from '../src/components/AgentModeSelector';

export default function ModeSelectScreen() {
  return (
    <View style={styles.container}>
      <AgentModeSelector />
      
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
});
