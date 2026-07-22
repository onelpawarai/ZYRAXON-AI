import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import type { Message } from '../types';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
}

export const MessageBubble = memo(({ message, onRetry }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isTool = message.role === 'tool';
  
  const modeConfig = useStore((state) => 
    message.agentMode ? state.getModeConfig(message.agentMode) : null
  );

  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View
        style={[
          styles.bubble,
          isUser && styles.userBubble,
          isTool && styles.toolBubble,
          isAssistant && modeConfig && { borderLeftColor: modeConfig.color, borderLeftWidth: 3 },
        ]}
      >
        {/* Role indicator */}
        {(isTool || isAssistant) && modeConfig && (
          <View style={styles.roleIndicator}>
            <Text style={[styles.roleIcon]}>{modeConfig.icon}</Text>
            <Text style={[styles.roleName, { color: modeConfig.color }]}>
              {modeConfig.name}
            </Text>
          </View>
        )}

        {/* Content */}
        <Text style={[styles.content, isUser && styles.userContent]}>
          {message.content}
        </Text>

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <View style={styles.toolCallsContainer}>
            <Text style={styles.toolCallsTitle}>🔧 Tools Used:</Text>
            {message.toolCalls.map((tool, index) => (
              <View key={index} style={styles.toolCall}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolStatus}>
                  {tool.status === 'pending' && '⏳ Pending'}
                  {tool.status === 'running' && '⚡ Running...'}
                  {tool.status === 'completed' && '✅ Done'}
                  {tool.status === 'error' && '❌ Error'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachment}>
                <Text style={styles.attachmentIcon}>
                  {attachment.type === 'image' && '🖼️'}
                  {attachment.type === 'audio' && '🎤'}
                  {attachment.type === 'file' && '📎'}
                </Text>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {attachment.name || 'Attachment'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>

        {/* Retry button for errors */}
        {isAssistant && onRetry && message.content.startsWith('Error:') && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>🔄 Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  userBubble: {
    backgroundColor: '#0a3d62',
    borderColor: '#0a5d8a',
  },
  toolBubble: {
    backgroundColor: '#2d2d44',
    borderColor: '#4a4a6e',
    borderStyle: 'dashed',
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  roleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  roleName: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 22,
  },
  userContent: {
    color: '#ffffff',
  },
  toolCallsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  toolCallsTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  toolCall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  toolName: {
    color: '#00d4ff',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8,
  },
  toolStatus: {
    color: '#888',
    fontSize: 12,
  },
  attachmentsContainer: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252540',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  attachmentIcon: {
    marginRight: 6,
  },
  attachmentName: {
    color: '#aaa',
    fontSize: 12,
    maxWidth: 120,
  },
  timestamp: {
    color: '#666',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'right',
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#ff6b35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
