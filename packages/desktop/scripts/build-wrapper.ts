#!/usr/bin/env bun
import { $ } from "bun"

if (!process.env.NODE_OPTIONS?.includes("max-old-space-size")) {
  const current = process.env.NODE_OPTIONS ?? ""
  process.env.NODE_OPTIONS = `${current} --max-old-space-size=4096`.trim()
}

console.log(`Setting Node.js heap limit to 4096MB`)

await $`electron-vite build`
