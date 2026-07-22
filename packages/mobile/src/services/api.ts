import { useStore } from '../store/useStore';
import type { ChatRequest, ChatResponse, Message, ToolExecutionRequest, ToolExecutionResponse } from '../types';

// Base API configuration
let baseUrl = 'http://localhost:4096';

export const setApiBaseUrl = (url: string) => {
  baseUrl = url;
};

export const getApiBaseUrl = () => baseUrl;

// Simple fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Request failed: ${endpoint}`, error);
    throw error;
  }
}

// Session API
export const sessionApi = {
  create: async (mode?: string) => {
    return apiRequest<{ id: string }>('/api/session', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  },

  list: async () => {
    return apiRequest<{ sessions: Array<{ id: string; title: string; createdAt: number }> }>('/api/session');
  },

  get: async (sessionId: string) => {
    return apiRequest<{ session: any; messages: Message[] }>(`/api/session/${sessionId}`);
  },

  delete: async (sessionId: string) => {
    return apiRequest<void>(`/api/session/${sessionId}`, { method: 'DELETE' });
  },
};

// Message API
export const messageApi = {
  send: async (request: ChatRequest): Promise<ChatResponse> => {
    const store = useStore.getState();
    
    // Add user message to local state
    const userMessage = store.addMessage({
      role: 'user',
      content: request.message,
      agentMode: request.mode,
    });

    // Store reference for streaming
    let assistantMessageId: string | null = null;

    try {
      // Make streaming request
      const response = await fetch(`${baseUrl}/api/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: request.message,
          sessionId: request.sessionId || store.currentSession?.id,
          mode: request.mode,
          attachments: request.attachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let fullContent = '';
      let toolCalls: any[] = [];

      // Create initial assistant message
      const assistantMessage = store.addMessage({
        role: 'assistant',
        content: '',
        agentMode: request.mode,
      });
      assistantMessageId = assistantMessage.id;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        fullContent += text;

        // Update message content in real-time
        if (assistantMessageId) {
          store.updateMessage(assistantMessageId, { content: fullContent });
        }
      }

      // Update final message
      if (assistantMessageId) {
        store.updateMessage(assistantMessageId, { content: fullContent });
      }

      return {
        message: {
          id: assistantMessageId || '',
          role: 'assistant',
          content: fullContent,
          timestamp: Date.now(),
          agentMode: request.mode,
          toolCalls,
        },
        sessionId: request.sessionId || store.currentSession?.id || '',
      };
    } catch (error) {
      console.error('Send message error:', error);
      
      // Add error message
      if (assistantMessageId) {
        store.updateMessage(assistantMessageId, { 
          content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}` 
        });
      }
      
      throw error;
    }
  },

  list: async (sessionId: string) => {
    return apiRequest<{ messages: Message[] }>(`/api/session/${sessionId}/messages`);
  },

  clear: async (sessionId: string) => {
    return apiRequest<void>(`/api/session/${sessionId}/messages`, { method: 'DELETE' });
  },
};

// Tools API
export const toolsApi = {
  list: async () => {
    return apiRequest<{ tools: string[] }>('/api/tools');
  },

  execute: async (request: ToolExecutionRequest): Promise<ToolExecutionResponse> => {
    const store = useStore.getState();
    const toolId = `${request.toolName}-${Date.now()}`;

    // Add tool to running tools
    store.addRunningTool({
      id: toolId,
      name: request.toolName,
      input: request.parameters,
      status: 'running',
    });

    try {
      const result = await apiRequest<ToolExecutionResponse>('/api/tools/execute', {
        method: 'POST',
        body: JSON.stringify({
          toolName: request.toolName,
          parameters: request.parameters,
          sessionId: request.sessionId,
        }),
      });

      store.updateToolStatus(toolId, 'completed', result.output);

      // Add tool result as message
      store.addMessage({
        role: 'tool',
        content: `Tool ${request.toolName} completed: ${result.output}`,
      });

      return result;
    } catch (error) {
      store.updateToolStatus(
        toolId,
        'error',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  },
};

// Memory API
export const memoryApi = {
  search: async (query: string) => {
    return apiRequest<{ results: any[] }>(`/api/memory/search?q=${encodeURIComponent(query)}`);
  },

  save: async (content: string, category?: string) => {
    return apiRequest<{ id: string }>('/api/memory', {
      method: 'POST',
      body: JSON.stringify({ content, category }),
    });
  },

  list: async () => {
    return apiRequest<{ memories: any[] }>('/api/memory');
  },

  delete: async (memoryId: string) => {
    return apiRequest<void>(`/api/memory/${memoryId}`, { method: 'DELETE' });
  },
};

// Provider API
export const providerApi = {
  list: async () => {
    return apiRequest<{ providers: any[] }>('/api/provider');
  },

  configure: async (providerId: string, config: any) => {
    return apiRequest<void>(`/api/provider/${providerId}/configure`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  test: async (providerId: string) => {
    return apiRequest<{ success: boolean; latency: number }>(`/api/provider/${providerId}/test`, {
      method: 'POST',
    });
  },
};

// Health check
export const healthApi = {
  check: async () => {
    try {
      await apiRequest<{ status: string }>('/api/health');
      useStore.getState().setConnected(true);
      return true;
    } catch {
      useStore.getState().setConnected(false);
      return false;
    }
  },
};

// WebSocket connection for real-time updates (future enhancement)
export const createWebSocket = (onMessage: (data: any) => void) => {
  const ws = new WebSocket(`${baseUrl.replace('http', 'ws')}/ws`);

  ws.onopen = () => {
    console.log('WebSocket connected');
    useStore.getState().setConnected(true);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    useStore.getState().setConnected(false);
  };

  return ws;
};
