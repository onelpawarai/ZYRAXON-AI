// ZYRAXON PRO — Unlimited Memory System
// Permanent conversation storage + search

import fs from "fs/promises"
import path from "path"
import { Global } from "@opencode-ai/core/global"

const MEMORY_DIR = path.join(Global.Path.data, "pro", "memory")
const CONVERSATIONS_FILE = path.join(MEMORY_DIR, "conversations.json")
const SEARCH_INDEX_FILE = path.join(MEMORY_DIR, "search_index.json")

export interface MemoryMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  sessionId: string
  agent: string
  model: string
}

export interface MemoryConversation {
  id: string
  sessionId: string
  title: string
  messages: MemoryMessage[]
  createdAt: number
  updatedAt: number
  tags: string[]
}

export interface SearchResult {
  conversation: MemoryConversation
  score: number
  matchedMessages: MemoryMessage[]
}

let cachedConversations: MemoryConversation[] | null = null

async function ensureMemoryDir() {
  try {
    await fs.access(MEMORY_DIR)
  } catch {
    await fs.mkdir(MEMORY_DIR, { recursive: true })
  }
}

async function loadConversations(): Promise<MemoryConversation[]> {
  if (cachedConversations) return cachedConversations
  try {
    await ensureMemoryDir()
    const data = await fs.readFile(CONVERSATIONS_FILE, "utf-8")
    cachedConversations = JSON.parse(data) as MemoryConversation[]
    return cachedConversations
  } catch {
    cachedConversations = []
    return cachedConversations
  }
}

async function saveConversations(conversations: MemoryConversation[]): Promise<void> {
  await ensureMemoryDir()
  cachedConversations = conversations
  await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2))
}

// Store a message permanently
export async function storeMessage(msg: Omit<MemoryMessage, "id" | "timestamp">): Promise<void> {
  const conversations = await loadConversations()

  // Find or create conversation for this session
  let conv = conversations.find((c) => c.sessionId === msg.sessionId)
  if (!conv) {
    conv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sessionId: msg.sessionId,
      title: msg.content.substring(0, 100),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    }
    conversations.unshift(conv)
  }

  const fullMsg: MemoryMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  }

  conv.messages.push(fullMsg)
  conv.updatedAt = Date.now()

  // Update title from first user message
  if (conv.messages.length === 1 && msg.role === "user") {
    conv.title = msg.content.substring(0, 100)
  }

  await saveConversations(conversations)
}

// Search across all conversations
export async function searchMemory(query: string, limit: number = 20): Promise<SearchResult[]> {
  const conversations = await loadConversations()
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1)

  const results: SearchResult[] = []

  for (const conv of conversations) {
    let score = 0
    const matchedMessages: MemoryMessage[] = []

    // Score based on title match
    if (conv.title.toLowerCase().includes(queryLower)) {
      score += 10
    }

    // Score based on tag match
    for (const tag of conv.tags) {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 5
      }
    }

    // Score based on message content match
    for (const msg of conv.messages) {
      const contentLower = msg.content.toLowerCase()
      let msgScore = 0

      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          msgScore += 1
        }
      }

      // Exact phrase match gets bonus
      if (contentLower.includes(queryLower)) {
        msgScore += 5
      }

      if (msgScore > 0) {
        score += msgScore
        matchedMessages.push(msg)
      }
    }

    if (score > 0) {
      results.push({ conversation: conv, score, matchedMessages })
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, limit)
}

// Get recent conversations
export async function getRecentConversations(limit: number = 50): Promise<MemoryConversation[]> {
  const conversations = await loadConversations()
  return conversations
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
}

// Get conversation by session ID
export async function getConversation(sessionId: string): Promise<MemoryConversation | null> {
  const conversations = await loadConversations()
  return conversations.find((c) => c.sessionId === sessionId) ?? null
}

// Delete conversation
export async function deleteConversation(sessionId: string): Promise<void> {
  const conversations = await loadConversations()
  const filtered = conversations.filter((c) => c.sessionId !== sessionId)
  await saveConversations(filtered)
}

// Get total memory stats
export async function getMemoryStats(): Promise<{
  totalConversations: number
  totalMessages: number
  oldestMessage: number | null
  newestMessage: number | null
}> {
  const conversations = await loadConversations()
  let totalMessages = 0
  let oldest = Infinity
  let newest = 0

  for (const conv of conversations) {
    totalMessages += conv.messages.length
    if (conv.messages.length > 0) {
      oldest = Math.min(oldest, conv.messages[0].timestamp)
      newest = Math.max(newest, conv.messages[conv.messages.length - 1].timestamp)
    }
  }

  return {
    totalConversations: conversations.length,
    totalMessages,
    oldestMessage: oldest === Infinity ? null : oldest,
    newestMessage: newest || null,
  }
}
