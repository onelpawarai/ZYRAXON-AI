// strip-bom.js — Removes BOM from all JSON files in node_modules
// This fixes the Vite PostCSS config loading error caused by
// BOM characters (0xEF 0xBB 0xBF) in upstream @opencode-ai packages
// Run after: bun install

const fs = require("fs")
const path = require("path")

function stripBOM(dir) {
  let fixed = 0
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "dist") continue
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        fixed += stripBOM(fullPath)
      } else if (entry.name.endsWith(".json")) {
        const buf = fs.readFileSync(fullPath)
        if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
          fs.writeFileSync(fullPath, buf.slice(3))
          fixed++
        }
      }
    }
  } catch {}
  return fixed
}

const target = path.join(__dirname, "node_modules")
console.log("Stripping BOM from node_modules...")
const count = stripBOM(target)
console.log(`Done! Fixed ${count} files.`)
