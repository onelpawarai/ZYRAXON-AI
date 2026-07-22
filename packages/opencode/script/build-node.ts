#!/usr/bin/env bun

import path from "path"
import { fileURLToPath } from "url"
import { createSolidTransformPlugin } from "@opentui/solid/bun-plugin"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

const generated = await import("./generate.ts")

import pkg from "../package.json"

const plugin = createSolidTransformPlugin()

const outdir = path.resolve(dir, "dist/node")

await Bun.build({
  conditions: ["bun", "node"],
  tsconfig: "./tsconfig.json",
  plugins: [plugin],
  external: [
    "node-gyp",
    "@lydell/node-pty",
    "@parcel/watcher",
    "@ff-labs/fff-bun",
    "@opentui/core",
    "electron",
    "jsonc-parser",
  ],
  format: "esm",
  target: "node",
  minify: false,
  sourcemap: "linked",
  splitting: true,
  outdir,
  entrypoints: ["./src/node.ts"],
  define: {
    FFF_LIBC: JSON.stringify("gnu"),
    ZYRAXON_VERSION: `'${pkg.version}'`,
    ZYRAXON_MODELS_DEV: generated.modelsData,
    ZYRAXON_CHANNEL: `'dev'`,
    ZYRAXON_LIBC: `'glibc'`,
  },
})

console.log(`Built server bundle to ${outdir}/node.js`)
