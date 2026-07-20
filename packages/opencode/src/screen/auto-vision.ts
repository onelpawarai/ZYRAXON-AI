// ZYRAXON Auto Screen Vision
// Automatically captures screen before EVERY response
// Works on Windows, Linux, Mac — cross-platform

import { execSync } from "child_process"
import fs from "fs/promises"
import path from "path"
import os from "os"
import { Global } from "@opencode-ai/core/global"

const SCREENSHOT_DIR = path.join(Global.Path.data, "screen_vision")
const AUTO_CAPTURE_FILE = path.join(SCREENSHOT_DIR, "latest_capture.json")

export interface ScreenCapture {
  id: string
  timestamp: number
  filepath: string
  platform: string
  size: number
  width?: number
  height?: number
}

let lastCaptureTime = 0
const MIN_CAPTURE_INTERVAL = 3000 // 3 seconds between captures

async function ensureDir() {
  try {
    await fs.access(SCREENSHOT_DIR)
  } catch {
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true })
  }
}

// Cross-platform screenshot capture
async function captureScreen(): Promise<ScreenCapture> {
  await ensureDir()
  const filename = `screen_${Date.now()}.png`
  const filepath = path.join(SCREENSHOT_DIR, filename)
  const platform = process.platform

  if (platform === "win32") {
    // Windows — PowerShell
    const psScript = `
      Add-Type -AssemblyName System.Windows.Forms
      Add-Type -AssemblyName System.Drawing
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
    `
    const tempScript = path.join(os.tmpdir(), `capture_${Date.now()}.ps1`)
    await fs.writeFile(tempScript, psScript, "utf-8")
    try {
      execSync(`powershell -ExecutionPolicy Bypass -File "${tempScript}"`, { stdio: "pipe", timeout: 15000 })
    } finally {
      await fs.unlink(tempScript).catch(() => {})
    }
  } else if (platform === "darwin") {
    // macOS — screencapture
    execSync(`screencapture -x "${filepath}"`, { stdio: "pipe" })
  } else {
    // Linux — multiple methods
    try {
      // Try gnome-screenshot first
      execSync(`gnome-screenshot -f "${filepath}"`, { stdio: "pipe" })
    } catch {
      try {
        // Try scrot
        execSync(`scrot "${filepath}"`, { stdio: "pipe" })
      } catch {
        try {
          // Try import (ImageMagick)
          execSync(`import -window root "${filepath}"`, { stdio: "pipe" })
        } catch {
          // Try xdpyinfo + xwd
          execSync(`xwd -root -out "${filepath}.xwd" && convert "${filepath}.xwd" "${filepath}" && rm "${filepath}.xwd"`, { stdio: "pipe" })
        }
      }
    }
  }

  const stats = await fs.stat(filepath)
  
  const capture: ScreenCapture = {
    id: `cap_${Date.now()}`,
    timestamp: Date.now(),
    filepath,
    platform,
    size: stats.size,
  }

  // Save latest capture info
  await fs.writeFile(AUTO_CAPTURE_FILE, JSON.stringify(capture, null, 2))
  
  return capture
}

// Auto-capture before every response
export async function autoCaptureScreen(): Promise<ScreenCapture | null> {
  const now = Date.now()
  
  // Rate limit captures (every 3 seconds max)
  if (now - lastCaptureTime < MIN_CAPTURE_INTERVAL) {
    // Return existing capture if available
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
    console.error("Auto screen capture failed:", e)
    return null
  }
}

// Get latest capture
export async function getLatestCapture(): Promise<ScreenCapture | null> {
  try {
    const data = await fs.readFile(AUTO_CAPTURE_FILE, "utf-8")
    return JSON.parse(data) as ScreenCapture
  } catch {
    return null
  }
}

// Get capture history
export async function getCaptureHistory(limit: number = 10): Promise<ScreenCapture[]> {
  try {
    await ensureDir()
    const files = await fs.readdir(SCREENSHOT_DIR)
    const captures: ScreenCapture[] = []
    
    for (const file of files.filter(f => f.startsWith("screen_") && f.endsWith(".png")).sort().reverse().slice(0, limit)) {
      const filepath = path.join(SCREENSHOT_DIR, file)
      const stats = await fs.stat(filepath)
      captures.push({
        id: `cap_${file.replace("screen_", "").replace(".png", "")}`,
        timestamp: parseInt(file.replace("screen_", "").replace(".png", "")),
        filepath,
        platform: process.platform,
        size: stats.size,
      })
    }
    
    return captures
  } catch {
    return []
  }
}

// Get screen description (what's on screen)
export async function describeScreen(): Promise<string> {
  const capture = await autoCaptureScreen()
  if (!capture) return "Unable to capture screen"
  
  return [
    `Screen captured at ${new Date(capture.timestamp).toLocaleTimeString()}`,
    `Platform: ${capture.platform}`,
    `File: ${capture.filepath}`,
    `Size: ${(capture.size / 1024).toFixed(1)}KB`,
    "",
    "The screen is now visible to you.",
    "You can see what the user sees.",
    "Even if the user switched windows, you captured the current active screen.",
  ].join("\n")
}

// Export
export const autoScreenVision = {
  autoCaptureScreen,
  getLatestCapture,
  getCaptureHistory,
  describeScreen,
  captureScreen,
}
