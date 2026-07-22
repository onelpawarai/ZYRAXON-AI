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
      case "4k": return "12000k"
      case "1440p": return "8000k"
      case "1080p": return "5000k"
      case "720p": return "2500k"
      default: return "5000k"
    }
  }

  private getMaxBitrate(): string {
    switch (this.config.quality) {
      case "4k": return "15000k"
      case "1440p": return "10000k"
      case "1080p": return "6500k"
      case "720p": return "3500k"
      default: return "6500k"
    }
  }

  private getScaleFilter(): string {
    switch (this.config.quality) {
      case "4k": return "scale=3840:2160:flags=lanczos"
      case "1440p": return "scale=2560:1440:flags=lanczos"
      case "1080p": return "scale=1920:1080:flags=lanczos"
      case "720p": return "scale=1280:720:flags=lanczos"
      default: return "scale=1920:1080:flags=lanczos"
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

    // YouTube REQUIRES both video AND audio streams.
    // -f gdigrab captures desktop video on Windows
    // -f lavfi generates silent audio so YouTube accepts the stream
    // Without audio, YouTube shows "No Data" / rejects the stream
    const ffmpegArgs = [
      // Video input: desktop capture
      "-f", "gdigrab",
      "-framerate", "30",
      "-video_size", "1920x1080",
      "-i", "desktop",
      // Audio input: silent audio (YouTube requires audio track)
      "-f", "lavfi",
      "-i", "anullsrc=r=44100:cl=stereo",
      // Video encoding
      "-vf", scaleFilter,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-b:v", bitrate,
      "-maxrate", maxBitrate,
      "-bufsize", "20000k",
      "-pix_fmt", "yuv420p",
      "-g", "60",
      // Audio encoding (silent)
      "-c:a", "aac",
      "-b:a", "128k",
      "-ar", "44100",
      // Map both streams
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-shortest",
      // Output format for YouTube RTMP
      "-f", "flv",
      rtmpUrl,
    ]

    console.log("[YouTubeStream] Starting ffmpeg with args:", ffmpegArgs.join(" "))

    try {
      this.process = spawn("ffmpeg", ffmpegArgs, {
        stdio: ["ignore", "pipe", "pipe"],
        detached: false,
      })

      this.process.on("error", (err) => {
        console.error("[YouTubeStream] Process error:", err.message)
        this.handleError(`Failed to start ffmpeg: ${err.message}`)
      })

      this.process.on("exit", (code, signal) => {
        console.log(`[YouTubeStream] ffmpeg exited: code=${code} signal=${signal}`)
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

      let stderrBuffer = ""
      this.process.stderr?.on("data", (data: Buffer) => {
        const output = data.toString()
        stderrBuffer += output
        // Log key ffmpeg messages for debugging
        if (output.includes("Stream #") || output.includes("error") || output.includes("Error") ||
            output.includes("Output #") || output.includes("encoder") || output.includes("rtmp")) {
          console.log("[ffmpeg]", output.trim().slice(0, 300))
        }
        // If we see encoding has started, the stream is working
        if (output.includes("frame=") && this.status === "starting") {
          console.log("[YouTubeStream] Stream encoding started successfully")
          this.setStatus("streaming")
        }
      })

      this.streamStartTime = Date.now()

      // Wait briefly for ffmpeg to initialize, then check if it started
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          if (this.process && !this.process.killed) {
            if (this.status === "starting") {
              // If we haven't detected encoding yet, assume it's working
              // (ffmpeg may not output "frame=" immediately)
              this.setStatus("streaming")
            }
            this.startViewerPolling()
            this.startDurationTimer()
          }
          resolve()
        }, 3000)
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
        // Send 'q' to ffmpeg to gracefully stop encoding
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
      try { this.process.kill("SIGKILL") } catch {}
      this.process = null
    }
  }
}
