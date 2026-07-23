import { SECRET } from "./secret"
import { shortDomain } from "./stage"

const storage = new sst.cloudflare.Bucket("EnterpriseStorage")

new sst.cloudflare.x.SolidStart("Teams", {
  domain: shortDomain,
  path: "packages/enterprise",
  buildCommand: "bun run build:cloudflare",
  link: [SECRET.SupportApiKey],
  environment: {
    ZYRAXON_STORAGE_ADAPTER: "r2",
    ZYRAXON_STORAGE_ACCOUNT_ID: sst.cloudflare.DEFAULT_ACCOUNT_ID,
    ZYRAXON_STORAGE_ACCESS_KEY_ID: SECRET.R2AccessKey.value,
    ZYRAXON_STORAGE_SECRET_ACCESS_KEY: SECRET.R2SecretKey.value,
    ZYRAXON_STORAGE_BUCKET: storage.name,
    // ZYRAXON-specific enterprise features
    ZYRAXON_VERSION: "1.14.0",
    ZYRAXON_MCP_TOOLS_COUNT: "136",
    ZYRAXON_STREAMING_ENABLED: "true",
    ZYRAXON_SELF_HEALING_ENABLED: "true",
    ZYRAXON_MEMORY_SYSTEM_ENABLED: "true",
    ZYRAXON_ENTERPRISE_MODE: "true",
    ZYRAXON_MULTI_USER_SUPPORT: "true",
    ZYRAXON_TEAM_COLLABORATION: "true",
    ZYRAXON_AUDIT_LOGGING: "true",
    ZYRAXON_ROLE_BASED_ACCESS: "true",
  },
})
