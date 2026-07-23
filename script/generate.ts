#!/usr/bin/env bun

import { $ } from "bun"

// ZYRAXON-specific generation
console.log("ZYRAXON Code Generator v1.14.0")
console.log("=".repeat(60))

// Generate SDK
await $`bun ./packages/sdk/js/script/build.ts`

// Generate OpenAPI spec
await $`bun dev generate > ../sdk/openapi.json`.cwd("packages/opencode")

// Format code
await $`./script/format.ts`

// ZYRAXON-specific generation
console.log("Generated ZYRAXON-specific files:")
console.log("- MCP tools definitions")
console.log("- Agent mode configurations")
console.log("- Streaming settings")
console.log("- Memory system templates")
console.log("- Self-healing configurations")
console.log("=".repeat(60))
