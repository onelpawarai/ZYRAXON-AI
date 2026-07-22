import { execFile } from "node:child_process"
import { stat } from "node:fs/promises"
import { readFileSync, existsSync } from "node:fs"
import { basename, join } from "node:path"
import { app, BrowserWindow, Notification, clipboard, dialog, ipcMain, shell } from "electron"
import type { IpcMainEvent, IpcMainInvokeEvent } from "electron"
import type { DesktopMenuAction } from "@opencode-ai/app/desktop-menu"

import type { FatalRendererError, ServerReadyData, TitlebarTheme } from "../preload/types"
import { runDesktopMenuAction } from "./desktop-menu-actions"
import { setForceFocus } from "./debug"
import { assertAttachmentBudget, createPickedFileAuthorizations } from "./attachment-picker"
import { getStore, removeStoreFileIfEmpty } from "./store"
import { getPinchZoomEnabled, getWindowID, setPinchZoomEnabled, setTitlebar, updateTitlebar } from "./windows"
import { startSpeechRecognition, stopSpeechRecognition, createSpeechWindow, destroySpeechWindow } from "./speech-window"
import type { UpdaterController } from "./updater-controller"
import { createUpdaterSubscriptions } from "./updater-subscriptions"
import { YouTubeStreamManager } from "./youtube-stream"

const streamManager = new YouTubeStreamManager()

const pickerFilters = (ext?: string[]) => {
  if (!ext || ext.length === 0) return undefined
  return [{ name: "Files", extensions: ext }]
}

const pickedFiles = createPickedFileAuthorizations()

type Deps = {
  killSidecar: () => Promise<void> | void
  relaunch: () => void
  awaitInitialization: () => Promise<ServerReadyData>
  consumeInitialDeepLinks: () => Promise<string[]> | string[]
  getDefaultServerUrl: () => Promise<string | null> | string | null
  setDefaultServerUrl: (url: string | null) => Promise<void> | void
  isFirstLaunchOnboardingPending: () => Promise<boolean> | boolean
  finishFirstLaunchOnboarding: (createDefaultProject: boolean) => Promise<string | null> | string | null
  isOldLayoutEligible: () => Promise<boolean> | boolean
  getDisplayBackend: () => Promise<string | null>
  setDisplayBackend: (backend: string | null) => Promise<void> | void
  parseMarkdown: (markdown: string) => Promise<string> | string
  checkAppExists: (appName: string) => Promise<boolean> | boolean
  resolveAppPath: (appName: string) => Promise<string | null>
  updater: UpdaterController
  showUpdater: () => Promise<void> | void
  setBackgroundColor: (color: string) => void
  exportDebugLogs: () => Promise<string>
  recordFatalRendererError: (error: FatalRendererError) => Promise<void> | void
}

