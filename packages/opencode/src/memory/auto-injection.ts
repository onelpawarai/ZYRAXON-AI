// ZYRAXON Auto-Injection Memory System
// Automatically injects context before every response
// NEVER forgets anything - eternal memory

import fs from "fs/promises"
import path from "path"
import { Global } from "@opencode-ai/core/global"

const MEMORY_DIR = path.join(Global.Path.data, "memory")
const AUTO_CONTEXT_FILE = path.join(MEMORY_DIR, "auto_context.json")
const CONVERSATION_LOG = path.join(MEMORY_DIR, "conversation_log.json")

export interface MemoryEntry {
  key: string
  content: string
  tags: string[]
  timestamp: number
  importance: number
  accessCount: number
  lastAccessed: number
  source: "auto" | "manual" | "injected"
}

export interface ConversationTurn {
  id: string
  timestamp: number
  userMessage: string
  assistantResponse: string
  agent: string
  model: string
  context: string
  tags: string[]
}

export interface AutoContext {
  enabled: boolean
  lastInjection: number
  injectedCount: number
  totalMemories: number
  recentContext: string
  userPreferences: Record<string, string>
  projectContext: string
  sessionHistory: string[]
}

let cachedContext: AutoContext | null = null
let cachedMemories: MemoryEntry[] | null = null

async function ensureMemoryDir() {
  try {
    await fs.access(MEMORY_DIR)
  } catch {
    await fs.mkdir(MEMORY_DIR, { recursive: true })
  }
}

async function loadAutoContext(): Promise<AutoContext> {
  if (cachedContext) return cachedContext
  try {
    await ensureMemoryDir()
    const data = await fs.readFile(AUTO_CONTEXT_FILE, "utf-8")
    cachedContext = JSON.parse(data) as AutoContext
    return cachedContext
  } catch {
    cachedContext = {
      enabled: true,
      lastInjection: 0,
      injectedCount: 0,
      totalMemories: 0,
      recentContext: "",
      userPreferences: {},
      projectContext: "",
      sessionHistory: [],
    }
    return cachedContext
  }
}

async function saveAutoContext(context: AutoContext) {
  await ensureMemoryDir()
  cachedContext = context
  await fs.writeFile(AUTO_CONTEXT_FILE, JSON.stringify(context, null, 2))
}

async function loadMemories(): Promise<MemoryEntry[]> {
  if (cachedMemories) return cachedMemories
  try {
    await ensureMemoryDir()
    const data = await fs.readFile(path.join(MEMORY_DIR, "memories.json"), "utf-8")
    const store = JSON.parse(data) as { memories: MemoryEntry[] }
    cachedMemories = store.memories || []
    return cachedMemories
  } catch {
    cachedMemories = []
    return cachedMemories
  }
}

// AUTO-INJECT: Generate context before every response
export async function autoInjectContext(userMessage: string, agent: string): Promise<string> {
  const context = await loadAutoContext()
  const memories = await loadMemories()
  
  const now = Date.now()
  const parts: string[] = []
  
  // 1. Recent conversation context
  if (context.recentContext) {
    parts.push(`Recent context:\n${context.recentContext}`)
  }
  
  // 2. User preferences
  if (Object.keys(context.userPreferences).length > 0) {
    const prefs = Object.entries(context.userPreferences)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n")
    parts.push(`User preferences:\n${prefs}`)
  }
  
  // 3. Project context
  if (context.projectContext) {
    parts.push(`Project context:\n${context.projectContext}`)
  }
  
  // 4. Relevant memories (top 10 by importance)
  const relevantMemories = memories
    .filter(m => {
      const queryLower = userMessage.toLowerCase()
      const contentLower = m.content.toLowerCase()
      const keyLower = m.key.toLowerCase()
      
      // Check if any word in query matches memory
      const queryWords = queryLower.split(/\s+/)
      return queryWords.some(word => 
        keyLower.includes(word) || contentLower.includes(word)
      )
    })
    .sort((a, b) => (b.importance * 3 + b.accessCount) - (a.importance * 3 + a.accessCount))
    .slice(0, 10)
  
  if (relevantMemories.length > 0) {
    const memStr = relevantMemories.map(m => 
      `- [${m.importance}/10] ${m.key}: ${m.content.substring(0, 200)}`
    ).join("\n")
    parts.push(`Relevant memories:\n${memStr}`)
  }
  
  // 5. Session history (last 5 messages)
  if (context.sessionHistory.length > 0) {
    const recent = context.sessionHistory.slice(-5)
    parts.push(`Recent messages:\n${recent.join("\n")}`)
  }
  
  // Update injection stats
  context.lastInjection = now
  context.injectedCount++
  context.totalMemories = memories.length
  await saveAutoContext(context)
  
  if (parts.length === 0) return ""
  
  return `[AUTO-CONTEXT INJECTION]\n${parts.join("\n\n")}\n[/AUTO-CONTEXT INJECTION]\n\n`
}

