import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  Session, 
  Message, 
  Memory, 
  AgentMode, 
  UserPreferences,
  AIProvider,
  ToolCall
} from '../types';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'dark',
  defaultMode: 'build',
  voiceEnabled: true,
  autoScreenVision: true,
  notificationsEnabled: true,
  memoryEnabled: true,
};

// Agent modes configuration
const agentModes: Record<AgentMode, { name: string; icon: string; color: string; description: string }> = {
  build: {
    name: 'Build',
    icon: '🔨',
    color: '#00d4ff',
    description: 'Reliable workhorse for coding tasks'
  },
  plan: {
    name: 'Plan',
    icon: '📋',
    color: '#ffd700',
    description: 'Strategic analysis and planning'
  },
  beast: {
    name: 'Beast',
    icon: '🦁',
    color: '#ff6b35',
    description: 'Maximum power with self-healing'
  },
  pro: {
    name: 'PRO',
    icon: '⚡',
    color: '#a855f7',
    description: 'Professional with unlimited memory'
  },
  apex: {
    name: 'APEX',
    icon: '🦅',
    color: '#ef4444',
    description: 'Predator mode with eternal memory'
  },
  'dark-emperor': {
    name: 'DARK EMPEROR',
    icon: '👑',
    color: '#8b5cf6',
    description: 'Supreme mode - Zero Refusal'
  },
  general: {
    name: 'General',
    icon: '🤖',
    color: '#6b7280',
    description: 'General purpose assistant'
  },
};

interface ZYRAXONStore {
  // Connection State
  isConnected: boolean;
  serverUrl: string;
  setConnected: (connected: boolean) => void;
  setServerUrl: (url: string) => void;

  // Sessions
  sessions: Session[];
  currentSession: Session | null;
  createSession: (mode?: AgentMode, title?: string) => Session;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  archiveSession: (sessionId: string) => void;
  pinSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;

  // Messages
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearMessages: () => void;

  // Agent Mode
  currentMode: AgentMode;
  setMode: (mode: AgentMode) => void;
  getModeConfig: (mode: AgentMode) => typeof agentModes.build;

  // Memory
  memories: Memory[];
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'lastAccessedAt' | 'accessCount'>) => void;
  accessMemory: (memoryId: string) => void;
  deleteMemory: (memoryId: string) => void;
  searchMemory: (query: string) => Memory[];

  // Preferences
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  // AI Providers
  providers: AIProvider[];
  setProviderConfigured: (providerId: string, configured: boolean) => void;

  // Tools
  availableTools: string[];
  runningTools: ToolCall[];
  addRunningTool: (tool: ToolCall) => void;
  updateToolStatus: (toolId: string, status: ToolCall['status'], output?: string, error?: string) => void;
  removeTool: (toolId: string) => void;

  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  voiceInputActive: boolean;
  setVoiceInputActive: (active: boolean) => void;
  screenVisionActive: boolean;
  setScreenVisionActive: (active: boolean) => void;
}

