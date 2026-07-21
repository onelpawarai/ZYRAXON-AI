import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import DESCRIPTION from "./memory.txt"
import { Global } from "@opencode-ai/core/global"
import path from "path"
import fs from "fs/promises"

const MEMORY_DIR = path.join(Global.Path.data, "memory")
const MEMORY_FILE = path.join(MEMORY_DIR, "memories.json")

// Pro unlimited memory
import * as ProMemory from "../pro/memory"

interface MemoryEntry {
  key: string
  content: string
  tags: string[]
  time_created: number
  time_updated: number
  importance: number // 0-10 scale, higher = more important
  access_count: number // how many times recalled
  last_accessed: number // last recall timestamp
}

interface MemoryStore {
  memories: MemoryEntry[]
  auto_context: {
    enabled: boolean
    last_context: string
    context_timestamp: number
  }
}

async function ensureMemoryDir() {
  try {
    await fs.access(MEMORY_DIR)
  } catch {
    await fs.mkdir(MEMORY_DIR, { recursive: true })
  }
}

async function loadMemories(): Promise<MemoryStore> {
  try {
    await ensureMemoryDir()
    const data = await fs.readFile(MEMORY_FILE, "utf-8")
    return JSON.parse(data) as MemoryStore
  } catch {
    return { memories: [], auto_context: { enabled: true, last_context: "", context_timestamp: 0 } }
  }
}

async function saveMemories(store: MemoryStore) {
  await ensureMemoryDir()
  await fs.writeFile(MEMORY_FILE, JSON.stringify(store, null, 2))
}

// Smart search with fuzzy matching and importance weighting
function smartSearch(memories: MemoryEntry[], query: string, tags?: string[]): MemoryEntry[] {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1)

  let results = memories.map((m) => {
    let score = 0
    const contentLower = m.content.toLowerCase()
    const keyLower = m.key.toLowerCase()

    // Exact key match (highest priority)
    if (keyLower === queryLower) score += 100

    // Key contains query
    if (keyLower.includes(queryLower)) score += 50

    // Content exact phrase match
    if (contentLower.includes(queryLower)) score += 30

    // Word-by-word matching
    for (const word of queryWords) {
      if (keyLower.includes(word)) score += 10
      if (contentLower.includes(word)) score += 5
      if (m.tags.some((t) => t.toLowerCase().includes(word))) score += 8
    }

    // Importance bonus (0-10 scale)
    score += m.importance * 3

    // Recency bonus (more recent = higher)
    const age = Date.now() - m.time_updated
    const daysOld = age / (1000 * 60 * 60 * 24)
    if (daysOld < 1) score += 20
    else if (daysOld < 7) score += 15
    else if (daysOld < 30) score += 10
    else if (daysOld < 365) score += 5

    // Access frequency bonus (more recalled = more relevant)
    score += Math.min(m.access_count * 2, 20)

    // Tag match bonus
    if (tags?.length) {
      for (const tag of tags) {
        if (m.tags.includes(tag)) score += 15
      }
    }

    return { memory: m, score }
  })

  // Filter out zero scores and sort
  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.memory)
}

// Auto-generate context from recent memories
function generateAutoContext(memories: MemoryEntry[]): string {
  const recent = memories
    .sort((a, b) => b.time_updated - a.time_updated)
    .slice(0, 20)

  if (recent.length === 0) return ""

  const contextParts = recent.map((m) => {
    const age = Date.now() - m.time_updated
    const daysOld = Math.floor(age / (1000 * 60 * 60 * 24))
    let recency = ""
    if (daysOld === 0) recency = "today"
    else if (daysOld === 1) recency = "yesterday"
    else if (daysOld < 7) recency = `${daysOld} days ago`
    else if (daysOld < 30) recency = `${Math.floor(daysOld / 7)} weeks ago`
    else recency = `${Math.floor(daysOld / 30)} months ago`

    return `[${recency}] ${m.key}: ${m.content.substring(0, 150)}`
  })

  return `Recent context:\n${contextParts.join("\n")}`
}

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "The action to perform: store, recall, search, list, auto_context, smart_recall, importance, stats, pro_store, pro_search, pro_stats, pro_recent",
  }),
  key: Schema.optional(Schema.String).annotate({
    description: "The unique key for this memory (used with store and recall)",
  }),
  content: Schema.optional(Schema.String).annotate({
    description: "The information to remember (used with store)",
  }),
  tags: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Optional tags for categorization (used with store, search, and list)",
  }),
  query: Schema.optional(Schema.String).annotate({
    description: "Search term to find in keys and content (used with search and smart_recall)",
  }),
  importance: Schema.optional(Schema.Number).annotate({
    description: "Importance level 0-10 (used with store). Higher = more important. Default: 5",
  }),
})

