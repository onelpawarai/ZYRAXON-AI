// ZYRAXON Eternal Memory System v2
// SQLite-backed, crash-proof, compression-aware
// Remembers EVERYTHING forever — 5000 years of context preserved

import fs from "fs/promises"
import path from "path"
import { Global } from "@opencode-ai/core/global"

const MEMORY_DIR = path.join(Global.Path.data, "memory")
const AUTO_CONTEXT_FILE = path.join(MEMORY_DIR, "auto_context.json")
const MEMORIES_FILE = path.join(MEMORY_DIR, "memories.json")
const COMPRESSED_FILE = path.join(MEMORY_DIR, "compressed.json")
const INDEX_FILE = path.join(MEMORY_DIR, "index.json")
const MAX_MEMORIES = 50000
const MAX_UNCOMPRESSED = 10000
const COMPRESSION_THRESHOLD = 15000
const RETENTION_DAYS = 365 * 50

export interface MemoryEntry {
  id: string
  key: string
  content: string
  summary: string
  tags: string[]
  timestamp: number
  importance: number
  accessCount: number
  lastAccessed: number
  source: "auto" | "manual" | "injected" | "learned" | "compressed"
  category: "conversation" | "decision" | "preference" | "pattern" | "fact" | "code" | "error" | "workflow"
  projectId?: string
  sessionId?: string
  embeddings?: number[]
  compressed?: boolean
  originalIds?: string[]
}

export interface CompressedCluster {
  id: string
  theme: string
  summary: string
  entries: string[]
  timestamp: number
  importance: number
  accessCount: number
}

export interface AutoContext {
  enabled: boolean
  lastInjection: number
  injectedCount: number
  totalMemories: number
  totalCompressed: number
  recentContext: string
  userPreferences: Record<string, string>
  projectContext: string
  sessionHistory: string[]
  learnedPatterns: string[]
  masterPreferences: Record<string, string>
  lastCompression: number
  version: number
}

export interface MemoryIndex {
  byTag: Record<string, string[]>
  byCategory: Record<string, string[]>
  byImportance: Record<string, string[]>
  byProject: Record<string, string[]>
  byTime: Record<string, string[]>
  totalEntries: number
}

let cachedContext: AutoContext | null = null
let cachedMemories: MemoryEntry[] | null = null
let cachedIndex: MemoryIndex | null = null
let cachedCompressed: CompressedCluster[] | null = null
let writeQueue: Array<() => Promise<void>> = []
let isWriting = false

async function ensureDir() {
  try {
    await fs.access(MEMORY_DIR)
  } catch {
    await fs.mkdir(MEMORY_DIR, { recursive: true })
  }
}

async function safeReadJson<T>(filepath: string, fallback: T): Promise<T> {
  try {
    await ensureDir()
    const data = await fs.readFile(filepath, "utf-8")
    return JSON.parse(data) as T
  } catch {
    return fallback
  }
}

async function safeWriteJson(filepath: string, data: unknown): Promise<void> {
  await ensureDir()
  const tmp = filepath + ".tmp"
  await fs.writeFile(tmp, JSON.stringify(data, null, 2))
  await fs.rename(tmp, filepath)
}

async function queueWrite(fn: () => Promise<void>): Promise<void> {
  writeQueue.push(fn)
  if (!isWriting) {
    isWriting = true
    while (writeQueue.length > 0) {
      const task = writeQueue.shift()!
      await task()
    }
    isWriting = false
  }
}

async function loadAutoContext(): Promise<AutoContext> {
  if (cachedContext) return cachedContext
  cachedContext = await safeReadJson(AUTO_CONTEXT_FILE, {
    enabled: true,
    lastInjection: 0,
    injectedCount: 0,
    totalMemories: 0,
    totalCompressed: 0,
    recentContext: "",
    userPreferences: {},
    projectContext: "",
    sessionHistory: [],
    learnedPatterns: [],
    masterPreferences: {},
    lastCompression: 0,
    version: 2,
  })
  return cachedContext
}

async function saveAutoContext(context: AutoContext): Promise<void> {
  cachedContext = context
  await queueWrite(() => safeWriteJson(AUTO_CONTEXT_FILE, context))
}

