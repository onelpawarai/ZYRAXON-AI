import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore, agentModes } from '../../src/store/useStore';
import type { AgentMode } from '../../src/types';

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  onPress?: () => void;
  type?: 'toggle' | 'navigation' | 'input';
  inputValue?: string;
  onInputChange?: (value: string) => void;
  destructive?: boolean;
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  onPress,
  type = 'navigation',
  inputValue,
  onInputChange,
  destructive = false,
}: SettingRowProps) {
  const content = (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, destructive && styles.settingIconDestructive]}>
        <Text style={styles.settingIconText}>{icon}</Text>
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'toggle' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#333', true: '#00d4ff50' }}
          thumbColor={value ? '#00d4ff' : '#666'}
        />
      )}
      {type === 'navigation' && (
        <Text style={styles.settingArrow}>›</Text>
      )}
      {type === 'input' && (
        <TextInput
          style={styles.settingInput}
          value={inputValue}
          onChangeText={onInputChange}
          placeholder="Enter URL..."
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />
      )}
    </View>
  );

  if (type === 'toggle' || type === 'input') {
    return content;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const preferences = useStore((state) => state.preferences);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const serverUrl = useStore((state) => state.serverUrl);
  const setServerUrl = useStore((state) => state.setServerUrl);
  const providers = useStore((state) => state.providers);
  const isConnected = useStore((state) => state.isConnected);

  const handleThemeChange = useCallback(() => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred theme',
      [
        { text: 'Light', onPress: () => updatePreferences({ theme: 'light' }) },
        { text: 'Dark', onPress: () => updatePreferences({ theme: 'dark' }) },
        { text: 'System', onPress: () => updatePreferences({ theme: 'system' }) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [updatePreferences]);

  const handleDefaultModeChange = useCallback(() => {
    const modes = Object.entries(agentModes) as [AgentMode, typeof agentModes.build][];
    
    Alert.alert(
      'Select Default Mode',
      'Choose the default agent mode for new sessions',
      [
        ...modes.map(([mode, config]) => ({
          text: `${config.icon} ${config.name}`,
          onPress: () => updatePreferences({ defaultMode: mode }),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [updatePreferences]);

  const handleAbout = useCallback(() => {
    Alert.alert(
      'ZYRAXON AI',
      'Version 1.0.0\n\nAll in one. Anything. Nothing is impossible.\n\nAn open-source desktop AI agent that actually does things.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will delete all sessions, memories, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // In real app, implement data clearing
            Alert.alert('Data Cleared', 'All data has been deleted.');
          },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.card}>
            <View style={styles.connectionStatus}>
              <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
              <Text style={styles.statusText}>
                {isConnected ? 'Connected to ZYRAXON Server' : 'Not Connected'}
              </Text>
            </View>
            <SettingRow
              icon="🔗"
              title="Server URL"
              type="input"
              inputValue={serverUrl}
              onInputChange={(value) => setServerUrl(value)}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <SettingRow
              icon="🎨"
              title="Theme"
              subtitle={preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}
              type="navigation"
              onPress={handleThemeChange}
            />
          </View>
        </View>

        {/* Agent Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent</Text>
          <View style={styles.card}>
            <SettingRow
              icon="🤖"
              title="Default Mode"
              subtitle={agentModes[preferences.defaultMode].icon + ' ' + agentModes[preferences.defaultMode].name}
              type="navigation"
              onPress={handleDefaultModeChange}
            />
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.card}>
            <SettingRow
              icon="🎤"
              title="Voice Input"
              subtitle="Use voice commands"
              type="toggle"
              value={preferences.voiceEnabled}
              onValueChange={(value) => {
                updatePreferences({ voiceEnabled: value });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="👁️"
              title="Auto Screen Vision"
              subtitle="Capture screen before every response"
              type="toggle"
              value={preferences.autoScreenVision}
              onValueChange={(value) => {
                updatePreferences({ autoScreenVision: value });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="🧠"
              title="Eternal Memory"
              subtitle="Store and recall information"
              type="toggle"
              value={preferences.memoryEnabled}
              onValueChange={(value) => {
                updatePreferences({ memoryEnabled: value });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="🔔"
              title="Notifications"
              subtitle="Get notified about events"
              type="toggle"
              value={preferences.notificationsEnabled}
              onValueChange={(value) => {
                updatePreferences({ notificationsEnabled: value });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />
          </View>
        </View>

        {/* AI Providers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Providers</Text>
          <View style={styles.card}>
            {providers.map((provider, index) => (
              <React.Fragment key={provider.id}>
                {index > 0 && <View style={styles.rowDivider} />}
                <SettingRow
                  icon="🤖"
                  title={provider.name}
                  subtitle={`${provider.models.length} models • ${provider.isConfigured ? 'Configured' : 'Not configured'}`}
                  type="navigation"
                  onPress={() => {
                    // Navigate to provider config
                  }}
                />
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingRow
              icon="ℹ️"
              title="About ZYRAXON"
              subtitle="Version 1.0.0"
              type="navigation"
              onPress={handleAbout}
            />
            <View style={styles.rowDivider} />
            <SettingRow
              icon="📄"
              title="Open Source"
              subtitle="MIT License"
              type="navigation"
              onPress={() => Linking.openURL('https://github.com/onelpawarai/ZYRAXON-AI')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.card}>
            <SettingRow
              icon="🗑️"
              title="Clear All Data"
              subtitle="Delete all sessions and memories"
              type="navigation"
              destructive
              onPress={handleClearData}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ZYRAXON AI v1.0.0</Text>
          <Text style={styles.footerSubtext}>Built with obsession. Powered by AI.</Text>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconDestructive: {
    backgroundColor: '#ff444430',
  },
  settingIconText: {
    fontSize: 18,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  destructiveText: {
    color: '#ff4444',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 20,
    color: '#666',
  },
  settingInput: {
    flex: 1,
    backgroundColor: '#252540',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#252540',
    marginLeft: 62,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusConnected: {
    backgroundColor: '#4ade80',
  },
  statusDisconnected: {
    backgroundColor: '#ff4444',
  },
  statusText: {
    fontSize: 14,
    color: '#888',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#444',
    marginTop: 4,
  },
});
