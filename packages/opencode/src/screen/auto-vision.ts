// ZYRAXON Auto Screen Vision v2
// Async, crash-proof, cross-platform screen capture
// Automatically captures screen before EVERY response

import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { Global } from "@opencode-ai/core/global"

const execAsync = promisify(exec)
const SCREENSHOT_DIR = path.join(Global.Path.data, "screen_vision")
const AUTO_CAPTURE_FILE = path.join(SCREENSHOT_DIR, "latest_capture.json")
const HISTORY_DIR = path.join(SCREENSHOT_DIR, "history")
const MAX_HISTORY = 50

export interface ScreenCapture {
  id: string
  timestamp: number
  filepath: string
  platform: string
  size: number
  width?: number
  height?: number
  method: string
  error?: string
}

let lastCaptureTime = 0
const MIN_CAPTURE_INTERVAL = 2000

async function ensureDir() {
  try {
    await fs.access(SCREENSHOT_DIR)
  } catch {
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true })
  }
  try {
    await fs.access(HISTORY_DIR)
  } catch {
    await fs.mkdir(HISTORY_DIR, { recursive: true })
  }
}

async function runCommand(cmd: string, timeoutMs: number = 10000): Promise<{ stdout: string; stderr: string }> {
  return execAsync(cmd, { timeout: timeoutMs, windowsHide: true })
}

async function captureWindows(): Promise<{ filepath: string; method: string }> {
  await ensureDir()
  const filename = `screen_${Date.now()}.png`
  const filepath = path.join(SCREENSHOT_DIR, filename)

  const psScript = `
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -AssemblyName System.Drawing
    try {
      $screens = [System.Windows.Forms.Screen]::AllScreens
      $totalWidth = 0
      $totalHeight = 0
      foreach ($screen in $screens) {
        if ($screen.Bounds.Right -gt $totalWidth) { $totalWidth = $screen.Bounds.Right }
        if ($screen.Bounds.Bottom -gt $totalHeight) { $totalHeight = $screen.Bounds.Bottom }
      }
      $bitmap = New-Object System.Drawing.Bitmap($totalWidth, $totalHeight)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $graphics.CopyFromScreen(0, 0, 0, [System.Drawing.Size]::new($totalWidth, $totalHeight))
      $bitmap.Save('${filepath.replace(/\\/g, "\\\\")}')
      $graphics.Dispose()
      $bitmap.Dispose()
      Write-Output "OK"
    } catch {
      Write-Error $_.Exception.Message
      exit 1
    }
  `

  const tempScript = path.join(os.tmpdir(), `zyraxon_capture_${Date.now()}.ps1`)
  await fs.writeFile(tempScript, psScript, "utf-8")

  try {
    await runCommand(`powershell -ExecutionPolicy Bypass -NoProfile -File "${tempScript}"`, 15000)
    return { filepath, method: "powershell" }
  } finally {
    await fs.unlink(tempScript).catch(() => {})
  }
}

async function captureMacOS(): Promise<{ filepath: string; method: string }> {
  await ensureDir()
  const filename = `screen_${Date.now()}.png`
  const filepath = path.join(SCREENSHOT_DIR, filename)
  await runCommand(`screencapture -x -C "${filepath}"`, 10000)
  return { filepath, method: "screencapture" }
}

async function captureLinux(): Promise<{ filepath: string; method: string }> {
  await ensureDir()
  const filename = `screen_${Date.now()}.png`
  const filepath = path.join(SCREENSHOT_DIR, filename)

  const methods = [
    { cmd: `gnome-screenshot -f "${filepath}"`, name: "gnome-screenshot" },
    { cmd: `scrot "${filepath}"`, name: "scrot" },
    { cmd: `import -window root "${filepath}"`, name: "imagemagick" },
    { cmd: `maim "${filepath}"`, name: "maim" },
    { cmd: `xfce4-screenshooter -f -s "${filepath}"`, name: "xfce4" },
    { cmd: `flameshot screen -p "${path.dirname(filepath)}" -n "${filename}"`, name: "flameshot" },
  ]

  for (const method of methods) {
    try {
      await runCommand(method.cmd, 10000)
      try {
        await fs.access(filepath)
        return { filepath, method: method.name }
      } catch {
        continue
      }
    } catch {
      continue
    }
  }

  throw new Error("No screen capture tool available on Linux. Install scrot, gnome-screenshot, or maim.")
}

