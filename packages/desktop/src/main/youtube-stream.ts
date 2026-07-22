import { spawn, type ChildProcess } from "node:child_process"
import { EventEmitter } from "node:events"

export type StreamStatus = "idle" | "starting" | "streaming" | "stopping" | "error"

export type StreamState = {
  status: StreamStatus
  error?: string
  viewerCount: number
  streamDuration: number
  rtmpUrl: string
  resolution: string
}

export type YouTubeStreamConfig = {
  streamKey: string
  streamUrl?: string
  youtubeApiKey?: string
  quality?: "4k" | "1440p" | "1080p" | "720p"
}

export class YouTubeStreamManager extends EventEmitter {
  private process: ChildProcess | null = null
  private status: StreamStatus = "idle"
  private error: string | undefined
  private viewerCount = 0
  private streamStartTime = 0
  private viewerPollTimer: ReturnType<typeof setInterval> | null = null
  private durationTimer: ReturnType<typeof setInterval> | null = null
  private config: YouTubeStreamConfig = { streamKey: "" }

  getState(): StreamState {
    return {
      status: this.status,
      error: this.error,
      viewerCount: this.viewerCount,
      streamDuration: this.status === "streaming" ? Math.floor((Date.now() - this.streamStartTime) / 1000) : 0,
      rtmpUrl: this.getFullRtmpUrl(),
      resolution: this.getResolution(),
    }
  }

  private getFullRtmpUrl(): string {
    const base = this.config.streamUrl || "rtmp://a.rtmp.youtube.com/live2"
    return `${base}/${this.config.streamKey}`
  }

  private getResolution(): string {
    switch (this.config.quality) {
      case "4k": return "3840x2160"
      case "1440p": return "2560x1440"
      case "1080p": return "1920x1080"
      case "720p": return "1280x720"
      default: return "3840x2160"
    }
  }

  private getBitrate(): string {
    switch (this.config.quality) {
      case "4k": return "20000k"
      case "1440p": return "13000k"
      case "1080p": return "8000k"
      case "720p": return "4500k"
      default: return "20000k"
    }
  }

  private getMaxBitrate(): string {
    switch (this.config.quality) {
      case "4k": return "25000k"
      case "1440p": return "18000k"
      case "1080p": return "12000k"
      case "720p": return "6000k"
      default: return "25000k"
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

  async start(config: YouTubeStreamConfig): Promise<StreamState> {
    if (this.status === "streaming" || this.status === "starting") {
      return this.getState()
    }

    this.config = config
    this.error = undefined
    this.setStatus("starting")

    const rtmpUrl = this.getFullRtmpUrl()
    const scaleFilter = this.getScaleFilter()
    const bitrate = this.getBitrate()
    const maxBitrate = this.getMaxBitrate()

    // Full desktop capture at 4K quality
    // -f gdigrab captures entire primary display on Windows
    // -i screen = primary monitor
    // Even when app is minimized, ffmpeg keeps streaming
    const ffmpegArgs = [
      "-f", "gdigrab",
      "-framerate", "30",
      "-i", "screen",
      "-vf", scaleFilter,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-b:v", bitrate,
      "-maxrate", maxBitrate,
      "-bufsize", "40000k",
      "-pix_fmt", "yuv420p",
      "-g", "60",
      "-movflags", "+faststart",
      "-f", "flv",
      rtmpUrl,
    ]

    try {
      this.process = spawn("ffmpeg", ffmpegArgs, {
        stdio: ["ignore", "pipe", "pipe"],
        // Detach process so it survives app minimize/close
        detached: false,
      })

      this.process.on("error", (err) => {
        this.handleError(`Failed to start ffmpeg: ${err.message}`)
      })

      this.process.on("exit", (code, signal) => {
        if (this.status === "stopping") {
          this.setStatus("idle")
        } else if (code !== null && code !== 0) {
          this.handleError(`ffmpeg exited with code ${code}`)
        } else if (signal) {
          this.handleError(`ffmpeg killed by signal ${signal}`)
        } else {
          this.setStatus("idle")
        }
      })

      this.process.stderr?.on("data", (data: Buffer) => {
        const output = data.toString()
        if (output.includes("error") || output.includes("Error")) {
          console.error("[ffmpeg stderr]", output.slice(0, 500))
        }
      })

      this.streamStartTime = Date.now()
      this.setStatus("streaming")

      this.startViewerPolling()
      this.startDurationTimer()
    } catch (err: any) {
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
        this.process.kill("SIGTERM")
        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => {
            if (this.process) {
              this.process.kill("SIGKILL")
            }
            resolve()
          }, 5000)
          this.process?.once("exit", () => {
            clearTimeout(timer)
            resolve()
          })
        })
      } catch {
        // process already dead
      }
      this.process = null
    }

    this.viewerCount = 0
    this.setStatus("idle")
    return this.getState()
  }

  private setStatus(status: StreamStatus) {
    this.status = status
    this.emit("status", this.getState())
  }

  private handleError(message: string) {
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
      } catch {
        // silently ignore poll failures
      }
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
      this.process.kill("SIGKILL")
      this.process = null
    }
  }
}
