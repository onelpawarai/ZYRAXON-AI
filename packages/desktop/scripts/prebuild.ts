#!/usr/bin/env bun
import { $ } from "bun"

import { resolveChannel } from "./utils"

if (!process.env.NODE_OPTIONS?.includes("max-old-space-size")) {
  const current = process.env.NODE_OPTIONS ?? ""
  process.env.NODE_OPTIONS = `${current} --max-old-space-size=8192`.trim()
}

const channel = resolveChannel()
await $`bun ./scripts/copy-icons.ts ${channel}`
await $`bun ./scripts/copy-metainfo.ts ${channel}`