async function captureScreen(): Promise<ScreenCapture> {
  await ensureDir()
  const platform = process.platform
  let result: { filepath: string; method: string }

  if (platform === "win32") {
    result = await captureWindows()
  } else if (platform === "darwin") {
    result = await captureMacOS()
  } else {
    result = await captureLinux()
  }

  const stats = await fs.stat(result.filepath)

  const capture: ScreenCapture = {
    id: `cap_${Date.now()}`,
    timestamp: Date.now(),
    filepath: result.filepath,
    platform,
    size: stats.size,
    method: result.method,
  }

  await fs.writeFile(AUTO_CAPTURE_FILE, JSON.stringify(capture, null, 2))

  const historyPath = path.join(HISTORY_DIR, `${capture.id}.json`)
  await fs.writeFile(historyPath, JSON.stringify(capture, null, 2))

  try {
    const historyFiles = await fs.readdir(HISTORY_DIR)
    const jsonFiles = historyFiles
      .filter(f => f.endsWith(".json"))
      .sort()
    while (jsonFiles.length > MAX_HISTORY) {
      const oldest = jsonFiles.shift()!
      await fs.unlink(path.join(HISTORY_DIR, oldest)).catch(() => {})
    }
  } catch {}

  return capture
}

export async function autoCaptureScreen(): Promise<ScreenCapture | null> {
  const now = Date.now()

  if (now - lastCaptureTime < MIN_CAPTURE_INTERVAL) {
    try {
      const data = await fs.readFile(AUTO_CAPTURE_FILE, "utf-8")
      return JSON.parse(data) as ScreenCapture
    } catch {
      return null
    }
  }

  try {
    const capture = await captureScreen()
    lastCaptureTime = now
    return capture
  } catch (e) {
    const errorCapture: ScreenCapture = {
      id: `cap_error_${Date.now()}`,
      timestamp: Date.now(),
      filepath: "",
      platform: process.platform,
      size: 0,
      method: "none",
      error: e instanceof Error ? e.message : String(e),
    }
    return errorCapture
  }
}

export async function getLatestCapture(): Promise<ScreenCapture | null> {
  try {
    const data = await fs.readFile(AUTO_CAPTURE_FILE, "utf-8")
    return JSON.parse(data) as ScreenCapture
  } catch {
    return null
  }
}

export async function getCaptureHistory(limit: number = 10): Promise<ScreenCapture[]> {
  try {
    await ensureDir()
    const files = await fs.readdir(HISTORY_DIR)
    const captures: ScreenCapture[] = []

    const jsonFiles = files
      .filter(f => f.endsWith(".json"))
      .sort()
      .reverse()
      .slice(0, limit)

    for (const file of jsonFiles) {
      try {
        const data = await fs.readFile(path.join(HISTORY_DIR, file), "utf-8")
        captures.push(JSON.parse(data) as ScreenCapture)
      } catch {
        continue
      }
    }

    return captures
  } catch {
    return []
  }
}

export async function describeScreen(): Promise<string> {
  const capture = await autoCaptureScreen()
  if (!capture) return "Unable to capture screen"
  if (capture.error) return `Screen capture failed: ${capture.error}`

  return [
    `Screen captured at ${new Date(capture.timestamp).toLocaleTimeString()}`,
    `Platform: ${capture.platform} | Method: ${capture.method}`,
    `File: ${capture.filepath}`,
    `Size: ${(capture.size / 1024).toFixed(1)}KB`,
    "",
    "The screen is now visible to you.",
    "You can see what the user sees.",
  ].join("\n")
}

export async function cleanupOldCaptures(daysOld: number = 7): Promise<number> {
  await ensureDir()
  const cutoff = Date.now() - (daysOld * 86400000)
  let removed = 0

  try {
    const files = await fs.readdir(SCREENSHOT_DIR)
    for (const file of files) {
      if (!file.startsWith("screen_") || !file.endsWith(".png")) continue
      const filepath = path.join(SCREENSHOT_DIR, file)
      try {
        const stats = await fs.stat(filepath)
        if (stats.mtimeMs < cutoff) {
          await fs.unlink(filepath)
          removed++
        }
      } catch {
        continue
      }
    }
  } catch {}

  try {
    const historyFiles = await fs.readdir(HISTORY_DIR)
    for (const file of historyFiles) {
      if (!file.endsWith(".json")) continue
      const filepath = path.join(HISTORY_DIR, file)
      try {
        const stats = await fs.stat(filepath)
        if (stats.mtimeMs < cutoff) {
          await fs.unlink(filepath)
          removed++
        }
      } catch {
        continue
      }
    }
  } catch {}

  return removed
}

export const autoScreenVision = {
  autoCaptureScreen,
  getLatestCapture,
  getCaptureHistory,
  describeScreen,
  captureScreen,
  cleanupOldCaptures,
}
