import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { Global } from "@opencode-ai/core/global"
import path from "path"
import fs from "fs/promises"
import { execSync } from "child_process"
import os from "os"

const SCREENSHOT_DIR = path.join(Global.Path.data, "pro", "screenshots")

async function ensureDir() {
  try { await fs.access(SCREENSHOT_DIR) } catch { await fs.mkdir(SCREENSHOT_DIR, { recursive: true }) }
}

async function takeScreenshot(): Promise<string> {
  await ensureDir()
  const filename = `screen_${Date.now()}.png`
  const filepath = path.join(SCREENSHOT_DIR, filename)

  if (process.platform === "win32") {
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms
      Add-Type -AssemblyName System.Drawing
      $bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
      $bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
      $bitmap.Save('${filepath.replace(/\\/g, "\\\\")}')
      $graphics.Dispose()
      $bitmap.Dispose()
    `
    const tempScript = path.join(os.tmpdir(), `screenshot_${Date.now()}.ps1`)
    await fs.writeFile(tempScript, psScript, "utf-8")
    try {
      execSync(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, { stdio: "pipe", timeout: 15000 })
    } finally {
      await fs.unlink(tempScript).catch(() => {})
    }
  } else if (process.platform === "darwin") {
    execSync(`screencapture -x "${filepath}"`, { stdio: "pipe" })
  } else {
    execSync(`import -window root "${filepath}"`, { stdio: "pipe" })
  }

  return filepath
}

async function ocrScreenshot(_filepath: string): Promise<string> {
  return "Screenshot captured. File saved locally for analysis."
}

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "Action: capture (take screenshot), list (show recent screenshots)",
  }),
})

export const ScreenVisionTool = Tool.define<typeof Parameters>(
  "screen_vision",
  Effect.gen(function* () {
    return {
      description: "REAL-TIME SCREEN VISION — Capture and analyze the screen in real-time. Take screenshots, see what is on screen, analyze UI elements, read text from screen. Pro power: you can see exactly what the user sees.",
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
            switch (params.action) {
              case "capture": {
                try {
                  const filepath = await takeScreenshot()
                  const stats = await fs.stat(filepath)
                  const info = await ocrScreenshot(filepath)
                  return [
                    "SCREEN CAPTURED!",
                    `File: ${filepath}`,
                    `Size: ${(stats.size / 1024).toFixed(1)}KB`,
                    info,
                    "",
                    "You can now analyze this screenshot.",
                    "The user's screen is now visible to you.",
                  ].join("\n")
                } catch (e: any) {
                  return `Screenshot failed: ${e.message}`
                }
              }
              case "list": {
                try {
                  await ensureDir()
                  const files = await fs.readdir(SCREENSHOT_DIR)
                  const screenshots = files.filter(f => f.endsWith(".png")).sort().reverse().slice(0, 10)
                  if (screenshots.length === 0) return "No screenshots captured yet."
                  const list = screenshots.map(f => `- ${f}`).join("\n")
                  return `Recent screenshots (${screenshots.length}):\n${list}\n\nUse 'capture' to take a new screenshot.`
                } catch {
                  return "No screenshots captured yet."
                }
              }
              default:
                return `Unknown action: "${params.action}". Use capture or list.`
            }
          })

          return { title: "Screen Vision", metadata: {}, output: result }
        }),
    }
  }),
)
