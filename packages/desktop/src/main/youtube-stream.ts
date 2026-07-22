import { spawn, execFile, execFileSync } from "node:child_process"
import { EventEmitter } from "node:events"
import { createConnection } from "node:net"
import { URL } from "node:url"
import { appendFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { app } from "electron"

export type StreamStatus = "idle" | "starting" | "streaming" | "stopping" | "error"

export type CaptureMode = "fullscreen" | "app"

export type AudioMode = "none" | "microphone" | "system"

export type StreamState = {
  status: StreamStatus
  error?: string
  viewerCount: number
  streamDuration: number
  rtmpUrl: string
  resolution: string
  captureMode: CaptureMode
  audioMode: AudioMode
  systemAudioAvailable: boolean
}

export type YouTubeStreamConfig = {
  streamKey: string
  streamUrl?: string
  youtubeApiKey?: string
  quality?: "4k" | "1440p" | "1080p" | "720p"
  captureMode?: CaptureMode
  audioMode?: AudioMode
}

let _ffmpegPath: string | null = null

function logStreamDebug(message: string) {
  try {
    const logDir = join(app.getPath("userData"), "logs")
    mkdirSync(logDir, { recursive: true })
    const ts = new Date().toISOString()
    appendFileSync(join(logDir, "stream-debug.log"), `[${ts}] ${message}\n`)
  } catch {}
}

function sanitizeStreamKey(key: string): string {
  return key.replace(/[\r\n\t]/g, "").replace(/\s+/g, "").trim()
}

function findFfmpeg(): string {
  if (_ffmpegPath) return _ffmpegPath
  try {
    execFileSync("ffmpeg", ["-version"], { timeout: 5000, stdio: "pipe" })
    _ffmpegPath = "ffmpeg"
    return _ffmpegPath
  } catch {
    throw new Error("ffmpeg not found. Please install ffmpeg and ensure it is in your PATH.")
  }
}

function probeAudioDevices(ffmpegPath: string): Promise<string[]> {
  return new Promise((resolve) => {
    execFile(ffmpegPath, ["-list_devices", "true", "-f", "dshow", "-i", "dummy"], { timeout: 10000 }, (_err, _stdout, stderr) => {
      const output = stderr || ""
      const devices: string[] = []
      const regex = /"([^"]+)" \(audio\)/g
      let match
      while ((match = regex.exec(output)) !== null) {
        devices.push(match[1])
      }
      resolve(devices)
    })
  })
}

function testRtmpConnectivity(rtmpUrl: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(rtmpUrl)
      const host = parsed.hostname
      const port = parsed.port ? parseInt(parsed.port) : 1935
      const socket = createConnection({ host, port, timeout: 8000 })
      const timer = setTimeout(() => {
        socket.destroy()
        resolve({ ok: false, error: `Connection to ${host}:${port} timed out after 8s` })
      }, 8000)
      socket.on("connect", () => {
        clearTimeout(timer)
        socket.destroy()
        console.log(`[YouTubeStream] RTMP connectivity OK: ${host}:${port}`)
        resolve({ ok: true })
      })
      socket.on("error", (err: any) => {
        clearTimeout(timer)
        socket.destroy()
        resolve({ ok: false, error: `Cannot connect to ${host}:${port}: ${err.message}` })
      })
      socket.on("timeout", () => {
        clearTimeout(timer)
        socket.destroy()
        resolve({ ok: false, error: `Connection to ${host}:${port} timed out` })
      })
    } catch (err: any) {
      resolve({ ok: false, error: `Invalid RTMP URL: ${err.message}` })
    }
  })
}

async function findExactWindowTitle(title: string): Promise<string | null> {
  return new Promise((resolve) => {
    execFile("powershell", [
      "-Command",
      `Get-Process | Where-Object { $_.MainWindowTitle -like "*${title}*" } | Select-Object -First 1 -ExpandProperty MainWindowTitle`,
    ], { timeout: 10000 }, (_err, stdout) => {
      const exact = (stdout || "").trim()
      resolve(exact.length > 0 ? exact : null)
    })
  })
}

export class YouTubeStreamManager extends EventEmitter {
  private process: ReturnType<typeof spawn> | null = null
  private status: StreamStatus = "idle"
  private error: string | undefined
  private viewerCount = 0
  private streamStartTime = 0
  private viewerPollTimer: ReturnType<typeof setInterval> | null = null
  private durationTimer: ReturnType<typeof setInterval> | null = null
  private config: YouTubeStreamConfig = { streamKey: "" }
  private currentCaptureMode: CaptureMode = "fullscreen"
  private currentAudioMode: AudioMode = "system"
  private _systemAudioAvailable = false
  private _probedDevices: string[] = []