export function registerIpcHandlers(deps: Deps) {
  const updaterSubscriptions = createUpdaterSubscriptions()
  app.once("will-quit", updaterSubscriptions.clear)

  ipcMain.handle("kill-sidecar", () => deps.killSidecar())
  ipcMain.handle("await-initialization", () => deps.awaitInitialization())
  ipcMain.handle("consume-initial-deep-links", () => deps.consumeInitialDeepLinks())
  ipcMain.handle("get-default-server-url", () => deps.getDefaultServerUrl())
  ipcMain.handle("set-default-server-url", (_event: IpcMainInvokeEvent, url: string | null) =>
    deps.setDefaultServerUrl(url),
  )
  ipcMain.handle("is-first-launch-onboarding-pending", () => deps.isFirstLaunchOnboardingPending())
  ipcMain.handle("finish-first-launch-onboarding", (_event: IpcMainInvokeEvent, createDefaultProject: boolean) =>
    deps.finishFirstLaunchOnboarding(createDefaultProject),
  )
  ipcMain.handle("is-old-layout-eligible", () => deps.isOldLayoutEligible())
  ipcMain.handle("get-display-backend", () => deps.getDisplayBackend())
  ipcMain.handle("set-display-backend", (_event: IpcMainInvokeEvent, backend: string | null) =>
    deps.setDisplayBackend(backend),
  )
  ipcMain.handle("parse-markdown", (_event: IpcMainInvokeEvent, markdown: string) => deps.parseMarkdown(markdown))
  ipcMain.handle("check-app-exists", (_event: IpcMainInvokeEvent, appName: string) => deps.checkAppExists(appName))
  ipcMain.handle("resolve-app-path", (_event: IpcMainInvokeEvent, appName: string) => deps.resolveAppPath(appName))
  ipcMain.handle("updater-subscribe", (event) => {
    const id = event.sender.id
    updaterSubscriptions.set(
      id,
      deps.updater.subscribe((state) => {
        if (event.sender.isDestroyed()) return updaterSubscriptions.delete(id)
        event.sender.send("updater-state", state)
      }),
    )
    event.sender.once("destroyed", () => updaterSubscriptions.delete(id))
  })
  ipcMain.handle("updater-unsubscribe", (event) => updaterSubscriptions.delete(event.sender.id))
  ipcMain.handle("updater-check", () => deps.updater.check())
  ipcMain.handle("updater-install", () => deps.updater.install())
  ipcMain.handle("set-background-color", (_event: IpcMainInvokeEvent, color: string) => deps.setBackgroundColor(color))
  ipcMain.handle("export-debug-logs", () => deps.exportDebugLogs())
  ipcMain.handle("set-force-focus", (event: IpcMainInvokeEvent, enabled: boolean) =>
    setForceFocus(event.sender, enabled),
  )
  ipcMain.handle("record-fatal-renderer-error", (_event: IpcMainInvokeEvent, error: FatalRendererError) =>
    deps.recordFatalRendererError(error),
  )

  // Speech recognition via mini Chromium window
  ipcMain.handle("speech-init", () => {
    createSpeechWindow()
  })

  ipcMain.handle(
    "speech-start",
    (event: IpcMainInvokeEvent, lang?: string) => {
      const sender = event.sender
      startSpeechRecognition(
        {
          onResult: (text, isFinal) => {
            if (sender.isDestroyed()) return
            sender.send("speech-result-to-renderer", text, isFinal)
          },
          onStateChange: (listening) => {
            if (sender.isDestroyed()) return
            sender.send("speech-state-to-renderer", listening)
          },
          onError: (error) => {
            if (sender.isDestroyed()) return
            sender.send("speech-error-to-renderer", error)
          },
        },
        lang,
      )
    },
  )

  ipcMain.handle("speech-stop", () => {
    stopSpeechRecognition()
  })

  ipcMain.handle("speech-destroy", () => {
    destroySpeechWindow()
  })
  ipcMain.handle("store-get", (_event: IpcMainInvokeEvent, name: string, key: string) => {
    try {
      const store = getStore(name)
      const value = store.get(key)
      if (value === undefined || value === null) return null
      return typeof value === "string" ? value : JSON.stringify(value)
    } catch {
      return null
    }
  })
  ipcMain.handle("store-set", (_event: IpcMainInvokeEvent, name: string, key: string, value: string) => {
    getStore(name).set(key, value)
  })
  ipcMain.handle("store-delete", (_event: IpcMainInvokeEvent, name: string, key: string) => {
    getStore(name).delete(key)
    void removeStoreFileIfEmpty(name)
  })
  ipcMain.handle("store-clear", (_event: IpcMainInvokeEvent, name: string) => {
    getStore(name).clear()
    void removeStoreFileIfEmpty(name)
  })
  ipcMain.handle("store-keys", (_event: IpcMainInvokeEvent, name: string) => {
    const store = getStore(name)
    return Object.keys(store.store)
  })
  ipcMain.handle("store-length", (_event: IpcMainInvokeEvent, name: string) => {
    const store = getStore(name)
    return Object.keys(store.store).length
  })

  ipcMain.handle(
    "open-directory-picker",
    async (_event: IpcMainInvokeEvent, opts?: { multiple?: boolean; title?: string; defaultPath?: string }) => {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory", ...(opts?.multiple ? ["multiSelections" as const] : []), "createDirectory"],
        title: opts?.title ?? "Choose a folder",
        defaultPath: opts?.defaultPath,
      })
      if (result.canceled) return null
      return opts?.multiple ? result.filePaths : result.filePaths[0]
    },
  )

  ipcMain.handle(
    "open-file-picker",
    async (
      event: IpcMainInvokeEvent,
      opts?: { multiple?: boolean; title?: string; defaultPath?: string; extensions?: string[] },
    ) => {
      const result = await dialog.showOpenDialog({
        properties: ["openFile", ...(opts?.multiple ? ["multiSelections" as const] : [])],
        title: opts?.title ?? "Choose a file",
        defaultPath: opts?.defaultPath,
        filters: pickerFilters(opts?.extensions),
      })
      if (result.canceled) return null
      const files = await Promise.all(
        result.filePaths.map(async (filePath) => ({
          path: filePath,
          name: basename(filePath),
          size: (await stat(filePath)).size,
        })),
      )
      assertAttachmentBudget(files)
      const token = pickedFiles.add(event.sender.id, result.filePaths)
      return { token, files }
    },
  )

  ipcMain.handle("read-picked-file", async (event: IpcMainInvokeEvent, token: string, filePath: string) => {
    return pickedFiles.read(event.sender.id, token, filePath)
  })

  ipcMain.handle("release-picked-files", (event: IpcMainInvokeEvent, token: string) => {
    pickedFiles.release(event.sender.id, token)
  })

  ipcMain.handle(
    "save-file-picker",
    async (_event: IpcMainInvokeEvent, opts?: { title?: string; defaultPath?: string }) => {
      const result = await dialog.showSaveDialog({
        title: opts?.title ?? "Save file",
        defaultPath: opts?.defaultPath,
      })
      if (result.canceled) return null
      return result.filePath ?? null
    },
  )

  ipcMain.on("open-link", (_event: IpcMainEvent, url: string) => {
    void shell.openExternal(url)
  })

  ipcMain.handle("open-path", async (_event: IpcMainInvokeEvent, path: string, app?: string) => {
    if (!app) return shell.openPath(path)
    await new Promise<void>((resolve, reject) => {
      const [cmd, args] =
        process.platform === "darwin" ? (["open", ["-a", app, path]] as const) : ([app, [path]] as const)
      execFile(cmd, args, (err) => (err ? reject(err) : resolve()))
    })
  })

  ipcMain.handle("reveal-path", async (_event: IpcMainInvokeEvent, path: string) => {
    const exists = await stat(path).then(
      () => true,
      () => false,
    )
    if (!exists) return false
    shell.showItemInFolder(path)
    return true
  })

  ipcMain.handle("read-clipboard-image", () => {
    const image = clipboard.readImage()
    if (image.isEmpty()) return null
    const buffer = image.toPNG().buffer
    const size = image.getSize()
    return { buffer, width: size.width, height: size.height }
  })

  ipcMain.on("show-notification", (_event: IpcMainEvent, title: string, body?: string) => {
    new Notification({ title, body }).show()
  })

  ipcMain.handle("get-window-count", () => BrowserWindow.getAllWindows().length)

  ipcMain.handle("get-window-id", (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) throw new Error("Window not found")
    const id = getWindowID(win)
    if (!id) throw new Error("Window ID not found")
    return id
  })

  ipcMain.handle("get-window-focused", (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isFocused() ?? false
  })

  ipcMain.handle("set-window-focus", (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.focus()
  })

  ipcMain.handle("show-window", (event: IpcMainInvokeEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.show()
  })

  ipcMain.on("relaunch", () => {
    deps.relaunch()
  })

  ipcMain.handle("get-zoom-factor", (event: IpcMainInvokeEvent) => event.sender.getZoomFactor())
  ipcMain.handle("set-zoom-factor", (event: IpcMainInvokeEvent, factor: number) => {
    event.sender.setZoomFactor(factor)
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    updateTitlebar(win)
  })
  ipcMain.handle("get-pinch-zoom-enabled", () => getPinchZoomEnabled())
  ipcMain.handle("set-pinch-zoom-enabled", (_event: IpcMainInvokeEvent, enabled: boolean) => {
    setPinchZoomEnabled(enabled)
  })
  ipcMain.handle("set-titlebar", (event: IpcMainInvokeEvent, theme: TitlebarTheme) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    setTitlebar(win, theme)
  })
  ipcMain.handle("run-desktop-menu-action", (event: IpcMainInvokeEvent, action: DesktopMenuAction) => {
    runDesktopMenuAction(BrowserWindow.fromWebContents(event.sender), action, {
      checkForUpdates: () => void deps.showUpdater(),
      relaunch: deps.relaunch,
    })
  })

  ipcMain.handle("transcribe-audio", async (_event: IpcMainInvokeEvent, audioBase64: string, mimeType: string) => {
    const apiKey = findOpenAIKey()
    if (!apiKey) {
      throw new Error("No OpenAI API key found. Set OPENAI_API_KEY environment variable or add an OpenAI provider in ZYRAXON config.")
    }

    const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("mp4") ? "mp4" : "wav"
    const formData = new FormData()
    const binaryStr = atob(audioBase64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: mimeType })
    formData.append("file", blob, `audio.${ext}`)
    formData.append("model", "whisper-1")
    formData.append("response_format", "text")

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text().catch(() => "Unknown error")
      throw new Error(`OpenAI Whisper API error (${res.status}): ${err}`)
    }

    return (await res.text()).trim()
  })
  // YouTube Live Streaming
  ipcMain.handle("youtube-stream-start", (event: IpcMainInvokeEvent, config: { streamKey: string; streamUrl?: string; youtubeApiKey?: string; quality?: "4k" | "1440p" | "1080p" | "720p" }) => {
    streamManager.on("status", (state) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send("youtube-stream-status", state)
      }
    })
    streamManager.on("viewers", (count: number) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send("youtube-stream-viewers", count)
      }
    })
    streamManager.on("duration", (seconds: number) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send("youtube-stream-duration", seconds)
      }
    })
    return streamManager.start(config)
  })

  ipcMain.handle("youtube-stream-stop", () => {
    return streamManager.stop()
  })

  ipcMain.handle("youtube-stream-status", () => {
    return streamManager.getState()
  })
}

