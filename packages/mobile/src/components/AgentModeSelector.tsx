import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore, agentModes } from '../store/useStore';
import type { AgentMode } from '../types';

interface AgentModeSelectorProps {
  compact?: boolean;
}

export const AgentModeSelector = ({ compact = false }: AgentModeSelectorProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentMode = useStore((state) => state.currentMode);
  const setMode = useStore((state) => state.setMode);
  const currentModeConfig = useStore((state) => state.getModeConfig(currentMode));

  const handleModeSelect = useCallback((mode: AgentMode) => {
    setMode(mode);
    setModalVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [setMode]);

  const renderModeCard = (mode: AgentMode) => {
    const config = agentModes[mode];
    const isSelected = currentMode === mode;

    return (
      <TouchableOpacity
        key={mode}
        style={[
          styles.modeCard,
          isSelected && { borderColor: config.color, borderWidth: 2 },
        ]}
        onPress={() => handleModeSelect(mode)}
        activeOpacity={0.7}
      >
        <View style={[styles.modeIconContainer, { backgroundColor: config.color + '20' }]}>
          <Text style={styles.modeIcon}>{config.icon}</Text>
        </View>
        <View style={styles.modeInfo}>
          <Text style={[styles.modeName, isSelected && { color: config.color }]}>
            {config.name}
          </Text>
          <Text style={styles.modeDescription} numberOfLines={2}>
            {config.description}
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: config.color }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { borderColor: currentModeConfig.color }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.compactIcon}>{currentModeConfig.icon}</Text>
        <Text style={[styles.compactName, { color: currentModeConfig.color }]}>
          {currentModeConfig.name}
        </Text>
        <Text style={styles.compactArrow}>▼</Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      {/* Header Button */}
      <TouchableOpacity
        style={[styles.headerButton, { borderColor: currentModeConfig.color }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerIcon}>{currentModeConfig.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerLabel}>Mode</Text>
          <Text style={[styles.headerName, { color: currentModeConfig.color }]}>
            {currentModeConfig.name}
          </Text>
        </View>
        <Text style={styles.headerArrow}>›</Text>
      </TouchableOpacity>

      {/* Mode Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👑 Select Agent Mode</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Current Mode Highlight */}
            <View style={[styles.currentModeBanner, { backgroundColor: currentModeConfig.color + '20' }]}>
              <Text style={styles.currentModeIcon}>{currentModeConfig.icon}</Text>
              <View>
                <Text style={styles.currentModeLabel}>Current Mode</Text>
                <Text style={[styles.currentModeName, { color: currentModeConfig.color }]}>
                  {currentModeConfig.name}
                </Text>
              </View>
            </View>

            {/* Mode List */}
            <ScrollView style={styles.modeList} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>⚡ Standard Modes</Text>
              {renderModeCard('build')}
              {renderModeCard('plan')}
              {renderModeCard('general')}

              <Text style={styles.sectionTitle}>🚀 Advanced Modes</Text>
              {renderModeCard('beast')}
              {renderModeCard('pro')}
              {renderModeCard('apex')}

              <Text style={styles.sectionTitle}>👑 Exclusive Modes</Text>
              {renderModeCard('dark-emperor')}

              <View style={styles.spacer} />
            </ScrollView>

            {/* Mode Description */}
            <View style={styles.modeDescriptionContainer}>
              <Text style={[styles.modeDescriptionTitle, { color: currentModeConfig.color }]}>
                {currentModeConfig.icon} {currentModeConfig.name}
              </Text>
              <Text style={styles.modeDescriptionText}>
                {currentModeConfig.description}
              </Text>
              
              {/* Show available tools for DARK EMPEROR */}
              {currentMode === 'dark-emperor' && (
                <View style={styles.ultraToolsContainer}>
                  <Text style={styles.ultraToolsTitle}>🔥 ULTRA Tools (8)</Text>
                  <View style={styles.ultraToolsGrid}>
                    {[
                      'ultraCodeGen',
                      'ultraAutoDeploy',
                      'ultraSecuritySweep',
                      'ultraPerformance',
                      'ultraRefactor',
                      'ultraTestGen',
                      'ultraDocGen',
                      'ultraDebug',
                    ].map((tool) => (
                      <View key={tool} style={styles.ultraToolChip}>
                        <Text style={styles.ultraToolText}>{tool}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Compact Button
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  compactIcon: {
    fontSize: 16,
  },
  compactName: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactArrow: {
    fontSize: 8,
    color: '#666',
  },

  // Header Button
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  headerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerArrow: {
    fontSize: 20,
    color: '#666',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },

  // Current Mode Banner
  currentModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  currentModeIcon: {
    fontSize: 32,
  },
  currentModeLabel: {
    fontSize: 12,
    color: '#888',
  },
  currentModeName: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Mode List
  modeList: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  modeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    fontSize: 24,
  },
  modeInfo: {
    flex: 1,
  },
  modeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 12,
    color: '#888',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },

  // Mode Description
  modeDescriptionContainer: {
    padding: 16,
    backgroundColor: '#0d0d18',
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  modeDescriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeDescriptionText: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
  },
  ultraToolsContainer: {
    marginTop: 12,
  },
  ultraToolsTitle: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '600',
    marginBottom: 8,
  },
  ultraToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ultraToolChip: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b35',
  },
  ultraToolText: {
    fontSize: 10,
    color: '#ff6b35',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

// Add Platform import fix
import { Platform } from 'react-native';
