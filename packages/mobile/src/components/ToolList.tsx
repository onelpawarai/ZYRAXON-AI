import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SectionList,
} from 'react-native';
import { useStore } from '../store/useStore';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  isUltra?: boolean;
  isMCP?: boolean;
  isRunning?: boolean;
}

const toolCategories: Record<string, { name: string; icon: string; color: string }> = {
  file: { name: 'File Operations', icon: '📁', color: '#00d4ff' },
  execution: { name: 'Execution', icon: '⚡', color: '#ffd700' },
  web: { name: 'Web & Search', icon: '🌐', color: '#4ade80' },
  ai: { name: 'AI & Memory', icon: '🧠', color: '#a855f7' },
  system: { name: 'System', icon: '🖥️', color: '#f97316' },
  mcp: { name: 'MCP Tools', icon: '🔌', color: '#06b6d4' },
  ultra: { name: 'ULTRA Tools', icon: '🔥', color: '#ef4444' },
};

const toolsData: Tool[] = [
  // File Operations
  { id: 'read', name: 'read', description: 'Read files from filesystem', category: 'file' },
  { id: 'write', name: 'write', description: 'Write content to files', category: 'file' },
  { id: 'edit', name: 'edit', description: 'Edit specific parts of files', category: 'file' },
  { id: 'glob', name: 'glob', description: 'Find files by pattern', category: 'file' },
  { id: 'grep', name: 'grep', description: 'Search file contents', category: 'file' },
  { id: 'apply_patch', name: 'apply_patch', description: 'Apply code patches', category: 'file' },

  // Execution
  { id: 'shell', name: 'shell', description: 'Run shell commands', category: 'execution' },
  { id: 'task', name: 'task', description: 'Create subagent tasks', category: 'execution' },
  { id: 'execute', name: 'execute', description: 'Execute code in sandbox', category: 'execution' },
  { id: 'code-mode', name: 'code-mode', description: 'Execute with full capabilities', category: 'execution' },

  // Web & Search
  { id: 'webfetch', name: 'webfetch', description: 'Fetch web page content', category: 'web' },
  { id: 'websearch', name: 'websearch', description: 'Search the web', category: 'web' },
  { id: 'mcp-websearch', name: 'mcp-websearch', description: 'MCP enhanced web search', category: 'web' },

  // AI & Memory
  { id: 'memory', name: 'memory', description: 'Persistent memory storage', category: 'ai' },
  { id: 'self_evolve', name: 'self_evolve', description: 'Install new tools at runtime', category: 'ai' },
  { id: 'screen_vision', name: 'screen_vision', description: 'Analyze screen contents', category: 'ai' },
  { id: 'api_tester', name: 'api_tester', description: 'Test API endpoints', category: 'ai' },
  { id: 'code_analyzer', name: 'code_analyzer', description: 'Analyze code quality', category: 'ai' },

  // System
  { id: 'system_info', name: 'system_info', description: 'Get system information', category: 'system' },
  { id: 'question', name: 'question', description: 'Ask user questions', category: 'system' },
  { id: 'todo', name: 'todo', description: 'Manage todo items', category: 'system' },
  { id: 'skill', name: 'skill', description: 'Use ZYRAXON skills', category: 'system' },

  // MCP Tools
  { id: 'desktop', name: 'desktop', description: 'Desktop automation', category: 'mcp', isMCP: true },
  { id: 'playwright', name: 'playwright', description: 'Browser automation', category: 'mcp', isMCP: true },
  { id: 'filesystem', name: 'filesystem', description: 'Advanced file operations', category: 'mcp', isMCP: true },
  { id: 'git', name: 'git', description: 'Git operations', category: 'mcp', isMCP: true },
  { id: 'security', name: 'security', description: 'Bug bounty & security tools', category: 'mcp', isMCP: true },

  // ULTRA Tools (DARK EMPEROR Only)
  { id: 'ultraCodeGen', name: 'ultraCodeGen', description: 'Master-level code generation', category: 'ultra', isUltra: true },
  { id: 'ultraAutoDeploy', name: 'ultraAutoDeploy', description: 'One-command cloud deployment', category: 'ultra', isUltra: true },
  { id: 'ultraSecuritySweep', name: 'ultraSecuritySweep', description: 'Complete security audit', category: 'ultra', isUltra: true },
  { id: 'ultraPerformance', name: 'ultraPerformance', description: 'Performance optimization', category: 'ultra', isUltra: true },
  { id: 'ultraRefactor', name: 'ultraRefactor', description: 'AI-powered refactoring', category: 'ultra', isUltra: true },
  { id: 'ultraTestGen', name: 'ultraTestGen', description: 'Comprehensive test generation', category: 'ultra', isUltra: true },
  { id: 'ultraDocGen', name: 'ultraDocGen', description: 'Auto-documentation', category: 'ultra', isUltra: true },
  { id: 'ultraDebug', name: 'ultraDebug', description: 'Advanced debugging engine', category: 'ultra', isUltra: true },
];

