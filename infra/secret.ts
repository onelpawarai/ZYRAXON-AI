sst.Linkable.wrap(random.RandomPassword, (resource) => ({
  properties: {
    value: resource.result,
  },
}))

export const SECRET = {
  R2AccessKey: new sst.Secret("R2AccessKey", "unknown"),
  R2SecretKey: new sst.Secret("R2SecretKey", "unknown"),
  HoneycombApiKey: new sst.Secret("HONEYCOMB_API_KEY"),
  HoneycombWebhookSecret: new random.RandomPassword("HoneycombWebhookSecret", { length: 24 }),
  SupportApiKey: new sst.Secret("SUPPORT_API_KEY"),
  UpstashRedisRestUrl: new sst.Secret("UpstashRedisRestUrl"),
  UpstashRedisRestToken: new sst.Secret("UpstashRedisRestToken"),
  
  // ZYRAXON-specific secrets
  ZYRAXON_STREAM_KEY: new sst.Secret("ZYRAXON_STREAM_KEY"),
  ZYRAXON_TOR_CONTROL_PASSWORD: new sst.Secret("ZYRAXON_TOR_CONTROL_PASSWORD"),
  ZYRAXON_MEMORY_ENCRYPTION_KEY: new sst.Secret("ZYRAXON_MEMORY_ENCRYPTION_KEY"),
  ZYRAXON_MCP_SERVER_SECRET: new sst.Secret("ZYRAXON_MCP_SERVER_SECRET"),
  ZYRAXON_DESKTOP_AUTOMATION_KEY: new sst.Secret("ZYRAXON_DESKTOP_AUTOMATION_KEY"),
}
