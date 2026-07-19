import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import DESCRIPTION from "./self_evolve.txt"
import { Global } from "@opencode-ai/core/global"
import path from "path"
import fs from "fs/promises"

const CONFIG_FILE = path.join(Global.Path.data, "opencode.jsonc")

interface McpServer {
  type: "local"
  command: string[]
  environment?: Record<string, string>
}

interface ConfigData {
  mcp?: {
    servers?: Record<string, McpServer>
  }
}

async function loadConfig(): Promise<ConfigData> {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf-8")
    const cleaned = data.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
    return JSON.parse(cleaned) as ConfigData
  } catch {
    return {}
  }
}

async function saveConfig(config: ConfigData) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "The action to perform: install_mcp, list_mcp, or check_status",
  }),
  name: Schema.optional(Schema.String).annotate({
    description: "The MCP server name (used with install_mcp and check_status)",
  }),
  command: Schema.optional(Schema.String).annotate({
    description: "The command to run the server (used with install_mcp, e.g., 'npx', 'node', 'python')",
  }),
  args: Schema.optional(Schema.Array(Schema.String)).annotate({
    description: "Arguments for the command (used with install_mcp)",
  }),
  env: Schema.optional(Schema.Record(Schema.String, Schema.String)).annotate({
    description: "Environment variables for the server (used with install_mcp)",
  }),
})

export const SelfEvolveTool = Tool.define<typeof Parameters>(
  "self_evolve",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          yield* ctx.ask({
            permission: "self_evolve",
            patterns: ["*"],
            always: ["*"],
            metadata: {},
          })

          const result = yield* Effect.promise(async () => {
            const config = await loadConfig()

            switch (params.action) {
              case "install_mcp": {
                if (!params.name || !params.command) {
                  return "Error: 'name' and 'command' are required for install_mcp"
                }

                if (!config.mcp) config.mcp = { servers: {} }
                if (!config.mcp.servers) config.mcp.servers = {}

                const command = [params.command, ...(params.args ?? [])]
                const server: McpServer = {
                  type: "local",
                  command,
                }
                if (params.env && Object.keys(params.env).length > 0) {
                  server.environment = params.env
                }

                config.mcp.servers[params.name] = server
                await saveConfig(config)

                return `MCP server "${params.name}" installed successfully!\nCommand: ${command.join(" ")}\nRestart ZYRAXON to activate the new server.`
              }
              case "list_mcp": {
                const servers = config.mcp?.servers ?? {}
                const names = Object.keys(servers)
                if (names.length === 0) {
                  return "No MCP servers configured."
                }
                const list = names
                  .map((name) => {
                    const s = servers[name]
                    return `- ${name}: ${s.command.join(" ")} (${s.type})`
                  })
                  .join("\n")
                return `${names.length} MCP servers configured:\n${list}`
              }
              case "check_status": {
                if (!params.name) {
                  return "Error: 'name' is required for check_status"
                }
                const servers = config.mcp?.servers ?? {}
                const server = servers[params.name]
                if (!server) {
                  return `MCP server "${params.name}" is not configured.`
                }
                return `MCP server "${params.name}" is configured.\nCommand: ${server.command.join(" ")}\nType: ${server.type}`
              }
              default:
                return `Unknown action: "${params.action}". Use install_mcp, list_mcp, or check_status.`
            }
          })

          return { title: "Self Evolve", metadata: {}, output: result }
        }),
    }
  }),
)