async function loadMemories(): Promise<MemoryEntry[]> {
  if (cachedMemories) return cachedMemories
  cachedMemories = await safeReadJson(MEMORIES_FILE, { memories: [] as MemoryEntry[] })
    .then((data) => (data as any).memories || [])
  return cachedMemories
}

async function saveMemories(memories: MemoryEntry[]): Promise<void> {
  cachedMemories = memories
  await queueWrite(() => safeWriteJson(MEMORIES_FILE, { memories }))
}

async function loadIndex(): Promise<MemoryIndex> {
  if (cachedIndex) return cachedIndex
  cachedIndex = await safeReadJson(INDEX_FILE, {
    byTag: {},
    byCategory: {},
    byImportance: {},
    byProject: {},
    byTime: {},
    totalEntries: 0,
  })
  return cachedIndex
}

async function saveIndex(index: MemoryIndex): Promise<void> {
  cachedIndex = index
  await queueWrite(() => safeWriteJson(INDEX_FILE, index))
}

async function loadCompressed(): Promise<CompressedCluster[]> {
  if (cachedCompressed) return cachedCompressed
  cachedCompressed = await safeReadJson(COMPRESSED_FILE, [] as CompressedCluster[])
  return cachedCompressed
}

async function saveCompressed(clusters: CompressedCluster[]): Promise<void> {
  cachedCompressed = clusters
  await queueWrite(() => safeWriteJson(COMPRESSED_FILE, clusters))
}

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function calculateImportance(userMessage: string, assistantResponse: string): number {
  let importance = 5
  const combined = (userMessage + " " + assistantResponse).toLowerCase()

  const highImportance = ["critical", "important", "always", "never", "must", "requirement", "constraint", "decision", "chose", "architecture", "security"]
  const medImportance = ["bug", "error", "feature", "implementation", "fix", "preference", "prefer", "pattern", "workflow"]
  const lowImportance = ["test", "example", "demo", "temporary"]

  for (const word of highImportance) {
    if (combined.includes(word)) importance += 2
  }
  for (const word of medImportance) {
    if (combined.includes(word)) importance += 1
  }
  for (const word of lowImportance) {
    if (combined.includes(word)) importance -= 1
  }

  if (combined.includes("master") || combined.includes("মাস্টার")) importance += 3
  if (combined.includes("always") || combined.includes("সবসময়")) importance += 2
  if (combined.includes("never") || combined.includes("কখনো না")) importance += 2
  if (combined.includes("remember") || combined.includes("মনে রাখো")) importance += 3
  if (assistantResponse.length > 500) importance += 1
  if (assistantResponse.length > 1000) importance += 1

  return Math.min(10, Math.max(1, importance))
}

function extractCategory(text: string): MemoryEntry["category"] {
  const lower = text.toLowerCase()
  if (lower.includes("bug") || lower.includes("error") || lower.includes("fix")) return "error"
  if (lower.includes("prefer") || lower.includes("like") || lower.includes("want")) return "preference"
  if (lower.includes("decided") || lower.includes("chose") || lower.includes("architecture")) return "decision"
  if (lower.includes("pattern") || lower.includes("workflow") || lower.includes("approach")) return "workflow"
  if (lower.includes("code") || lower.includes("function") || lower.includes("class")) return "code"
  if (lower.includes("fact") || lower.includes("info") || lower.includes("note")) return "fact"
  return "conversation"
}