  get systemAudioAvailable(): boolean { return this._systemAudioAvailable }
  get probedDevices(): string[] { return this._probedDevices }

  async probeDevices(): Promise<{ systemAudioAvailable: boolean; devices: string[] }> {
    const ffmpegPath = findFfmpeg()
    this._probedDevices = await probeAudioDevices(ffmpegPath)
    this._systemAudioAvailable = this._probedDevices.some((d) =>
      d.toLowerCase().includes("virtual") ||
      d.toLowerCase().includes("cable") ||
      d.toLowerCase().includes("loopback") ||
      d.toLowerCase().includes("stereo mix") ||
      d.toLowerCase().includes("what u hear")
    )
    console.log("[YouTubeStream] Probed audio devices:", this._probedDevices)
    console.log("[YouTubeStream] System audio available:", this._systemAudioAvailable)
    return { systemAudioAvailable: this._systemAudioAvailable, devices: this._probedDevices }
  }

  getState(): StreamState {
    return {
      status: this.status,
      error: this.error,
      viewerCount: this.viewerCount,
      streamDuration: this.status === "streaming" ? Math.floor((Date.now() - this.streamStartTime) / 1000) : 0,
      rtmpUrl: this.getFullRtmpUrl(),
      resolution: this.getResolution(),
      captureMode: this.currentCaptureMode,
      audioMode: this.currentAudioMode,
      systemAudioAvailable: this._systemAudioAvailable,
    }
  }

  private getFullRtmpUrl(): string {
    const base = this.config.streamUrl || "rtmp://a.rtmp.youtube.com/live2"
    const key = this.config.streamKey
    if (!key) return base
    return `${base}/${key}`
  }

  private getResolution(): string {
    switch (this.config.quality) {
      case "4k": return "3840x2160"
      case "1440p": return "2560x1440"
      case "1080p": return "1920x1080"
      case "720p": return "1280x720"
      default: return "1920x1080"
    }
  }

  private getBitrate(): string {
    switch (this.config.quality) {
      case "4k": return "40000k"
      case "1440p": return "20000k"
      case "1080p": return "12000k"
      case "720p": return "6000k"
      default: return "12000k"
    }
  }

  private getMaxBitrate(): string {
    switch (this.config.quality) {
      case "4k": return "50000k"
      case "1440p": return "25000k"
      case "1080p": return "15000k"
      case "720p": return "8000k"
      default: return "15000k"
    }
  }

  private getScaleFilter(): string {
    switch (this.config.quality) {
      case "4k": return "scale=3840:2160:flags=lanczos"
      case "1440p": return "scale=2560:1440:flags=lanczos"
      case "1080p": return "scale=1920:1080:flags=lanczos"
      case "720p": return "scale=1280:720:flags=lanczos"
      default: return "scale=3840:2160:flags=lanczos"
    }
  }

  private async buildVideoInput(): Promise<string[]> {
    if (this.currentCaptureMode === "app") {
      const exactTitle = await findExactWindowTitle("ZYRAXON")
      if (exactTitle) {
        logStreamDebug(`Found exact window title: "${exactTitle}"`)
        console.log(`[YouTubeStream] Capturing window: "${exactTitle}"`)
        return ["-f", "gdigrab", "-framerate", "60", "-i", `title=${exactTitle}`]
      }
      console.log("[YouTubeStream] App window not found, falling back to full desktop")
      logStreamDebug("App window not found, falling back to full desktop")
    }
    return ["-f", "gdigrab", "-framerate", "60", "-i", "desktop"]
  }

  private buildAudioInput(): string[] {
    if (this.currentAudioMode === "microphone") {
      return ["-f", "dshow", "-i", "audio=Microphone Array (Realtek Audio)"]
    }
    if (this.currentAudioMode === "system" && this._systemAudioAvailable) {
      const systemDevice = this._probedDevices.find((d) =>
        d.toLowerCase().includes("virtual") ||
        d.toLowerCase().includes("cable") ||
        d.toLowerCase().includes("stereo mix")
      )
      if (systemDevice) {
        return ["-f", "dshow", "-i", `audio=${systemDevice}`]
      }
    }
    return ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
  }

