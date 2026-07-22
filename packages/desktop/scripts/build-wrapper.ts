#!/usr/bin/env bun
import { $ } from "bun"
import path from "path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "../..")

if (!process.env.NODE_OPTIONS?.includes("max-old-space-size")) {
  const current = process.env.NODE_OPTIONS ?? ""
  process.env.NODE_OPTIONS = `${current} --max-old-space-size=4096`.trim()
}

console.log(`Setting Node.js heap limit to 4096MB`)

// Build opencode dist/node first if it doesn't exist
const opencodeDistNode = path.join(rootDir, "opencode", "dist", "node")
const opencodeWebUI = path.join(opencodeDistNode, "opencode-web-ui.gen.ts")

if (!Bun.file(opencodeWebUI).exists()) {
  console.log("Building opencode dist/node...")
  await $`bun run script/build-node.ts`.cwd(path.join(rootDir, "opencode"))
  
  // Copy opencode-web-ui.gen.ts to dist/node
  const srcWebUI = path.join(rootDir, "opencode", "opencode-web-ui.gen.ts")
  if (Bun.file(srcWebUI).exists()) {
    await Bun.write(opencodeWebUI, await Bun.file(srcWebUI).arrayBuffer())
    console.log("Copied opencode-web-ui.gen.ts to dist/node")
  }
}

await $`electron-vite build`