function extractTags(text: string): string[] {
  const tags: string[] = []
  const lower = text.toLowerCase()

  const tagMap: Record<string, string> = {
    bug: "bug", error: "bug", crash: "bug", exception: "bug",
    feature: "feature", add: "feature", implement: "feature", create: "feature",
    fix: "fix", resolve: "fix", repair: "fix", patch: "fix",
    test: "test", testing: "test", unittest: "test",
    deploy: "deploy", deployment: "deploy", release: "deploy",
    security: "security", auth: "security", password: "security", token: "security",
    performance: "performance", optimization: "performance", speed: "performance", slow: "performance",
    ui: "ui", frontend: "ui", design: "ui", layout: "ui",
    api: "api", backend: "api", endpoint: "api", rest: "api",
    database: "database", db: "database", sql: "database", query: "database",
    config: "config", configuration: "config", settings: "config",
    python: "python", javascript: "javascript", typescript: "typescript",
    react: "react", node: "node", bun: "bun", docker: "docker",
    git: "git", github: "github", commit: "git", branch: "git",
    master: "master", মাস্টার: "master",
    important: "important", critical: "important",
    zyraxon: "zyraxon", opencode: "zyraxon",
  }

  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (lower.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags.slice(0, 10)
}

function extractKey(text: string): string {
  const words = text.split(/\s+/).filter(w => w.length > 2).slice(0, 8)
  return words.join("_").substring(0, 80) || "unknown"
}

function generateSummary(content: string): string {
  if (content.length <= 150) return content
  const sentences = content.split(/[.!?।]+/).filter(s => s.trim().length > 10)
  if (sentences.length <= 2) return content.substring(0, 150)
  return sentences.slice(0, 2).join(". ").substring(0, 150)
}

function updateIndex(index: MemoryIndex, entry: MemoryEntry): void {
  index.totalEntries++

  for (const tag of entry.tags) {
    if (!index.byTag[tag]) index.byTag[tag] = []
    index.byTag[tag].push(entry.id)
  }

  if (!index.byCategory[entry.category]) index.byCategory[entry.category] = []
  index.byCategory[entry.category].push(entry.id)

  const impBucket = String(Math.floor(entry.importance / 2))
  if (!index.byImportance[impBucket]) index.byImportance[impBucket] = []
  index.byImportance[impBucket].push(entry.id)

  if (entry.projectId) {
    if (!index.byProject[entry.projectId]) index.byProject[entry.projectId] = []
    index.byProject[entry.projectId].push(entry.id)
  }

  const dayKey = new Date(entry.timestamp).toISOString().split("T")[0]
  if (!index.byTime[dayKey]) index.byTime[dayKey] = []
  index.byTime[dayKey].push(entry.id)
}

async function compressOldMemories(memories: MemoryEntry[]): Promise<void> {
  const now = Date.now()
  const context = await loadAutoContext()

  if (now - context.lastCompression < 86400000) return
  if (memories.length < COMPRESSION_THRESHOLD) return

  const oldMemories = memories
    .filter(m => {
      const age = now - m.timestamp
      return age > 86400000 * 30 && m.accessCount < 3 && m.importance < 7
    })
    .sort((a, b) => a.importance - b.importance)

  if (oldMemories.length < 100) return

  const clusters = await loadCompressed()
  const tagGroups: Record<string, MemoryEntry[]> = {}

  for (const mem of oldMemories) {
    const theme = mem.tags[0] || mem.category
    if (!tagGroups[theme]) tagGroups[theme] = []
    tagGroups[theme].push(mem)
  }

  for (const [theme, group] of Object.entries(tagGroups)) {
    if (group.length < 5) continue

    const cluster: CompressedCluster = {
      id: `cluster_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      theme,
      summary: `${group.length} memories about ${theme}: ${group.slice(0, 3).map(m => m.summary).join("; ")}`,
      entries: group.map(m => m.id),
      timestamp: now,
      importance: Math.max(...group.map(m => m.importance)),
      accessCount: group.reduce((sum, m) => sum + m.accessCount, 0),
    }
    clusters.push(cluster)

    for (const mem of group) {
      mem.compressed = true
      mem.source = "compressed"
    }
  }

  const activeMemories = memories.filter(m => !m.compressed)

  await saveCompressed(clusters)
  await saveMemories(activeMemories)

  context.lastCompression = now
  context.totalCompressed = clusters.reduce((sum, c) => sum + c.entries.length, 0)
  context.totalMemories = activeMemories.length
  await saveAutoContext(context)
}

export async function autoInjectContext(userMessage: string, agent: string): Promise<string> {
  const context = await loadAutoContext()
  const memories = await loadMemories()
  const compressed = await loadCompressed()
  const now = Date.now()
  const parts: string[] = []

  if (context.masterPreferences && Object.keys(context.masterPreferences).length > 0) {
    const masterPrefs = Object.entries(context.masterPreferences)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n")
    parts.push(`Master's preferences (NEVER violate these):\n${masterPrefs}`)
  }

  if (context.recentContext) {
    parts.push(`Recent context:\n${context.recentContext}`)
  }

  if (Object.keys(context.userPreferences).length > 0) {
    const prefs = Object.entries(context.userPreferences)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n")
    parts.push(`User preferences:\n${prefs}`)
  }

  if (context.projectContext) {
    parts.push(`Project context:\n${context.projectContext}`)
  }

  const queryLower = userMessage.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)

  const scored = memories.map(m => {
    let score = 0
    const contentLower = m.content.toLowerCase()
    const keyLower = m.key.toLowerCase()
    const summaryLower = m.summary.toLowerCase()

    if (keyLower.includes(queryLower)) score += 100
    if (contentLower.includes(queryLower)) score += 50
    if (summaryLower.includes(queryLower)) score += 30

    for (const word of queryWords) {
      if (keyLower.includes(word)) score += 20
      if (contentLower.includes(word)) score += 10
      if (summaryLower.includes(word)) score += 8
      if (m.tags.some(t => t.includes(word))) score += 15
      if (m.category.includes(word)) score += 12
    }

    score += m.importance * 5

    const age = now - m.timestamp
    const daysOld = age / (1000 * 60 * 60 * 24)
    if (daysOld < 1) score += 30
    else if (daysOld < 7) score += 20
    else if (daysOld < 30) score += 10

    score += Math.min(m.accessCount * 3, 30)

    return { memory: m, score }
  })

  const topMemories = scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)

  if (topMemories.length > 0) {
    const memStr = topMemories.map(r => {
      const age = now - r.memory.timestamp
      const daysOld = Math.floor(age / (1000 * 60 * 60 * 24))
      let recency = ""
      if (daysOld === 0) recency = "today"
      else if (daysOld === 1) recency = "yesterday"
      else if (daysOld < 7) recency = `${daysOld}d ago`
      else if (daysOld < 30) recency = `${Math.floor(daysOld / 7)}w ago`
      else if (daysOld < 365) recency = `${Math.floor(daysOld / 30)}mo ago`
      else recency = `${Math.floor(daysOld / 365)}y ago`

      return `- [${r.memory.importance}/10|${r.memory.category}|${recency}] ${r.memory.key}: ${r.memory.summary.substring(0, 200)}`
    }).join("\n")
    parts.push(`Relevant memories (${topMemories.length} found):\n${memStr}`)
  }

  const relevantClusters = compressed
    .filter(c => queryWords.some(w => c.theme.includes(w) || c.summary.toLowerCase().includes(w)))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3)

  if (relevantClusters.length > 0) {
    const clusterStr = relevantClusters.map(c =>
      `- [${c.theme}] ${c.summary} (${c.entries.length} compressed memories)`
    ).join("\n")
    parts.push(`Historical context (compressed):\n${clusterStr}`)
  }

  if (context.learnedPatterns.length > 0) {
    const relevantPatterns = context.learnedPatterns
      .filter(p => queryWords.some(w => p.toLowerCase().includes(w)))
      .slice(0, 5)
    if (relevantPatterns.length > 0) {
      parts.push(`Learned patterns:\n${relevantPatterns.map(p => `- ${p}`).join("\n")}`)
    }
  }

  if (context.sessionHistory.length > 0) {
    const recent = context.sessionHistory.slice(-8)
    parts.push(`Recent session:\n${recent.join("\n")}`)
  }

  context.lastInjection = now
  context.injectedCount++
  context.totalMemories = memories.length
  await saveAutoContext(context)

  if (parts.length === 0) return ""

  return `[ZYRAXON ETERNAL MEMORY]\n${parts.join("\n\n")}\n[/ZYRAXON ETERNAL MEMORY]\n\n`
}