// STORE: Automatically store conversation turns
export async function autoStoreConversation(
  userMessage: string,
  assistantResponse: string,
  agent: string,
  model: string
): Promise<void> {
  const context = await loadAutoContext()
  const memories = await loadMemories()
  
  const now = Date.now()
  
  // Create conversation turn
  const turn: ConversationTurn = {
    id: `turn_${now}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now,
    userMessage,
    assistantResponse,
    agent,
    model,
    context: "",
    tags: extractTags(userMessage + " " + assistantResponse),
  }
  
  // Store as memory if important
  const importance = calculateImportance(userMessage, assistantResponse)
  if (importance >= 3) {
    const memory: MemoryEntry = {
      key: extractKey(userMessage),
      content: userMessage.substring(0, 500),
      tags: turn.tags,
      timestamp: now,
      importance,
      accessCount: 0,
      lastAccessed: now,
      source: "auto",
    }
    
    memories.push(memory)
    await saveMemories(memories)
  }
  
  // Update recent context
  context.recentContext = `User: ${userMessage.substring(0, 200)}\nAssistant: ${assistantResponse.substring(0, 200)}`
  context.sessionHistory.push(`User: ${userMessage.substring(0, 100)}`)
  if (context.sessionHistory.length > 20) {
    context.sessionHistory = context.sessionHistory.slice(-20)
  }
  
  // Extract and store user preferences
  const prefs = extractPreferences(userMessage)
  for (const [key, value] of Object.entries(prefs)) {
    context.userPreferences[key] = value
  }
  
  await saveAutoContext(context)
}

// LEARN: Extract and store patterns
export async function autoLearnPattern(pattern: string, context: string): Promise<void> {
  const memories = await loadMemories()
  const now = Date.now()
  
  const memory: MemoryEntry = {
    key: `pattern_${now}`,
    content: `${pattern}\nContext: ${context}`,
    tags: ["pattern", "learned"],
    timestamp: now,
    importance: 7,
    accessCount: 0,
    lastAccessed: now,
    source: "auto",
  }
  
  memories.push(memory)
  await saveMemories(memories)
}

// REMEMBER: Smart recall with context
export async function smartRecall(query: string): Promise<string> {
  const memories = await loadMemories()
  const context = await loadAutoContext()
  
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)
  
  // Score memories
  const scored = memories.map(m => {
    let score = 0
    const contentLower = m.content.toLowerCase()
    const keyLower = m.key.toLowerCase()
    
    // Exact matches
    if (keyLower.includes(queryLower)) score += 100
    if (contentLower.includes(queryLower)) score += 50
    
    // Word matches
    for (const word of queryWords) {
      if (keyLower.includes(word)) score += 20
      if (contentLower.includes(word)) score += 10
      if (m.tags.some(t => t.includes(word))) score += 15
    }
    
    // Importance bonus
    score += m.importance * 5
    
    // Recency bonus
    const age = Date.now() - m.timestamp
    const daysOld = age / (1000 * 60 * 60 * 24)
    if (daysOld < 1) score += 30
    else if (daysOld < 7) score += 20
    else if (daysOld < 30) score += 10
    
    // Access frequency bonus
    score += Math.min(m.accessCount * 3, 30)
    
    return { memory: m, score }
  })
  
  // Get top results
  const results = scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
  
  if (results.length === 0) {
    return "No relevant memories found."
  }
  
  // Update access counts
  for (const r of results) {
    r.memory.accessCount++
    r.memory.lastAccessed = Date.now()
  }
  await saveMemories(memories)
  
  // Format output
  const output = results.map(r => {
    const age = Date.now() - r.memory.timestamp
    const daysOld = Math.floor(age / (1000 * 60 * 60 * 24))
    let recency = ""
    if (daysOld === 0) recency = "today"
    else if (daysOld === 1) recency = "yesterday"
    else if (daysOld < 7) recency = `${daysOld} days ago`
    else if (daysOld < 30) recency = `${Math.floor(daysOld / 7)} weeks ago`
    else recency = `${Math.floor(daysOld / 30)} months ago`
    
    return `[${r.memory.importance}/10] ${r.memory.key} (${recency}):\n${r.memory.content.substring(0, 300)}`
  }).join("\n\n")
  
  return output
}

// Helper functions
function extractTags(text: string): string[] {
  const tags: string[] = []
  const lower = text.toLowerCase()
  
  if (lower.includes('bug') || lower.includes('error')) tags.push('bug')
  if (lower.includes('feature') || lower.includes('add')) tags.push('feature')
  if (lower.includes('fix') || lower.includes('resolve')) tags.push('fix')
  if (lower.includes('test')) tags.push('test')
  if (lower.includes('deploy')) tags.push('deploy')
  if (lower.includes('security')) tags.push('security')
  if (lower.includes('performance')) tags.push('performance')
  if (lower.includes('ui') || lower.includes('frontend')) tags.push('ui')
  if (lower.includes('api') || lower.includes('backend')) tags.push('api')
  if (lower.includes('database') || lower.includes('db')) tags.push('database')
  
  return tags.slice(0, 5)
}

function extractKey(text: string): string {
  // Extract key phrase from text
  const words = text.split(/\s+/).slice(0, 10)
  return words.join('_').substring(0, 50)
}

function calculateImportance(userMessage: string, assistantResponse: string): number {
  let importance = 5 // default
  
  const combined = (userMessage + " " + assistantResponse).toLowerCase()
  
  // Boost importance for certain keywords
  if (combined.includes('important') || combined.includes('critical')) importance += 2
  if (combined.includes('bug') || combined.includes('error')) importance += 1
  if (combined.includes('feature') || combined.includes('implementation')) importance += 1
  if (combined.includes('decision') || combined.includes('chose')) importance += 2
  if (combined.includes('preference') || combined.includes('prefer')) importance += 2
  if (combined.includes('always') || combined.includes('never')) importance += 1
  
  // Longer responses often more important
  if (assistantResponse.length > 500) importance += 1
  if (assistantResponse.length > 1000) importance += 1
  
  return Math.min(10, Math.max(1, importance))
}

function extractPreferences(text: string): Record<string, string> {
  const prefs: Record<string, string> = {}
  const lower = text.toLowerCase()
  
  if (lower.includes('prefer') || lower.includes('like')) {
    if (lower.includes('typescript')) prefs['language'] = 'TypeScript'
    if (lower.includes('javascript')) prefs['language'] = 'JavaScript'
    if (lower.includes('python')) prefs['language'] = 'Python'
    if (lower.includes('dark mode')) prefs['theme'] = 'dark'
    if (lower.includes('light mode')) prefs['theme'] = 'light'
  }
  
  return prefs
}

// Export functions
export const autoMemory = {
  autoInjectContext,
  autoStoreConversation,
  autoLearnPattern,
  smartRecall,
  loadAutoContext,
  saveAutoContext,
  loadMemories,
}
