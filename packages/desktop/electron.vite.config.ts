import { sentryVitePlugin } from "@sentry/vite-plugin"
import { defineConfig } from "electron-vite"
import appPlugin from "@opencode-ai/app/vite"
import * as fs from "node:fs/promises"
import * as path from "node:path"

if (!process.env.NODE_OPTIONS?.includes("max-old-space-size")) {
  const current = process.env.NODE_OPTIONS ?? ""
  process.env.NODE_OPTIONS = `${current} --max-old-space-size=8192`.trim()
}

const ZYRAXON_SERVER_DIST = "../opencode/dist/node"

const channel = (() => {
  const raw = process.env.ZYRAXON_CHANNEL
  if (raw === "dev" || raw === "beta" || raw === "prod") return raw
  if (process.env.ZYRAXON_CHANNEL === "latest") return "prod"
  return "dev"
})()

const nodePtyPkg = `@lydell/node-pty-${process.platform}-${process.arch}`

const sentry =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        telemetry: false,
        release: {
          name: process.env.SENTRY_RELEASE ?? process.env.VITE_SENTRY_RELEASE,
        },
        sourcemaps: {
          assets: "./out/renderer/**",
          filesToDeleteAfterUpload: "./out/renderer/**/*.map",
        },
      })
    : false

export default defineConfig({
  main: {
    define: {
      "import.meta.env.ZYRAXON_CHANNEL": JSON.stringify(channel),
    },
    build: {
      rollupOptions: {
        external: ["node-fetch", "opencode-web-ui.gen.ts"],
        input: { index: "src/main/index.ts", sidecar: "src/main/sidecar.ts" },
        // Keep this identical to electron-vite's Node 20.11+ shim. Its regex insertion can
        // corrupt bundled TypeScript, while a Rollup banner places the shim safely.
        output: {
          banner: `
// -- CommonJS Shims --
import __cjs_mod__ from 'node:module';
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require = __cjs_mod__.createRequire(import.meta.url);
if (!import.meta.require) { import.meta.require = require; }
`,
        },
      },
      externalizeDeps: { include: [nodePtyPkg] },
    },
    plugins: [
      {
        name: "opencode:bun-protocol-shim",
        enforce: "pre",
        resolveId(id) {
          if (id === "bun:sqlite") return "\0bun:sqlite-shim.ts"
          if (id === "bun:ffi") return "\0bun:ffi-shim.ts"
        },
        load(id) {
          if (id === "\0bun:sqlite-shim.ts") {
            return `
import { DatabaseSync } from "node:sqlite";
class Statement {
  constructor(stmt) { this._stmt = stmt; }
  all(...params) { return this._stmt.all(...params); }
  values(...params) { this._stmt.setReturnArrays(true); return this._stmt.all(...params); }
  run(...params) { return this._stmt.run(...params); }
  safeIntegers() {}
}
export class Database {
  constructor(filename, options) {
    this._db = new DatabaseSync(filename, { readOnly: options?.readonly ?? false, open: true, enableForeignKeyConstraints: true });
    if (options?.disableWAL !== true && !options?.readonly) this._db.exec("PRAGMA journal_mode = WAL;");
  }
  query(sql) { return new Statement(this._db.prepare(sql)); }
  run(sql) { this._db.exec(sql); }
  close() { this._db.close(); }
  serialize() { return new Uint8Array(0); }
  loadExtension(p) { this._db.loadExtension(p); }
}
`
          }
          if (id === "\0bun:ffi-shim.ts") {
            return `
export function dlopen() { return { symbols: {} }; }
export function ptr() { return 0; }
export function read() { return null; }
export class CString { toString() { return ""; } }
export const FFIType = { void:0, i8:1, u8:2, i16:3, u16:4, i32:5, u32:6, i64:7, u64:8, f32:9, f64:10, bool:11, ptr:12, cstring:13 };
`
          }
        },
      },
      {
        name: "opencode:node-pty-narrower",
        enforce: "pre",
        resolveId(s) {
          if (s === "@lydell/node-pty") return nodePtyPkg
        },
      },
      {
        name: "opencode:virtual-server-module",
        enforce: "pre",
        resolveId(id) {
          if (id === "virtual:opencode-server") return this.resolve(`${ZYRAXON_SERVER_DIST}/node.js`)
        },
      },
      {
        name: "opencode:copy-server-assets",
        async writeBundle() {
          for (const l of await fs.readdir(ZYRAXON_SERVER_DIST)) {
            if (!l.endsWith(".wasm")) continue
            await fs.writeFile(`./out/main/chunks/${l}`, await fs.readFile(`${ZYRAXON_SERVER_DIST}/${l}`))
          }
          // Copy the embedded web UI file
          await fs.copyFile(
            path.join(ZYRAXON_SERVER_DIST, "opencode-web-ui.gen.ts"),
            "./out/main/opencode-web-ui.gen.ts"
          )
        },
      },
    ],
  },
  preload: {
    build: {
      rollupOptions: {
        input: { index: "src/preload/index.ts", "speech-preload": "src/preload/speech-preload.ts" },
        output: {
          format: "cjs",
          entryFileNames: "[name].js",
        },
      },
    },
  },
  renderer: {
    plugins: [appPlugin, sentry],
    publicDir: "../../../app/public",
    root: "src/renderer",
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: "src/renderer/index.html",
        },
      },
    },
  },
})