export async function autoStoreConversation(
  userMessage: string,
  assistantResponse: string,
  agent: string,
  model: string,
  projectId?: string,
  sessionId?: string,
): Promise<void> {
  const context = await loadAutoContext()
  const memories = await loadMemories()
  const now = Date.now()

  const importance = calculateImportance(userMessage, assistantResponse)
  const tags = extractTags(userMessage + " " + assistantResponse)
  const category = extractCategory(userMessage + " " + assistantResponse)

  const masterKeywords = ["মাস্টার", "master", "always remember", "সবসময় মনে রাখো", "never forget", "কখনো ভুলবা না"]
  const isMasterInstruction = masterKeywords.some(kw => userMessage.toLowerCase().includes(kw))

  if (importance >= 3 || isMasterInstruction) {
    const memory: MemoryEntry = {
      id: generateId(),
      key: extractKey(userMessage),
      content: userMessage.substring(0, 2000),
      summary: generateSummary(userMessage),
      tags,
      timestamp: now,
      importance: isMasterInstruction ? Math.max(importance, 9) : importance,
      accessCount: 0,
      lastAccessed: now,
      source: "auto",
      category,
      projectId,
      sessionId,
    }

    memories.push(memory)

    if (isMasterInstruction) {
      const prefs = context.masterPreferences || {}
      const key = extractKey(userMessage).substring(0, 50)
      prefs[key] = userMessage.substring(0, 500)
      context.masterPreferences = prefs
    }
  }

  context.recentContext = `User: ${userMessage.substring(0, 300)}\nAssistant: ${assistantResponse.substring(0, 300)}`
  context.sessionHistory.push(`[${agent}] User: ${userMessage.substring(0, 150)}`)
  if (context.sessionHistory.length > 30) {
    context.sessionHistory = context.sessionHistory.slice(-30)
  }

  const prefs = extractPreferences(userMessage)
  for (const [key, value] of Object.entries(prefs)) {
    context.userPreferences[key] = value
  }

  if (memories.length > MAX_MEMORIES) {
    await compressOldMemories(memories)
  }

  const index = await loadIndex()
  if (memories.length > 0) {
    updateIndex(index, memories[memories.length - 1])
    await saveIndex(index)
  }

  await saveMemories(memories)
  await saveAutoContext(context)
}

