import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useStore, agentModes } from '../store/useStore';
import type { Session } from '../types';
import { format } from 'date-fns';

interface SessionListProps {
  onSelectSession: (session: Session) => void;
}

export const SessionList = ({ onSelectSession }: SessionListProps) => {
  const sessions = useStore((state) => state.sessions);
  const currentSession = useStore((state) => state.currentSession);
  const deleteSession = useStore((state) => state.deleteSession);
  const archiveSession = useStore((state) => state.archiveSession);
  const pinSession = useStore((state) => state.pinSession);

  const handleDelete = useCallback((sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSession(sessionId),
        },
      ]
    );
  }, [deleteSession]);

  const handleArchive = useCallback((sessionId: string) => {
    archiveSession(sessionId);
  }, [archiveSession]);

  const renderSession = ({ item: session }: { item: Session }) => {
    const isActive = currentSession?.id === session.id;
    const modeConfig = agentModes[session.mode];
    const messageCount = session.messages.length;

    return (
      <TouchableOpacity
        style={[styles.sessionCard, isActive && styles.activeSession]}
        onPress={() => onSelectSession(session)}
        onLongPress={() => {
          Alert.alert(
            session.title,
            'Choose an action',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: session.isPinned ? 'Unpin' : 'Pin', onPress: () => pinSession(session.id) },
              { text: 'Archive', onPress: () => handleArchive(session.id) },
              { text: 'Delete', style: 'destructive', onPress: () => handleDelete(session.id) },
            ]
          );
        }}
      >
        <View style={styles.sessionHeader}>
          <View style={[styles.modeBadge, { backgroundColor: modeConfig.color + '30' }]}>
            <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle} numberOfLines={1}>
              {session.isPinned && '📌 '}{session.title}
            </Text>
            <Text style={styles.sessionMeta}>
              {modeConfig.name} • {messageCount} messages
            </Text>
          </View>
          {isActive && (
            <View style={styles.activeIndicator}>
              <View style={[styles.activeDot, { backgroundColor: modeConfig.color }]} />
            </View>
          )}
        </View>

        {session.messages.length > 0 && (
          <Text style={styles.lastMessage} numberOfLines={2}>
            {session.messages[session.messages.length - 1].content}
          </Text>
        )}

        <View style={styles.sessionFooter}>
          <Text style={styles.timestamp}>
            {format(new Date(session.updatedAt), 'MMM d, HH:mm')}
          </Text>
          <Text style={styles.messageCount}>{messageCount} msgs</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const pinnedSessions = sessions.filter((s) => s.isPinned && !s.isArchived);
  const regularSessions = sessions.filter((s) => !s.isPinned && !s.isArchived);
  const archivedSessions = sessions.filter((s) => s.isArchived);

  return (
    <View style={styles.container}>
      {/* Empty State */}
      {sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No Sessions Yet</Text>
          <Text style={styles.emptyDescription}>
            Start a new conversation with ZYRAXON AI
          </Text>
        </View>
      )}

      {/* Pinned Sessions */}
      {pinnedSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📌 Pinned</Text>
          <FlatList
            data={pinnedSessions}
            renderItem={renderSession}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Regular Sessions */}
      {regularSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <FlatList
            data={regularSessions}
            renderItem={renderSession}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Archived Sessions */}
      {archivedSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Archived</Text>
          <FlatList
            data={archivedSessions}
            renderItem={renderSession}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sessionCard: {
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
  },
  activeSession: {
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modeBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modeIcon: {
    fontSize: 18,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  sessionMeta: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  activeIndicator: {
    marginLeft: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    lineHeight: 18,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    color: '#555',
  },
  messageCount: {
    fontSize: 11,
    color: '#555',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
