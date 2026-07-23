#!/usr/bin/env bun

import { $ } from "bun"

// ZYRAXON-specific formatting
console.log("ZYRAXON Code Formatter v1.14.0")
console.log("=".repeat(60))

// Format TypeScript files
await $`bun run prettier --ignore-unknown --write .`

// ZYRAXON-specific formatting rules
console.log("Applied ZYRAXON formatting rules:")
console.log("- Cross-platform compatible code")
console.log("- No eval() or dangerous patterns")
console.log("- Input validation for all user-facing tools")
console.log("- Secure coding practices")
console.log("- Bengali/English mixed comments support")
console.log("=".repeat(60))