export const ToolList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const runningTools = useStore((state) => state.runningTools);
  const currentMode = useStore((state) => state.currentMode);

  const filteredTools = useMemo(() => {
    return toolsData.filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter ULTRA tools for non-DARK EMPEROR modes
      if (tool.isUltra && currentMode !== 'dark-emperor') {
        return false;
      }
      
      return matchesSearch;
    });
  }, [searchQuery, currentMode]);

  const sections = useMemo(() => {
    const grouped: Record<string, Tool[]> = {};
    
    filteredTools.forEach((tool) => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push(tool);
    });

    return Object.entries(grouped).map(([category, data]) => ({
      title: category,
      data,
    }));
  }, [filteredTools]);

  const renderTool = ({ item: tool }: { item: Tool }) => {
    const isRunning = runningTools.some((t) => t.name === tool.name);
    const categoryInfo = toolCategories[tool.category];

    return (
      <View style={styles.toolCard}>
        <View style={[styles.toolIcon, { backgroundColor: categoryInfo.color + '20' }]}>
          <Text style={styles.toolIconText}>
            {isRunning ? '⚡' : categoryInfo.icon}
          </Text>
        </View>
        <View style={styles.toolInfo}>
          <View style={styles.toolHeader}>
            <Text style={styles.toolName}>{tool.name}</Text>
            {tool.isUltra && <View style={styles.ultraBadge}><Text style={styles.ultraBadgeText}>ULTRA</Text></View>}
            {tool.isMCP && <View style={styles.mcpBadge}><Text style={styles.mcpBadgeText}>MCP</Text></View>}
            {isRunning && <View style={styles.runningBadge}><Text style={styles.runningBadgeText}>Running</Text></View>}
          </View>
          <Text style={styles.toolDescription}>{tool.description}</Text>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => {
    const categoryInfo = toolCategories[section.title];
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{categoryInfo.icon}</Text>
        <Text style={[styles.sectionTitle, { color: categoryInfo.color }]}>
          {categoryInfo.name}
        </Text>
        <Text style={styles.sectionCount}>
          {sections.find((s) => s.title === section.title)?.data.length || 0} tools
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tools..."
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

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{toolsData.filter(t => !t.isUltra).length}</Text>
          <Text style={styles.statLabel}>Standard</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{toolsData.filter(t => t.isMCP).length}</Text>
          <Text style={styles.statLabel}>MCP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{toolsData.filter(t => t.isUltra).length}</Text>
          <Text style={styles.statLabel}>ULTRA</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{runningTools.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      {/* Tool List */}
      <SectionList
        sections={sections}
        renderItem={renderTool}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyText}>No tools found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
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
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  sectionCount: {
    fontSize: 11,
    color: '#666',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolIconText: {
    fontSize: 18,
  },
  toolInfo: {
    flex: 1,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'monospace',
  },
  toolDescription: {
    fontSize: 12,
    color: '#888',
  },
  ultraBadge: {
    backgroundColor: '#ef444430',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  ultraBadgeText: {
    fontSize: 8,
    color: '#ef4444',
    fontWeight: '700',
  },
  mcpBadge: {
    backgroundColor: '#06b6d430',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mcpBadgeText: {
    fontSize: 8,
    color: '#06b6d4',
    fontWeight: '600',
  },
  runningBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  runningBadgeText: {
    fontSize: 8,
    color: '#000',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});
