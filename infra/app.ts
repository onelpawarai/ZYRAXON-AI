import { domain } from "./stage"

const GITHUB_APP_ID = new sst.Secret("GITHUB_APP_ID")
const GITHUB_APP_PRIVATE_KEY = new sst.Secret("GITHUB_APP_PRIVATE_KEY")
export const EMAILOCTOPUS_API_KEY = new sst.Secret("EMAILOCTOPUS_API_KEY")
const ADMIN_SECRET = new sst.Secret("ADMIN_SECRET")
const DISCORD_SUPPORT_BOT_TOKEN = new sst.Secret("DISCORD_SUPPORT_BOT_TOKEN")
const DISCORD_SUPPORT_CHANNEL_ID = new sst.Secret("DISCORD_SUPPORT_CHANNEL_ID")
const FEISHU_APP_ID = new sst.Secret("FEISHU_APP_ID")
const FEISHU_APP_SECRET = new sst.Secret("FEISHU_APP_SECRET")
const bucket = new sst.cloudflare.Bucket("Bucket")

// ZYRAXON-specific secrets
const ZYRAXON_STREAM_KEY = new sst.Secret("ZYRAXON_STREAM_KEY")
const ZYRAXON_TOR_CONTROL_PASSWORD = new sst.Secret("ZYRAXON_TOR_CONTROL_PASSWORD")
const ZYRAXON_MEMORY_ENCRYPTION_KEY = new sst.Secret("ZYRAXON_MEMORY_ENCRYPTION_KEY")

export const api = new sst.cloudflare.Worker("Api", {
  domain: `api.${domain}`,
  handler: "packages/function/src/api.ts",
  environment: {
    WEB_DOMAIN: domain,
    // ZYRAXON environment variables
    ZYRAXON_VERSION: "1.14.0",
    ZYRAXON_MCP_TOOLS_COUNT: "136",
    ZYRAXON_STREAMING_ENABLED: "true",
    ZYRAXON_SELF_HEALING_ENABLED: "true",
    ZYRAXON_MEMORY_SYSTEM_ENABLED: "true",
  },
  url: true,
  link: [
    bucket,
    GITHUB_APP_ID,
    GITHUB_APP_PRIVATE_KEY,
    ADMIN_SECRET,
    DISCORD_SUPPORT_BOT_TOKEN,
    DISCORD_SUPPORT_CHANNEL_ID,
    FEISHU_APP_ID,
    FEISHU_APP_SECRET,
    ZYRAXON_STREAM_KEY,
    ZYRAXON_TOR_CONTROL_PASSWORD,
    ZYRAXON_MEMORY_ENCRYPTION_KEY,
  ],
  transform: {
    worker: (args) => {
      args.logpush = true
      if ($app.stage === "vimtor" || $app.stage === "adam") return
      args.bindings = $resolve(args.bindings).apply((bindings) => [
        ...bindings,
        {
          name: "SYNC_SERVER",
          type: "durable_object_namespace",
          className: "SyncServer",
        },
      ])
      args.migrations = {
        oldTag: $app.stage === "production" || $app.stage === "thdxr" ? "" : "v1",
        newTag: $app.stage === "production" || $app.stage === "thdxr" ? "" : "v1",
      }
    },
  },
})

new sst.cloudflare.x.Astro("Web", {
  domain: "docs." + domain,
  path: "packages/web",
  environment: {
    SST_STAGE: $app.stage,
    VITE_API_URL: api.url.apply((url) => url!),
    // ZYRAXON documentation settings
    ZYRAXON_DOCS_VERSION: "1.14.0",
    ZYRAXON_MCP_TOOLS_DOCS: "https://zyraxon.ai/docs/mcp-tools",
    ZYRAXON_STREAMING_DOCS: "https://zyraxon.ai/docs/streaming",
  },
})

new sst.cloudflare.StaticSite("WebApp", {
  domain: "app." + domain,
  path: "packages/app",
  build: {
    command: "bun turbo build",
    output: "./dist",
  },
})
