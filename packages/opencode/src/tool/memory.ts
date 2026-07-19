import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import DESCRIPTION from "./memory.txt"
import { Global } from "@opencode-ai/core/global"
import path from "path"
import fs from "fs/promises"

const MEMORY_DIR = path.join(Global.Path.data, "memory")
const MEMORY_FILE = path.join(MEMORY_DIR, "memories.json")

interface MemoryEntry {
  key: string
  content: string
  tags: string[]
  time_created: number
  time_updated: number
}

interface MemoryStore {
  memories: MemoryEntry[]
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
    return { memories: [] }
  }
}

async function saveMemories(store: MemoryStore) {
  await ensureMemoryDir()
  await fs.writeFile(MEMORY_FILE, JSON.stringify(store, null, 2))
}

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "The action to perform: store, recall, search, or list",
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
    description: "Search term to find in keys and content (used with search)",
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

            switch (params.action) {
              case "store": {
                if (!params.key || !params.content) {
                  return "Error: 'key' and 'content' are required for store action"
                }
                const existing = store.memories.findIndex((m) => m.key === params.key)
                const entry: MemoryEntry = {
                  key: params.key,
                  content: params.content,
                  tags: params.tags ?? [],
                  time_created: existing >= 0 ? store.memories[existing].time_created : now,
                  time_updated: now,
                }
                if (existing >= 0) {
                  store.memories[existing] = entry
                } else {
                  store.memories.push(entry)
                }
                await saveMemories(store)
                return `Memory stored: "${params.key}" (${store.memories.length} total memories)`
              }
              case "recall": {
                if (!params.key) {
                  return "Error: 'key' is required for recall action"
                }
                const entry = store.memories.find((m) => m.key === params.key)
                if (!entry) {
                  return `No memory found with key: "${params.key}"`
                }
                return `Key: ${entry.key}\nContent: ${entry.content}\nTags: ${entry.tags.join(", ") || "none"}\nStored: ${new Date(entry.time_created).toISOString()}`
              }
              case "search": {
                if (!params.query) {
                  return "Error: 'query' is required for search action"
                }
                const query = params.query.toLowerCase()
                let results = store.memories.filter(
                  (m) =>
                    m.key.toLowerCase().includes(query) ||
                    m.content.toLowerCase().includes(query) ||
                    m.tags.some((t) => t.toLowerCase().includes(query)),
                )
                if (params.tags?.length) {
                  results = results.filter((m) => params.tags!.some((t) => m.tags.includes(t)))
                }
                if (results.length === 0) {
                  return `No memories found matching: "${params.query}"`
                }
                const output = results
                  .slice(0, 20)
                  .map((m) => `- ${m.key}: ${m.content.substring(0, 200)}${m.content.length > 200 ? "..." : ""}`)
                  .join("\n")
                return `Found ${results.length} memories:\n${output}`
              }
              case "list": {
                let memories = store.memories
                if (params.tags?.length) {
                  memories = memories.filter((m) => params.tags!.some((t) => m.tags.includes(t)))
                }
                if (memories.length === 0) {
                  return "No memories stored yet."
                }
                const output = memories
                  .slice(0, 50)
                  .map((m) => `- ${m.key} [${m.tags.join(", ") || "no tags"}]`)
                  .join("\n")
                return `${memories.length} memories:\n${output}`
              }
              default:
                return `Unknown action: "${params.action}". Use store, recall, search, or list.`
            }
          })

          return { title: "Memory", metadata: {}, output: result }
        }),
    }
  }),
)
