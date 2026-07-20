#!/usr/bin/env bun
import { $ } from "bun"
import path from "path"
import { fileURLToPath } from "url"
import { mkdir, writeFile } from "fs/promises"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dir = path.resolve(__dirname, "..")

process.chdir(dir)

console.log("Building opencode server...")

await $`rm -rf dist/node`
await mkdir("dist/node", { recursive: true })

// Generate the embedded web UI bundle
const appDir = path.join(dir, "../app")
const dist = path.join(appDir, "dist")
const files = (await Array.fromAsync(new Bun.Glob("**/*").scan({ cwd: dist })))
  .map((file) => file.replaceAll("\\", "/"))
  .filter((file) => !file.endsWith(".map"))
  .sort()

const imports = files.map((file, i) => {
  const spec = path.relative(dir, path.join(dist, file)).replaceAll("\\", "/")
  return `import file_${i} from ${JSON.stringify(spec.startsWith(".") ? spec : `./${spec}`)} with { type: "file" };`
})
const entries = files.map((file, i) => `  ${JSON.stringify(file)}: file_${i},`)
const embeddedFileMap = [
  `// Import all files as file_$i with type: "file"`,
  ...imports,
  `// Export with original mappings`,
  `export default {`,
  ...entries,
  `}`,
].join("\n")

await writeFile(path.join(dir, "opencode-web-ui.gen.ts"), embeddedFileMap)

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

// Copy the generated web UI file to dist/node
await $`cp opencode-web-ui.gen.ts dist/node/`

console.log("Server build complete at dist/node/")
console.log("Output files:", await Array.fromAsync(new Bun.Glob("*").scan({ cwd: "dist/node" })))