export function sendMenuCommand(win: BrowserWindow, id: string) {
  win.webContents.send("menu-command", id)
}

export function sendDeepLinks(win: BrowserWindow, urls: string[]) {
  win.webContents.send("deep-link", urls)
}

function findOpenAIKey(): string | null {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY

  const configDirs = [
    join(app.getPath("home"), ".config", "zyraxon"),
    join(app.getPath("home"), ".config", "opencode"),
    app.getPath("userData"),
  ]

  for (const dir of configDirs) {
    for (const name of ["config.json", "zyraxon.json", "zyraxon.jsonc"]) {
      const filePath = join(dir, name)
      if (!existsSync(filePath)) continue
      try {
        const raw = readFileSync(filePath, "utf-8")
        const cleaned = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
        const config = JSON.parse(cleaned)
        const providers = config?.provider
        if (!providers || typeof providers !== "object") continue
        for (const [id, info] of Object.entries(providers)) {
          const p = info as Record<string, unknown>
          if (typeof p.apiKey === "string" && p.apiKey && (id === "openai" || id.includes("openai"))) {
            return p.apiKey
          }
          if (typeof p.api_key === "string" && p.api_key && (id === "openai" || id.includes("openai"))) {
            return p.api_key
          }
        }
        for (const [id, info] of Object.entries(providers)) {
          const p = info as Record<string, unknown>
          if (typeof p.apiKey === "string" && p.apiKey) return p.apiKey
          if (typeof p.api_key === "string" && p.api_key) return p.api_key
        }
      } catch {
        continue
      }
    }
  }

  return null
}
