import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useStore, agentModes } from '../src/store/useStore';
import { MessageBubble } from '../src/components/MessageBubble';
import { ChatInput } from '../src/components/ChatInput';
import { AgentModeSelector } from '../src/components/AgentModeSelector';
import type { Message, Attachment } from '../src/types';

export default function ChatScreen() {
  const flatListRef = useRef<FlatList>(null);
  
  const messages = useStore((state) => state.messages);
  const currentSession = useStore((state) => state.currentSession);
  const currentMode = useStore((state) => state.currentMode);
  const createSession = useStore((state) => state.createSession);
  const addMessage = useStore((state) => state.addMessage);
  const isLoading = useStore((state) => state.isLoading);
  const setLoading = useStore((state) => state.setLoading);
  const runningTools = useStore((state) => state.runningTools);
  const screenVisionActive = useStore((state) => state.screenVisionActive);
  const getModeConfig = useStore((state) => state.getModeConfig);
  
  const modeConfig = getModeConfig(currentMode);

  // Create session if none exists
  useEffect(() => {
    if (!currentSession) {
      createSession(currentMode);
    }
  }, [currentSession, createSession, currentMode]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async (message: string, attachments?: Attachment[]) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return;

    // Add user message
    addMessage({
      role: 'user',
      content: message,
      attachments,
      agentMode: currentMode,
    });

    setLoading(true);

    // Simulate AI response (in real app, this would call the API)
    setTimeout(() => {
      const responses = [
        `I've analyzed your request about "${message.slice(0, 50)}...". This is a powerful capability of ZYRAXON's ${modeConfig.name} mode.`,
        `Interesting! As an AI agent, I can help you with many tasks. Your current mode is ${modeConfig.icon} ${modeConfig.name}.`,
        `Let me help you with that. I'm powered by 136+ tools and can access 25+ AI providers.`,
        `${screenVisionActive ? '👁️ I can see your screen. ' : ''}Processing your request through my ${modeConfig.name} capabilities...`,
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      addMessage({
        role: 'assistant',
        content: randomResponse,
        agentMode: currentMode,
      });
      
      setLoading(false);
    }, 1500);
  }, [currentMode, addMessage, setLoading, modeConfig, screenVisionActive]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  ), []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {currentSession?.title || 'New Chat'}
          </Text>
          <Text style={[styles.modeLabel, { color: modeConfig.color }]}>
            {modeConfig.icon} {modeConfig.name}
          </Text>
        </View>
        <AgentModeSelector compact />
      </View>

      {/* Running Tools Banner */}
      {runningTools.length > 0 && (
        <View style={styles.runningToolsBanner}>
          <Text style={styles.runningToolsIcon}>⚡</Text>
          <Text style={styles.runningToolsText}>
            {runningTools.length} tool{runningTools.length !== 1 ? 's' : ''} running
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesContainer,
          messages.length === 0 && styles.messagesContainerEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Start a Conversation</Text>
            <Text style={styles.emptyText}>
              Ask ZYRAXON anything!
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#0d0d18',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#fff',
  },
  headerTitle: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  runningToolsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffd70020',
    paddingVertical: 8,
    gap: 8,
  },
  runningToolsIcon: {
    fontSize: 14,
  },
  runningToolsText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '500',
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  messagesContainerEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
