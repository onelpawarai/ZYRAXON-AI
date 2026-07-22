import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import type { Attachment } from '../types';

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const voiceEnabled = useStore((state) => state.preferences.voiceEnabled);
  const setVoiceInputActive = useStore((state) => state.setVoiceInputActive);

  const handleSend = useCallback(() => {
    if (disabled) return;
    
    const trimmedText = text.trim();
    if (!trimmedText && attachments.length === 0) return;

    onSend(trimmedText, attachments);
    setText('');
    setAttachments([]);
    inputRef.current?.blur();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [text, attachments, disabled, onSend]);

  const handleAttach = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newAttachment: Attachment = {
        id: `${Date.now()}`,
        type: asset.type === 'video' ? 'file' : 'image',
        uri: asset.uri,
        name: asset.fileName || 'attachment',
        mimeType: asset.mimeType || undefined,
      };
      setAttachments((prev) => [...prev, newAttachment]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const newAttachment: Attachment = {
        id: `${Date.now()}`,
        type: 'image',
        uri: asset.uri,
        name: `photo_${Date.now()}.jpg`,
      };
      setAttachments((prev) => [...prev, newAttachment]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleVoiceInput = useCallback(async () => {
    if (!voiceEnabled) {
      Alert.alert('Voice Input Disabled', 'Enable voice input in settings to use this feature');
      return;
    }

    setIsRecording(!isRecording);
    setVoiceInputActive(!isRecording);

    if (!isRecording) {
      // Start voice input simulation (in real app, use proper speech recognition)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [voiceEnabled, isRecording, setVoiceInputActive]);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <View style={styles.attachmentsPreview}>
            {attachments.map((attachment) => (
              <View key={attachment.id} style={styles.attachmentItem}>
                {attachment.type === 'image' && attachment.uri && (
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                )}
                <TouchableOpacity
                  style={styles.removeAttachment}
                  onPress={() => handleRemoveAttachment(attachment.id)}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          {/* Attachment Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleAttach}
            disabled={disabled}
          >
            <Text style={styles.icon}>📎</Text>
          </TouchableOpacity>

          {/* Camera Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleCamera}
            disabled={disabled}
          >
            <Text style={styles.icon}>📷</Text>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message ZYRAXON..."
            placeholderTextColor="#666"
            multiline
            maxLength={10000}
            editable={!disabled}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          {/* Voice Button */}
          {voiceEnabled && (
            <TouchableOpacity
              style={[styles.iconButton, isRecording && styles.recordingButton]}
              onPress={handleVoiceInput}
              disabled={disabled}
            >
              <Text style={[styles.icon, isRecording && styles.recordingIcon]}>
                {isRecording ? '⏹️' : '🎤'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!canSend}
          >
            <Text style={[styles.sendIcon, !canSend && styles.sendIconDisabled]}>
              {disabled ? '⏳' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Voice Recording Indicator */}
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Listening...</Text>
            <TouchableOpacity onPress={handleVoiceInput}>
              <Text style={styles.stopText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a12',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  attachmentsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  attachmentItem: {
    position: 'relative',
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeAttachment: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#ff4444',
  },
  icon: {
    fontSize: 20,
  },
  recordingIcon: {
    animation: 'pulse 1s infinite',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 120,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendIcon: {
    fontSize: 18,
    color: '#fff',
  },
  sendIconDisabled: {
    color: '#666',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
  },
  recordingText: {
    color: '#ff4444',
    fontSize: 14,
  },
  stopText: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
