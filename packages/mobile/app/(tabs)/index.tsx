import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useStore, agentModes } from '../../src/store/useStore';
import { MessageBubble } from '../../src/components/MessageBubble';
import { ChatInput } from '../../src/components/ChatInput';
import { AgentModeSelector } from '../../src/components/AgentModeSelector';
import type { Message, Attachment } from '../../src/types';

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
  const isConnected = useStore((state) => state.isConnected);
  const getModeConfig = useStore((state) => state.getModeConfig);
  
  const modeConfig = getModeConfig(currentMode);

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

    // Create session if none exists
    if (!currentSession) {
      createSession(currentMode);
    }

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
  }, [currentSession, currentMode, addMessage, setLoading, modeConfig, screenVisionActive]);

  const handleNewChat = useCallback(() => {
    createSession(currentMode);
  }, [currentMode, createSession]);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  ), []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
          <Text style={styles.newChatIcon}>✏️</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerSubtitle}>Mode</Text>
          <Text style={[styles.headerTitleText, { color: modeConfig.color }]}>
            {modeConfig.icon} {modeConfig.name}
          </Text>
        </View>
      </View>
      <AgentModeSelector compact />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyLogo}>🤖</Text>
      <Text style={styles.emptyTitle}>ZYRAXON AI</Text>
      <Text style={styles.emptySubtitle}>All in one. Anything. Nothing is impossible.</Text>
      
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⚡</Text>
          <Text style={styles.featureText}>136+ Tools</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🧠</Text>
          <Text style={styles.featureText}>Eternal Memory</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>👑</Text>
          <Text style={styles.featureText}>7 Agent Modes</Text>
        </View>
      </View>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try asking:</Text>
        {[
          'Build me a React app',
          'Analyze this codebase',
          'Deploy to cloud',
          'Search the web',
        ].map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => handleSend(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      {renderHeader()}

      {/* Running Tools Banner */}
      {runningTools.length > 0 && (
        <View style={styles.runningToolsBanner}>
          <Text style={styles.runningToolsIcon}>⚡</Text>
          <Text style={styles.runningToolsText}>
            {runningTools.length} tool{runningTools.length !== 1 ? 's' : ''} running
          </Text>
          <View style={styles.runningToolsDots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.runningDot, { opacity: 1 - i * 0.3 }]} />
            ))}
          </View>
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
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {}}
            tintColor={modeConfig.color}
          />
        }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: '#0d0d18',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newChatIcon: {
    fontSize: 18,
  },
  headerTitle: {},
  headerSubtitle: {
    fontSize: 10,
    color: '#666',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
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
  runningToolsDots: {
    flexDirection: 'row',
    gap: 4,
  },
  runningDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffd700',
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
  emptyLogo: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresList: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 11,
    color: '#888',
  },
  suggestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
});
