import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import path from "path"
import fs from "fs/promises"

interface AnalysisResult {
  file: string
  lines: number
  characters: number
  functions: string[]
  classes: string[]
  imports: string[]
  exports: string[]
  complexity: string
  languages: string[]
}

function detectLanguage(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const langMap: Record<string, string> = {
    ".ts": "TypeScript", ".tsx": "TypeScript JSX", ".js": "JavaScript", ".jsx": "JavaScript JSX",
    ".py": "Python", ".rs": "Rust", ".go": "Go", ".java": "Java", ".c": "C", ".cpp": "C++",
    ".cs": "C#", ".rb": "Ruby", ".php": "PHP", ".swift": "Swift", ".kt": "Kotlin",
    ".html": "HTML", ".css": "CSS", ".scss": "SCSS", ".json": "JSON", ".yaml": "YAML",
    ".yml": "YAML", ".md": "Markdown", ".sql": "SQL", ".sh": "Shell", ".bash": "Shell",
    ".ps1": "PowerShell", ".xml": "XML", ".toml": "TOML", ".env": "ENV", ".txt": "Text",
  }
  return langMap[ext] || "Unknown"
}

async function analyzeFile(filepath: string): Promise<AnalysisResult> {
  const content = await fs.readFile(filepath, "utf-8")
  const lines = content.split("\n")
  const filename = path.basename(filepath)
  const lang = detectLanguage(filename)

  const functions: string[] = []
  const classes: string[] = []
  const imports: string[] = []
  const exports: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Functions
    const funcMatch = trimmed.match(/(?:function|def|fn|func|async\s+function)\s+(\w+)/)
    if (funcMatch) functions.push(funcMatch[1])

    // Classes
    const classMatch = trimmed.match(/(?:class|struct|interface|type)\s+(\w+)/)
    if (classMatch) classes.push(classMatch[1])

    // Imports
    const importMatch = trimmed.match(/(?:import|from|require|use|include)\s+["'{]([^"'}]+)/)
    if (importMatch) imports.push(importMatch[1])

    // Exports
    const exportMatch = trimmed.match(/(?:export|module\s+exports|pub)\s+(?:function|class|const|let|var|async)\s+(\w+)/)
    if (exportMatch) exports.push(exportMatch[1])
  }

  // Complexity estimation
  let complexityScore = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (/\b(if|else|elif|else\s+if|switch|case|for|while|do|catch|try)\b/.test(trimmed)) complexityScore++
    if (/\b(&&|\|\||\?)\b/.test(trimmed)) complexityScore++
  }

  let complexity = "Simple"
  if (complexityScore > 20) complexity = "Complex"
  else if (complexityScore > 10) complexity = "Moderate"
  else if (complexityScore > 5) complexity = "Low"

  return {
    file: filename,
    lines: lines.length,
    characters: content.length,
    functions: [...new Set(functions)],
    classes: [...new Set(classes)],
    imports: [...new Set(imports)].slice(0, 20),
    exports: [...new Set(exports)],
    complexity,
    languages: [lang],
  }
}

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "Action: analyze (deep code analysis), summary (quick overview), find_patterns (detect patterns)",
  }),
  path: Schema.String.annotate({
    description: "File or directory path to analyze",
  }),
  pattern: Schema.optional(Schema.String).annotate({
    description: "Search pattern (regex) for find_patterns action",
  }),
})

export const CodeAnalyzerTool = Tool.define<typeof Parameters>(
  "code_analyzer",
  Effect.gen(function* () {
    return {
      description: "DEEP CODE ANALYSIS — Analyze code files for structure, complexity, patterns, and quality. Detect functions, classes, imports, exports, complexity score. Understand any codebase instantly.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          yield* ctx.ask({
            permission: "memory",
            patterns: ["*"],
            always: ["*"],
            metadata: {},
          })

          const result = yield* Effect.promise(async () => {
            try {
              const stat = await fs.stat(params.path)

              if (stat.isFile()) {
                const analysis = await analyzeFile(params.path)
                return `CODE ANALYSIS — ${analysis.file}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Language: ${analysis.languages[0]}
Lines: ${analysis.lines.toLocaleString()}
Characters: ${analysis.characters.toLocaleString()}
Complexity: ${analysis.complexity}

Functions (${analysis.functions.length}):
${analysis.functions.length > 0 ? analysis.functions.map(f => `  • ${f}`).join("\n") : "  None found"}

Classes/Types (${analysis.classes.length}):
${analysis.classes.length > 0 ? analysis.classes.map(c => `  • ${c}`).join("\n") : "  None found"}

Imports (${analysis.imports.length}):
${analysis.imports.length > 0 ? analysis.imports.map(i => `  • ${i}`).join("\n") : "  None found"}

Exports (${analysis.exports.length}):
${analysis.exports.length > 0 ? analysis.exports.map(e => `  • ${e}`).join("\n") : "  None found"}`
              }

              // Directory analysis
              const entries = await fs.readdir(params.path, { withFileTypes: true })
              const files: string[] = []
              const dirs: string[] = []
              let totalLines = 0
              const langCount: Record<string, number> = {}

              for (const entry of entries.slice(0, 100)) {
                if (entry.isFile()) {
                  files.push(entry.name)
                  const lang = detectLanguage(entry.name)
                  langCount[lang] = (langCount[lang] || 0) + 1
                  try {
                    const content = await fs.readFile(path.join(params.path, entry.name), "utf-8")
                    totalLines += content.split("\n").length
                  } catch {}
                } else if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
                  dirs.push(entry.name)
                }
              }

              const langSummary = Object.entries(langCount)
                .sort(([, a], [, b]) => b - a)
                .map(([lang, count]) => `  ${lang}: ${count} files`)
                .join("\n")

              return `DIRECTORY ANALYSIS — ${params.path}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Files: ${files.length}
Directories: ${dirs.length}
Total Lines: ${totalLines.toLocaleString()}

Languages:
${langSummary || "  No files found"}

Key Files:
${files.slice(0, 20).map(f => `  • ${f}`).join("\n")}

Subdirectories:
${dirs.slice(0, 20).map(d => `  • ${d}/`).join("\n")}`
            } catch (e: any) {
              return `Analysis error: ${e.message}`
            }
          })

          return { title: "Code Analyzer", metadata: {}, output: result }
        }),
    }
  }),
)
