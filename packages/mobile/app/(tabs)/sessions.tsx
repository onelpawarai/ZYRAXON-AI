import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { SessionList } from '../../src/components/SessionList';
import { AgentModeSelector } from '../../src/components/AgentModeSelector';
import type { Session } from '../../src/types';

export default function SessionsScreen() {
  const createSession = useStore((state) => state.createSession);
  const selectSession = useStore((state) => state.selectSession);

  const handleSelectSession = useCallback((session: Session) => {
    selectSession(session.id);
    router.push('/chat');
  }, [selectSession]);

  const handleNewSession = useCallback(() => {
    const session = createSession();
    router.push('/chat');
  }, [createSession]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>📋 Sessions</Text>
          <TouchableOpacity style={styles.newButton} onPress={handleNewSession}>
            <Text style={styles.newButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
        
        {/* Mode Selector */}
        <View style={styles.modeSelectorContainer}>
          <AgentModeSelector />
        </View>
      </View>

      {/* Session List */}
      <SessionList onSelectSession={handleSelectSession} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#0d0d18',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  newButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  modeSelectorContainer: {
    marginTop: 8,
  },
});