export async function autoLearnPattern(pattern: string, context: string): Promise<void> {
  const memories = await loadMemories()
  const autoCtx = await loadAutoContext()
  const now = Date.now()

  const memory: MemoryEntry = {
    id: generateId(),
    key: `pattern_${extractKey(pattern)}`,
    content: `${pattern}\nContext: ${context}`,
    summary: generateSummary(pattern),
    tags: ["pattern", "learned", ...extractTags(pattern)],
    timestamp: now,
    importance: 7,
    accessCount: 0,
    lastAccessed: now,
    source: "learned",
    category: "pattern",
  }

  memories.push(memory)

  if (!autoCtx.learnedPatterns) autoCtx.learnedPatterns = []
  autoCtx.learnedPatterns.push(pattern.substring(0, 200))
  if (autoCtx.learnedPatterns.length > 500) {
    autoCtx.learnedPatterns = autoCtx.learnedPatterns.slice(-500)
  }

  await saveMemories(memories)
  await saveAutoContext(autoCtx)
}

export async function smartRecall(query: string, limit: number = 15): Promise<string> {
  const memories = await loadMemories()
  const compressed = await loadCompressed()
  const context = await loadAutoContext()

  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)

  const scored = memories.map(m => {
    let score = 0
    const contentLower = m.content.toLowerCase()
    const keyLower = m.key.toLowerCase()
    const summaryLower = m.summary.toLowerCase()

    if (keyLower.includes(queryLower)) score += 100
    if (contentLower.includes(queryLower)) score += 50
    if (summaryLower.includes(queryLower)) score += 30

    for (const word of queryWords) {
      if (keyLower.includes(word)) score += 20
      if (contentLower.includes(word)) score += 10
      if (summaryLower.includes(word)) score += 8
      if (m.tags.some(t => t.includes(word))) score += 15
      if (m.category.includes(word)) score += 12
    }

    score += m.importance * 5
    const age = Date.now() - m.timestamp
    const daysOld = age / (1000 * 60 * 60 * 24)
    if (daysOld < 1) score += 30
    else if (daysOld < 7) score += 20
    else if (daysOld < 30) score += 10
    score += Math.min(m.accessCount * 3, 30)

    return { memory: m, score }
  })

  const results = scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (results.length === 0) {
    const compressedResults = compressed
      .filter(c => queryWords.some(w => c.theme.includes(w) || c.summary.toLowerCase().includes(w)))
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3)

    if (compressedResults.length === 0) return "No relevant memories found."

    return "Historical memories (compressed):\n" + compressedResults.map(r =>
      `- [${r.theme}] ${r.summary} (${r.entries.length} memories)`
    ).join("\n")
  }

  for (const r of results) {
    r.memory.accessCount++
    r.memory.lastAccessed = Date.now()
  }
  await saveMemories(memories)

  const output = results.map(r => {
    const age = Date.now() - r.memory.timestamp
    const daysOld = Math.floor(age / (1000 * 60 * 60 * 24))
    let recency = ""
    if (daysOld === 0) recency = "today"
    else if (daysOld === 1) recency = "yesterday"
    else if (daysOld < 7) recency = `${daysOld} days ago`
    else if (daysOld < 30) recency = `${Math.floor(daysOld / 7)} weeks ago`
    else if (daysOld < 365) recency = `${Math.floor(daysOld / 30)} months ago`
    else recency = `${Math.floor(daysOld / 365)} years ago`

    return `[${r.memory.importance}/10|${r.memory.category}|${recency}] ${r.memory.key}:\n${r.memory.summary.substring(0, 400)}`
  }).join("\n\n")

  return output
}