export const useStore = create<ZYRAXONStore>()(
  persist(
    (set, get) => ({
      // Connection State
      isConnected: false,
      serverUrl: 'http://localhost:4096',
      setConnected: (connected) => set({ isConnected: connected }),
      setServerUrl: (url) => set({ serverUrl: url }),

      // Sessions
      sessions: [],
      currentSession: null,

      createSession: (mode = 'build', title) => {
        const session: Session = {
          id: generateId(),
          title: title || `New ${agentModes[mode].name} Session`,
          mode,
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
          isArchived: false,
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          currentSession: session,
          currentMode: mode,
          messages: [],
        }));
        return session;
      },

      selectSession: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          set({
            currentSession: session,
            currentMode: session.mode,
            messages: session.messages,
          });
        }
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId);
          return {
            sessions: newSessions,
            currentSession: state.currentSession?.id === sessionId 
              ? (newSessions[0] || null) 
              : state.currentSession,
          };
        });
      },

      archiveSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, isArchived: true } : s
          ),
        }));
      },

      pinSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
          ),
        }));
      },

      updateSessionTitle: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, title, updatedAt: Date.now() } : s
          ),
          currentSession: state.currentSession?.id === sessionId
            ? { ...state.currentSession, title, updatedAt: Date.now() }
            : state.currentSession,
        }));
      },

      // Messages
      messages: [],

      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                messages: [...state.currentSession.messages, newMessage],
                updatedAt: Date.now(),
              }
            : state.currentSession,
          sessions: state.sessions.map((s) =>
            s.id === state.currentSession?.id
              ? { ...s, messages: [...s.messages, newMessage], updatedAt: Date.now() }
              : s
          ),
        }));
        return newMessage;
      },

      updateMessage: (messageId, updates) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
        }));
      },

      clearMessages: () => {
        set((state) => ({
          messages: [],
          currentSession: state.currentSession
            ? { ...state.currentSession, messages: [] }
            : state.currentSession,
        }));
      },

      // Agent Mode
      currentMode: 'build',
      setMode: (mode) => set({ currentMode: mode }),
      getModeConfig: (mode) => agentModes[mode],

      // Memory
      memories: [],

      addMemory: (memory) => {
        const newMemory: Memory = {
          ...memory,
          id: generateId(),
          createdAt: Date.now(),
          lastAccessedAt: Date.now(),
          accessCount: 0,
        };
        set((state) => ({ memories: [...state.memories, newMemory] }));
      },

      accessMemory: (memoryId) => {
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === memoryId
              ? { ...m, lastAccessedAt: Date.now(), accessCount: m.accessCount + 1 }
              : m
          ),
        }));
      },

      deleteMemory: (memoryId) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== memoryId),
        }));
      },

      searchMemory: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().memories.filter(
          (m) =>
            m.content.toLowerCase().includes(lowerQuery) ||
            m.category.toLowerCase().includes(lowerQuery)
        );
      },

      // Preferences
      preferences: defaultPreferences,
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
      },

      // AI Providers
      providers: [
        { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'], isConfigured: false },
        { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet', 'claude-3-opus'], isConfigured: false },
        { id: 'google', name: 'Google', models: ['gemini-1.5-pro', 'gemini-1.5-flash'], isConfigured: false },
        { id: 'azure', name: 'Azure OpenAI', models: ['gpt-4o', 'gpt-4-turbo'], isConfigured: false },
        { id: 'xai', name: 'xAI', models: ['grok-2', 'grok-2-mini'], isConfigured: false },
      ],
      setProviderConfigured: (providerId, configured) => {
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId ? { ...p, isConfigured: configured } : p
          ),
        }));
      },

      // Tools
      availableTools: [
        'read', 'write', 'edit', 'glob', 'grep',
        'shell', 'task', 'execute',
        'webfetch', 'websearch',
        'memory', 'self_evolve',
        'screen_vision', 'api_tester', 'code_analyzer', 'system_info',
        'question', 'todo', 'skill',
        // MCP Tools
        'desktop', 'playwright', 'fetch', 'filesystem', 'git', 'security',
        // Ultra Tools (DARK EMPEROR only)
        'ultraCodeGen', 'ultraAutoDeploy', 'ultraSecuritySweep', 'ultraPerformance',
        'ultraRefactor', 'ultraTestGen', 'ultraDocGen', 'ultraDebug',
      ],
      runningTools: [],

      addRunningTool: (tool) => {
        set((state) => ({ runningTools: [...state.runningTools, tool] }));
      },

      updateToolStatus: (toolId, status, output, error) => {
        set((state) => ({
          runningTools: state.runningTools.map((t) =>
            t.id === toolId ? { ...t, status, ...(output && { input: { ...t.input, _output: output } }), ...(error && { input: { ...t.input, _error: error } }) } : t
          ),
        }));
      },

      removeTool: (toolId) => {
        set((state) => ({
          runningTools: state.runningTools.filter((t) => t.id !== toolId),
        }));
      },

      // UI State
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      voiceInputActive: false,
      setVoiceInputActive: (active) => set({ voiceInputActive: active }),
      screenVisionActive: false,
      setScreenVisionActive: (active) => set({ screenVisionActive: active }),
    }),
    {
      name: 'zyraxon-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        memories: state.memories,
        preferences: state.preferences,
        providers: state.providers,
        serverUrl: state.serverUrl,
      }),
    }
  )
);

// Export agent modes for convenience
export { agentModes };
