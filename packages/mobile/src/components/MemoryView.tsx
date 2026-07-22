import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import type { Memory } from '../types';
import { format } from 'date-fns';

const memoryCategories = [
  { id: 'all', name: 'All', icon: '🧠', color: '#00d4ff' },
  { id: 'code', name: 'Code', icon: '💻', color: '#a855f7' },
  { id: 'idea', name: 'Ideas', icon: '💡', color: '#ffd700' },
  { id: 'fact', name: 'Facts', icon: '📚', color: '#4ade80' },
  { id: 'project', name: 'Project', icon: '📁', color: '#f97316' },
  { id: 'personal', name: 'Personal', icon: '👤', color: '#ec4899' },
];

export const MemoryView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState('fact');

  const memories = useStore((state) => state.memories);
  const addMemory = useStore((state) => state.addMemory);
  const deleteMemory = useStore((state) => state.deleteMemory);
  const accessMemory = useStore((state) => state.accessMemory);
  const memoryEnabled = useStore((state) => state.preferences.memoryEnabled);

  const filteredMemories = useMemo(() => {
    let result = memories;

    if (selectedCategory !== 'all') {
      result = result.filter((m) => m.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.content.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => b.accessCount - a.accessCount);
  }, [memories, selectedCategory, searchQuery]);

  const handleAddMemory = useCallback(() => {
    if (!newMemoryContent.trim()) return;

    addMemory({
      content: newMemoryContent.trim(),
      category: newMemoryCategory,
      importance: 5,
    });

    setNewMemoryContent('');
    setModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newMemoryContent, newMemoryCategory, addMemory]);

  const handleDeleteMemory = useCallback((memoryId: string) => {
    Alert.alert(
      'Delete Memory',
      'Are you sure you want to delete this memory?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMemory(memoryId),
        },
      ]
    );
  }, [deleteMemory]);

  const renderMemory = ({ item: memory }: { item: Memory }) => {
    const categoryInfo = memoryCategories.find((c) => c.id === memory.category) || memoryCategories[3];

    return (
      <TouchableOpacity
        style={styles.memoryCard}
        onPress={() => accessMemory(memory.id)}
        onLongPress={() => handleDeleteMemory(memory.id)}
      >
        <View style={styles.memoryHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
            <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
            <Text style={[styles.categoryName, { color: categoryInfo.color }]}>
              {categoryInfo.name}
            </Text>
          </View>
          <View style={styles.memoryStats}>
            <Text style={styles.accessCount}>👁️ {memory.accessCount}</Text>
            <Text style={styles.importance}>
              {'⭐'.repeat(Math.min(memory.importance, 5))}
            </Text>
          </View>
        </View>

        <Text style={styles.memoryContent} numberOfLines={4}>
          {memory.content}
        </Text>

        <View style={styles.memoryFooter}>
          <Text style={styles.timestamp}>
            Created: {format(new Date(memory.createdAt), 'MMM d, yyyy')}
          </Text>
          <Text style={styles.lastAccessed}>
            Last: {format(new Date(memory.lastAccessedAt), 'MMM d HH:mm')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!memoryEnabled) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledIcon}>🔒</Text>
        <Text style={styles.disabledTitle}>Memory Disabled</Text>
        <Text style={styles.disabledText}>
          Enable Eternal Memory in settings to store and recall information.
        </Text>
        <TouchableOpacity style={styles.enableButton}>
          <Text style={styles.enableButtonText}>Enable Memory</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{memories.length}</Text>
          <Text style={styles.statLabel}>Total Memories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {memories.reduce((acc, m) => acc + m.accessCount, 0)}
          </Text>
          <Text style={styles.statLabel}>Total Accesses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(
              memories.reduce((acc, m) => acc + m.accessCount, 0) / Math.max(memories.length, 1)
            )}
          </Text>
          <Text style={styles.statLabel}>Avg Access</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search memories..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={memoryCategories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && { backgroundColor: item.color + '30', borderColor: item.color },
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text style={styles.categoryChipIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === item.id && { color: item.color },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Memory List */}
      <FlatList
        data={filteredMemories}
        renderItem={renderMemory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧠</Text>
            <Text style={styles.emptyTitle}>No Memories Yet</Text>
            <Text style={styles.emptyText}>
              ZYRAXON will remember important information here.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {filteredMemories.length} memory{filteredMemories.length !== 1 ? 'ies' : ''}
          </Text>
        }
      />

      {/* Add Memory FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Memory Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🧠 Add Memory</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.memoryInput}
              placeholder="What should ZYRAXON remember?"
              placeholderTextColor="#666"
              value={newMemoryContent}
              onChangeText={setNewMemoryContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {memoryCategories.slice(1).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    newMemoryCategory === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '20' },
                  ]}
                  onPress={() => setNewMemoryCategory(cat.id)}
                >
                  <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryOptionText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                !newMemoryContent.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleAddMemory}
              disabled={!newMemoryContent.trim()}
            >
              <Text style={styles.saveButtonText}>Save Memory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  disabledContainer: {
    flex: 1,
    backgroundColor: '#0a0a12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  disabledIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  disabledTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  disabledText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  enableButton: {
    backgroundColor: '#00d4ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  enableButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00d4ff',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    color: '#666',
    fontSize: 16,
    padding: 4,
  },
  categoryList: {
    maxHeight: 44,
  },
  categoryListContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 12,
    color: '#888',
  },
  listContent: {
    padding: 16,
  },
  resultCount: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  memoryCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
  },
  memoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accessCount: {
    fontSize: 11,
    color: '#666',
  },
  importance: {
    fontSize: 10,
    color: '#ffd700',
  },
  memoryContent: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 20,
    marginBottom: 8,
  },
  memoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
  },
  lastAccessed: {
    fontSize: 10,
    color: '#555',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00d4ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#000',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a12',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  memoryInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryOptionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryOptionText: {
    fontSize: 12,
    color: '#888',
  },
  saveButton: {
    backgroundColor: '#00d4ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#333',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
