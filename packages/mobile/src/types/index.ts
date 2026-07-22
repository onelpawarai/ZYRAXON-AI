// Core Types for ZYRAXON Mobile

export type AgentMode = 
  | 'build' 
  | 'plan' 
  | 'beast' 
  | 'pro' 
  | 'apex' 
  | 'dark-emperor' 
  | 'general';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  agentMode?: AgentMode;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio';
  uri?: string;
  name?: string;
  mimeType?: string;
  base64?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface ToolResult {
  callId: string;
  success: boolean;
  output?: string;
  error?: string;
}

export interface Session {
  id: string;
  title: string;
  mode: AgentMode;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isArchived: boolean;
}

export interface Memory {
  id: string;
  content: string;
  category: string;
  importance: number;
  createdAt: number;
  lastAccessedAt: number;
  accessCount: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultMode: AgentMode;
  voiceEnabled: boolean;
  autoScreenVision: boolean;
  notificationsEnabled: boolean;
  memoryEnabled: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  models: string[];
  isConfigured: boolean;
}

export interface AppState {
  // Connection
  isConnected: boolean;
  serverUrl: string;
  
  // Current Session
  currentSession: Session | null;
  sessions: Session[];
  
  // Messages
  messages: Message[];
  isLoading: boolean;
  
  // Agent State
  currentMode: AgentMode;
  availableModes: AgentMode[];
  
  // Memory
  memories: Memory[];
  memoryEnabled: boolean;
  
  // Settings
  preferences: UserPreferences;
  providers: AIProvider[];
  
  // Tools
  availableTools: string[];
  runningTools: ToolCall[];
  
  // UI State
  sidebarOpen: boolean;
  voiceInputActive: boolean;
  screenVisionActive: boolean;
}

// API Types
export interface ChatRequest {
  message: string;
  sessionId?: string;
  mode: AgentMode;
  attachments?: Attachment[];
  context?: string;
}

export interface ChatResponse {
  message: Message;
  sessionId: string;
  tools?: ToolCall[];
}

export interface ToolExecutionRequest {
  toolName: string;
  parameters: Record<string, unknown>;
  sessionId: string;
}

export interface ToolExecutionResponse {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'chat': { sessionId?: string; mode?: AgentMode };
  'settings': undefined;
  'memory': undefined;
  'tools': undefined;
  'providers': undefined;
  'mode-select': undefined;
};

export type TabParamList = {
  'index': undefined;
  'sessions': undefined;
  'tools': undefined;
  'memory': undefined;
  'settings': undefined;
};
