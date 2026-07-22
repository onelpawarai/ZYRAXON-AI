import { app, BrowserWindow, ipcMain, screen } from "electron"
import { join } from "node:path"

let speechWin: BrowserWindow | null = null
let speechReady = false
let pendingStart: (() => void) | null = null

type SpeechCallbacks = {
  onResult: (text: string, isFinal: boolean) => void
  onStateChange: (listening: boolean) => void
  onError: (error: string) => void
}

let callbacks: SpeechCallbacks | null = null

function getSpeechHtmlPath(): string {
  return join(process.resourcesPath, "speech.html")
}

function getSpeechPreloadPath(): string {
  return join(process.resourcesPath, "speech-preload.js")
}

export function createSpeechWindow() {
  if (speechWin && !speechWin.isDestroyed()) return

  // Get screen dimensions to position the bar at bottom-right
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth } = primaryDisplay.workAreaSize
  const barWidth = 280
  const barHeight = 56
  const margin = 16

  speechWin = new BrowserWindow({
    width: barWidth,
    height: barHeight,
    x: screenWidth - barWidth - margin,
    y: margin,
    show: false,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: getSpeechPreloadPath(),
    },
  })

  // Allow microphone permission for speech recognition
  speechWin.webContents.session.setPermissionRequestHandler(
    (_wc, permission, callback) => {
      if (permission === "media") {
        callback(true)
      } else {
        callback(false)
      }
    },
  )

  speechWin.webContents.session.setPermissionCheckHandler(
    (_webContents, permission) => {
      if (permission === "media") return true
      return false
    },
  )

  speechWin.loadFile(getSpeechHtmlPath())

  speechWin.webContents.on("did-finish-load", () => {
    speechReady = true
    if (pendingStart) {
      pendingStart()
      pendingStart = null
    }
  })

  speechWin.on("closed", () => {
    speechWin = null
    speechReady = false
  })

  ipcMain.on("speech-result", (_event, text: string, isFinal: boolean) => {
    callbacks?.onResult(text, isFinal)
  })

  ipcMain.on("speech-state", (_event, listening: boolean) => {
    callbacks?.onStateChange(listening)
  })

  ipcMain.on("speech-error", (_event, error: string) => {
    callbacks?.onError(error)
  })
}

export function destroySpeechWindow() {
  if (speechWin && !speechWin.isDestroyed()) {
    speechWin.destroy()
  }
  speechWin = null
  speechReady = false
}

export function startSpeechRecognition(
  cbs: SpeechCallbacks,
  lang = "en-US",
) {
  callbacks = cbs

  if (!speechWin || speechWin.isDestroyed()) {
    createSpeechWindow()
  }

  const sendStart = () => {
    if (!speechWin || speechWin.isDestroyed()) return
    // Show the bar and focus it so Chromium speech API works
    speechWin.showInactive()
    speechWin.focus()
    speechWin.webContents.send("speech-command", "start", lang)
  }

  if (speechReady) {
    sendStart()
  } else {
    pendingStart = sendStart
  }
}

export function stopSpeechRecognition() {
  if (speechWin && !speechWin.isDestroyed() && speechReady) {
    speechWin.webContents.send("speech-command", "stop")
    // Hide the bar when recognition stops
    speechWin.hide()
  }
  callbacks = null
}