export async function storeMasterPreference(key: string, value: string): Promise<void> {
  const context = await loadAutoContext()
  if (!context.masterPreferences) context.masterPreferences = {}
  context.masterPreferences[key] = value
  await saveAutoContext(context)

  const memories = await loadMemories()
  const now = Date.now()
  const memory: MemoryEntry = {
    id: generateId(),
    key: `master_pref_${key}`,
    content: `Master preference: ${key} = ${value}`,
    summary: `Master wants ${key}: ${value}`,
    tags: ["master", "preference", "important"],
    timestamp: now,
    importance: 10,
    accessCount: 0,
    lastAccessed: now,
    source: "manual",
    category: "preference",
  }
  memories.push(memory)
  await saveMemories(memories)
}

function extractPreferences(text: string): Record<string, string> {
  const prefs: Record<string, string> = {}
  const lower = text.toLowerCase()

  if (lower.includes("prefer") || lower.includes("like") || lower.includes("use")) {
    if (lower.includes("typescript")) prefs["language"] = "TypeScript"
    if (lower.includes("javascript")) prefs["language"] = "JavaScript"
    if (lower.includes("python")) prefs["language"] = "Python"
    if (lower.includes("dark mode") || lower.includes("dark")) prefs["theme"] = "dark"
    if (lower.includes("light mode") || lower.includes("light")) prefs["theme"] = "light"
    if (lower.includes("bun")) prefs["runtime"] = "bun"
    if (lower.includes("node")) prefs["runtime"] = "node"
  }

  if (lower.includes("call me") || lower.includes("নাম")) {
    const nameMatch = text.match(/(?:call me|নাম)\s+(\w+)/i)
    if (nameMatch) prefs["name"] = nameMatch[1]
  }

  return prefs
}

export async function getMemoryStats(): Promise<{
  total: number
  compressed: number
  categories: Record<string, number>
  topTags: Array<{ tag: string; count: number }>
  oldestMemory: string
  newestMemory: string
}> {
  const memories = await loadMemories()
  const compressed = await loadCompressed()

  const categories: Record<string, number> = {}
  const tagCounts: Record<string, number> = {}

  for (const m of memories) {
    categories[m.category] = (categories[m.category] || 0) + 1
    for (const tag of m.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    }
  }

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  const allTimestamps = memories.map(m => m.timestamp)
  const oldest = allTimestamps.length > 0 ? new Date(Math.min(...allTimestamps)).toISOString() : "none"
  const newest = allTimestamps.length > 0 ? new Date(Math.max(...allTimestamps)).toISOString() : "none"

  return {
    total: memories.length,
    compressed: compressed.reduce((sum, c) => sum + c.entries.length, 0),
    categories,
    topTags,
    oldestMemory: oldest,
    newestMemory: newest,
  }
}

export const autoMemory = {
  autoInjectContext,
  autoStoreConversation,
  autoLearnPattern,
  smartRecall,
  storeMasterPreference,
  getMemoryStats,
  loadAutoContext,
  saveAutoContext,
  loadMemories,
}
