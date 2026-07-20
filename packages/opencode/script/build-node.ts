#!/usr/bin/env bun
import { $ } from "bun"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

console.log("Building opencode node binary...")

const result = await Bun.build({
  conditions: ["bun", "node"],
  tsconfig: "./tsconfig.json",
  target: "bun",
  external: ["node-gyp", "node-fetch"],
  format: "esm",
  minify: false,
  splitting: false,
  entrypoints: ["./src/node.ts"],
  outdir: "dist/node",
  define: {
    "import.meta.env.PROCESS_TYPE": JSON.stringify("server"),
  },
})

if (!result.success) {
  console.error("Build failed:", result.logs)
  process.exit(1)
}

console.log("Node binary build complete")