  async start(config: YouTubeStreamConfig): Promise<StreamState> {
    if (this.status === "streaming" || this.status === "starting") {
      return this.getState()
    }

    const sanitizedKey = sanitizeStreamKey(config.streamKey)
    logStreamDebug(`Raw key length=${config.streamKey.length} sanitized length=${sanitizedKey.length} changed=${config.streamKey !== sanitizedKey}`)
    this.config = { ...config, streamKey: sanitizedKey }
    this.currentCaptureMode = config.captureMode || "fullscreen"
    this.currentAudioMode = config.audioMode ?? "system"
    this.error = undefined
    this.setStatus("starting")

    let ffmpegPath: string
    try {
      ffmpegPath = findFfmpeg()
    } catch (err: any) {
      this.handleError(err.message)
      return this.getState()
    }

    if (this.currentAudioMode === "system") {
      await this.probeDevices()
      if (!this._systemAudioAvailable) {
        this.currentAudioMode = "none"
        console.log("[YouTubeStream] No system audio device found, falling back to silent")
      }
    }

    const rtmpUrl = this.getFullRtmpUrl()

    console.log("[YouTubeStream] Checking RTMP connectivity...")
    logStreamDebug(`Testing RTMP connectivity to: ${rtmpUrl}`)
    const connTest = await testRtmpConnectivity(rtmpUrl)
    logStreamDebug(`RTMP connectivity result: ok=${connTest.ok} error=${connTest.error || "none"}`)
    if (!connTest.ok) {
      this.handleError(`RTMP connection failed: ${connTest.error}. Make sure your stream key is correct and your network allows RTMP (port 1935).`)
      return this.getState()
    }

    const bitrate = this.getBitrate()
    const maxBitrate = this.getMaxBitrate()

    const videoInput = await this.buildVideoInput()
    const audioInput = this.buildAudioInput()

    const targetW = this.config.quality === "4k" ? 3840 : this.config.quality === "1440p" ? 2560 : this.config.quality === "1080p" ? 1920 : 1280
    const targetH = this.config.quality === "4k" ? 2160 : this.config.quality === "1440p" ? 1440 : this.config.quality === "1080p" ? 1080 : 720
    const filterComplex = `[0:v]scale=${targetW}:${targetH}:flags=lanczos,format=yuv420p,fps=60[v];[1:a]aresample=44100[a]`

    const ffmpegArgs = [
      ...videoInput,
      ...audioInput,
      "-filter_complex", filterComplex,
      "-map", "[v]",
      "-map", "[a]",
      "-c:v", "libx264",
      "-preset", "slow",
      "-tune", "film",
      "-profile:v", "high",
      "-level", "4.2",
      "-pix_fmt", "yuv420p",
      "-b:v", bitrate,
      "-maxrate", maxBitrate,
      "-bufsize", "40000k",
      "-g", "120",
      "-keyint_min", "60",
      "-sc_threshold", "0",
      "-bf", "2",
      "-refs", "4",
      "-c:a", "aac",
      "-b:a", "192k",
      "-ar", "44100",
      "-ac", "2",
      "-shortest",
      "-f", "flv",
      rtmpUrl,
    ]

    console.log("[YouTubeStream] ffmpeg path:", ffmpegPath)
    console.log("[YouTubeStream] ffmpeg args:", ffmpegArgs.join(" "))
    logStreamDebug(`START ffmpeg: ${ffmpegPath} ${ffmpegArgs.join(" ")}`)
    logStreamDebug(`RTMP URL: ${rtmpUrl}`)

    let stderrLog = ""

    try {
      this.process = spawn(ffmpegPath, ffmpegArgs, {
        stdio: ["pipe", "pipe", "pipe"],
        detached: false,
      })

      this.process.on("error", (err) => {
        console.error("[YouTubeStream] Process error:", err.message)
        logStreamDebug(`PROCESS ERROR: ${err.message}`)
        this.handleError(`Failed to start ffmpeg: ${err.message}`)
      })

      this.process.on("exit", (code, signal) => {
        console.log(`[YouTubeStream] ffmpeg exited: code=${code} signal=${signal}`)
        logStreamDebug(`EXIT code=${code} signal=${signal}`)
        logStreamDebug(`STDERR FULL:\n${stderrLog}`)
        if (this.status === "stopping") {
          this.setStatus("idle")
        } else if (code !== null && code !== 0) {
          const snippet = stderrLog.slice(-2000)
          console.error("[YouTubeStream] ffmpeg stderr:", snippet)
          const realError = snippet.includes("error") || snippet.includes("Error")
            ? snippet.split("\n").filter((l: string) => l.toLowerCase().includes("error") || l.includes("errno") || l.includes("code=")).join(" | ").slice(0, 500)
            : ""
          const hint = realError
            ? `FFmpeg error: ${realError}`
            : `ffmpeg exited with code ${code}. Check stream key and network.`
          this.handleError(hint)
        } else if (signal) {
          this.handleError(`ffmpeg killed by signal ${signal}`)
        } else {
          this.setStatus("idle")
        }
      })

      this.process.stderr?.on("data", (data: Buffer) => {
        const output = data.toString()
        stderrLog += output
        logStreamDebug(`STDERR CHUNK: ${output.trim().slice(0, 300)}`)
        if (output.includes("error") || output.includes("Error") || output.includes("Output #") || output.includes("Stream #")) {
          console.log("[ffmpeg]", output.trim().slice(0, 500))
        }
        if (output.includes("frame=") && this.status === "starting") {
          console.log("[YouTubeStream] Stream encoding started successfully")
          logStreamDebug("STREAM ENCODING STARTED - setting status to streaming")
          this.setStatus("streaming")
        }
      })

      this.streamStartTime = Date.now()

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          if (this.process && !this.process.killed) {
            if (this.status === "starting") {
              this.setStatus("streaming")
            }
            this.startViewerPolling()
            this.startDurationTimer()
          }
          resolve()
        }, 4000)
      })

    } catch (err: any) {
      console.error("[YouTubeStream] Spawn error:", err.message)
      this.handleError(`Failed to spawn ffmpeg: ${err.message}`)
    }

    return this.getState()
  }

  async stop(): Promise<StreamState> {
    if (this.status !== "streaming" && this.status !== "starting") {
      return this.getState()
    }

    this.setStatus("stopping")
    this.stopViewerPolling()
    this.stopDurationTimer()

    if (this.process) {
      try {
        this.process.stdin?.write("q")
        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => {
            if (this.process) {
              try { this.process.kill("SIGKILL") } catch {}
            }
            resolve()
          }, 5000)
          this.process?.once("exit", () => {
            clearTimeout(timer)
            resolve()
          })
        })
      } catch {}
      this.process = null
    }

    this.viewerCount = 0
    this.setStatus("idle")
    return this.getState()
  }

  async toggleCaptureMode(): Promise<StreamState> {
    const newMode: CaptureMode = this.currentCaptureMode === "fullscreen" ? "app" : "fullscreen"

    if (this.status === "streaming" || this.status === "starting") {
      const savedConfig = { ...this.config }
      await this.stop()
      await new Promise<void>((resolve) => setTimeout(resolve, 1500))
      return this.start({ ...savedConfig, captureMode: newMode })
    }

    this.currentCaptureMode = newMode
    return this.getState()
  }

  private setStatus(status: StreamStatus) {
    this.status = status
    this.emit("status", this.getState())
  }

  private handleError(message: string) {
    console.error("[YouTubeStream] Error:", message)
    this.error = message
    this.setStatus("error")
    this.stopViewerPolling()
    this.stopDurationTimer()
    this.process = null
  }

  private startViewerPolling() {
    this.stopViewerPolling()
    if (!this.config.youtubeApiKey) return

    this.viewerPollTimer = setInterval(async () => {
      try {
        const viewers = await this.fetchViewerCount()
        this.viewerCount = viewers
        this.emit("viewers", viewers)
      } catch {}
    }, 10000)
  }

  private stopViewerPolling() {
    if (this.viewerPollTimer) {
      clearInterval(this.viewerPollTimer)
      this.viewerPollTimer = null
    }
  }

  private startDurationTimer() {
    this.stopDurationTimer()
    this.durationTimer = setInterval(() => {
      this.emit("duration", this.getState().streamDuration)
    }, 1000)
  }

  private stopDurationTimer() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer)
      this.durationTimer = null
    }
  }

  private async fetchViewerCount(): Promise<number> {
    if (!this.config.youtubeApiKey) return 0

    const url = `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=statistics&broadcastStatus=active&key=${this.config.youtubeApiKey}`
    const res = await fetch(url)
    const data = await res.json() as any

    const items = data?.items
    if (Array.isArray(items) && items.length > 0) {
      return parseInt(items[0].statistics?.concurrentViewers ?? "0", 10)
    }
    return 0
  }

  destroy() {
    this.stopViewerPolling()
    this.stopDurationTimer()
    if (this.process) {
      try { this.process.kill("SIGKILL") } catch {}
      this.process = null
    }
  }
}