export const MemoryTool = Tool.define<typeof Parameters>(
  "memory",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          yield* ctx.ask({
            permission: "memory",
            patterns: ["*"],
            always: ["*"],
            metadata: {},
          })

          const result = yield* Effect.promise(async () => {
            const store = await loadMemories()
            const now = Date.now()

            // Pro unlimited memory features
            if (params.action === "pro_store" && params.key && params.content) {
              await ProMemory.storeMessage({
                role: "user",
                content: `[${params.key}] ${params.content}`,
                sessionId: ctx.sessionID,
                agent: ctx.agent,
                model: "zyraxon-pro",
              })
              return `Pro memory stored: "${params.key}" — permanently saved to unlimited memory`
            }

            if (params.action === "pro_search" && params.query) {
              const results = await ProMemory.searchMemory(params.query, 10)
              if (results.length === 0) return `No pro memories found matching: "${params.query}"`
              const output = results
                .map((r) => {
                  const msgs = r.matchedMessages.slice(0, 3).map((m) => `  - ${m.content.substring(0, 150)}`).join("\n")
                  return `- [${r.conversation.title}] (score: ${r.score})\n${msgs}`
                })
                .join("\n")
              return `Found ${results.length} pro memory matches:\n${output}`
            }

            if (params.action === "pro_stats") {
              const stats = await ProMemory.getMemoryStats()
              return `Pro Memory Stats:\n- Conversations: ${stats.totalConversations}\n- Messages: ${stats.totalMessages}\n- Oldest: ${stats.oldestMessage ? new Date(stats.oldestMessage).toISOString() : "none"}\n- Newest: ${stats.newestMessage ? new Date(stats.newestMessage).toISOString() : "none"}`
            }

            if (params.action === "pro_recent") {
              const convs = await ProMemory.getRecentConversations(10)
              if (convs.length === 0) return "No recent conversations"
              const output = convs
                .map((c) => `- ${c.title} (${c.messages.length} msgs, ${new Date(c.updatedAt).toLocaleDateString()})`)
                .join("\n")
              return `Recent Pro conversations:\n${output}`
            }

            // Standard memory actions

            switch (params.action) {
              case "store": {
                if (!params.key || !params.content) {
                  return "Error: 'key' and 'content' are required for store action"
                }
                const importance = Math.min(10, Math.max(0, params.importance ?? 5))
                const existing = store.memories.findIndex((m) => m.key === params.key)
                const entry: MemoryEntry = {
                  key: params.key,
                  content: params.content,
                  tags: params.tags ?? [],
                  time_created: existing >= 0 ? store.memories[existing].time_created : now,
                  time_updated: now,
                  importance,
                  access_count: existing >= 0 ? store.memories[existing].access_count : 0,
                  last_accessed: existing >= 0 ? store.memories[existing].last_accessed : now,
                }
                if (existing >= 0) {
                  store.memories[existing] = entry
                } else {
                  store.memories.push(entry)
                }
                await saveMemories(store)
                return `Memory stored: "${params.key}" (importance: ${importance}/10, total: ${store.memories.length} memories)`
              }
              case "recall": {
                if (!params.key) {
                  return "Error: 'key' is required for recall action"
                }
                // Smart recall - try exact match first, then fuzzy
                let entry = store.memories.find((m) => m.key === params.key)
                if (!entry) {
                  // Fuzzy match
                  const fuzzy = store.memories.filter((m) =>
                    m.key.toLowerCase().includes(params.key!.toLowerCase()) ||
                    params.key!.toLowerCase().includes(m.key.toLowerCase())
                  )
                  entry = fuzzy[0]
                }
                if (!entry) {
                  return `No memory found with key: "${params.key}"`
                }
                // Update access stats
                entry.access_count++
                entry.last_accessed = now
                await saveMemories(store)
                return `Key: ${entry.key}\nContent: ${entry.content}\nTags: ${entry.tags.join(", ") || "none"}\nImportance: ${entry.importance}/10\nAccessed: ${entry.access_count} times\nStored: ${new Date(entry.time_created).toISOString()}`
              }
              case "search": {
                if (!params.query) {
                  return "Error: 'query' is required for search action"
                }
                const results = smartSearch(store.memories, params.query, params.tags)
                if (results.length === 0) {
                  return `No memories found matching: "${params.query}"`
                }
                const output = results
                  .slice(0, 20)
                  .map((m) => `- [${m.importance}/10] ${m.key}: ${m.content.substring(0, 200)}${m.content.length > 200 ? "..." : ""}`)
                  .join("\n")
                return `Found ${results.length} memories:\n${output}`
              }
              case "smart_recall": {
                if (!params.query) {
                  return "Error: 'query' is required for smart_recall action"
                }
                // Smart recall with auto-context injection
                const results = smartSearch(store.memories, params.query, params.tags)
                const autoCtx = generateAutoContext(store.memories)

                let output = ""
                if (results.length > 0) {
                  output += `Found ${results.length} memories:\n`
                  output += results.slice(0, 10).map((m) =>
                    `- [${m.importance}/10] ${m.key}: ${m.content.substring(0, 200)}`
                  ).join("\n")
                } else {
                  output += `No direct matches for: "${params.query}"\n`
                }

                if (autoCtx) {
                  output += `\n\nAuto-context (recent memories):\n${autoCtx}`
                }

                return output
              }
              case "auto_context": {
                // Generate and return auto-context from recent memories
                const context = generateAutoContext(store.memories)
                if (!context) return "No memories stored yet. Start storing memories to enable auto-context."
                store.auto_context.last_context = context
                store.auto_context.context_timestamp = now
                await saveMemories(store)
                return `Auto-context generated:\n${context}`
              }
              case "importance": {
                if (!params.key) {
                  return "Error: 'key' is required for importance action"
                }
                const entry = store.memories.find((m) => m.key === params.key)
                if (!entry) {
                  return `No memory found with key: "${params.key}"`
                }
                const newImportance = Math.min(10, Math.max(0, params.importance ?? entry.importance))
                entry.importance = newImportance
                entry.time_updated = now
                await saveMemories(store)
                return `Updated importance of "${params.key}" to ${newImportance}/10`
              }
              case "list": {
                let memories = store.memories
                if (params.tags?.length) {
                  memories = memories.filter((m) => params.tags!.some((t) => m.tags.includes(t)))
                }
                if (memories.length === 0) {
                  return "No memories stored yet."
                }
                // Sort by importance + recency
                const sorted = memories
                  .sort((a, b) => (b.importance * 3 + b.access_count) - (a.importance * 3 + a.access_count))
                  .slice(0, 50)
                const output = sorted
                  .map((m) => `- [${m.importance}/10] ${m.key} [${m.tags.join(", ") || "no tags"}] (${m.access_count}x accessed)`)
                  .join("\n")
                return `${memories.length} memories (sorted by importance):\n${output}`
              }
              case "stats": {
                const totalMemories = store.memories.length
                const totalAccess = store.memories.reduce((sum, m) => sum + m.access_count, 0)
                const avgImportance = totalMemories > 0
                  ? (store.memories.reduce((sum, m) => sum + m.importance, 0) / totalMemories).toFixed(1)
                  : "0"
                const oldest = store.memories.length > 0
                  ? new Date(Math.min(...store.memories.map((m) => m.time_created))).toISOString()
                  : "none"
                const newest = store.memories.length > 0
                  ? new Date(Math.max(...store.memories.map((m) => m.time_created))).toISOString()
                  : "none"
                const topImported = store.memories
                  .sort((a, b) => b.importance - a.importance)
                  .slice(0, 5)
                  .map((m) => `  - [${m.importance}/10] ${m.key}`)
                  .join("\n")

                return `Memory Stats:\n- Total memories: ${totalMemories}\n- Total recalls: ${totalAccess}\n- Avg importance: ${avgImportance}/10\n- Oldest: ${oldest}\n- Newest: ${newest}\n- Top 5 most important:\n${topImported || "  (none)"}`
              }
              default:
                return `Unknown action: "${params.action}". Available: store, recall, search, smart_recall, auto_context, importance, list, stats, pro_store, pro_search, pro_stats, pro_recent`
            }
          })

          return { title: "Memory", metadata: {}, output: result }
        }),
    }
  }),
)
