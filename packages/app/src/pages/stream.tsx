import { createSignal, createEffect, onCleanup, Show, For } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { showToast } from "@/utils/toast"
import { useLanguage } from "@/context/language"
import { viewerCount as sharedViewerCount, setViewerCount, streamStatus as sharedStreamStatus, setStreamStatus, captureMode as sharedCaptureMode, setCaptureMode, audioMode as sharedAudioMode, setAudioMode, systemAudioAvailable as sharedSystemAudio, setSystemAudioAvailable, probedDevices as sharedProbedDevices, setProbedDevices } from "@/hooks/stream-state"

type StreamStatus = "idle" | "starting" | "streaming" | "stopping" | "error"
type StreamState = {
  status: StreamStatus
  error?: string
  viewerCount: number
  streamDuration: number
  rtmpUrl: string
  resolution: string
  captureMode: "fullscreen" | "app"
  audioMode: "none" | "microphone" | "system"
  systemAudioAvailable: boolean
}

function getApi(): any {
  return (window as any).api
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const QUALITY_OPTIONS = [
  { value: "4k", label: "4K Ultra HD (3840x2160)", desc: "Maximum quality, 20Mbps" },
  { value: "1440p", label: "2K QHD (2560x1440)", desc: "High quality, 12Mbps" },
  { value: "1080p", label: "Full HD (1920x1080)", desc: "Standard HD, 8Mbps" },
  { value: "720p", label: "HD (1280x720)", desc: "Lower bandwidth, 4Mbps" },
] as const

const CAPTURE_OPTIONS = [
  { value: "fullscreen" as const, label: "Full Screen", desc: "Stream entire monitor" },
  { value: "app" as const, label: "App Only", desc: "Stream only the ZYRAXON window" },
] as const

const AUDIO_OPTIONS = [
  { value: "none" as const, label: "No Audio", desc: "Silent stream" },
  { value: "microphone" as const, label: "Microphone", desc: "Your voice + ambient sounds" },
  { value: "system" as const, label: "System Audio", desc: "Songs, music, laptop sounds" },
] as const

export default function StreamPage() {
  const language = useLanguage()
  const [streamKey, setStreamKey] = createSignal("")
  const [streamUrl, setStreamUrl] = createSignal("rtmp://a.rtmp.youtube.com/live2")
  const [youtubeApiKey, setYoutubeApiKey] = createSignal("")
  const [quality, setQuality] = createSignal<"4k" | "1440p" | "1080p" | "720p">("4k")
  const [error, setError] = createSignal<string | undefined>()
  const [duration, setDuration] = createSignal(0)
  const [rtmpUrl, setRtmpUrl] = createSignal("")
  const [resolution, setResolution] = createSignal("3840x2160")

  const status = sharedStreamStatus
  const viewerCount = sharedViewerCount
  const captureMode = sharedCaptureMode
  const audioMode = sharedAudioMode
  const systemAudioAvailable = sharedSystemAudio
  const probedDevices = sharedProbedDevices
  const isElectron = !!getApi()

  createEffect(() => {
    if (!isElectron) return
    const api = getApi()
    const unsubs = [
      api.onYouTubeStreamStatus?.((state: StreamState) => {
        setError(state.error)
        setRtmpUrl(state.rtmpUrl)
        if (state.resolution) setResolution(state.resolution)
        if (state.captureMode) setCaptureMode(state.captureMode)
        if (state.audioMode) setAudioMode(state.audioMode)
        if (state.systemAudioAvailable !== undefined) setSystemAudioAvailable(state.systemAudioAvailable)
      }),
      api.onYouTubeStreamDuration?.((seconds: number) => {
        setDuration(seconds)
      }),
    ]
    onCleanup(() => {
      for (const unsub of unsubs) {
        if (typeof unsub === "function") unsub()
      }
    })
  })

  const probeDevices = async () => {
    if (!isElectron) return
    const api = getApi()
    try {
      const result = await api.youtubeStreamProbeDevices()
      if (result) {
        setSystemAudioAvailable(result.systemAudioAvailable)
        setProbedDevices(result.devices || [])
      }
    } catch {}
  }

  probeDevices()

  const loadSavedConfig = () => {
    if (!isElectron) return
    const savedKey = localStorage.getItem("yt_stream_key")
    const savedUrl = localStorage.getItem("yt_stream_url")
    const savedApiKey = localStorage.getItem("yt_youtube_api_key")
    const savedQuality = localStorage.getItem("yt_stream_quality") as any
    const savedCaptureMode = localStorage.getItem("yt_capture_mode") as any
    const savedAudioMode = localStorage.getItem("yt_audio_mode") as any
    if (savedKey) setStreamKey(savedKey)
    if (savedUrl) setStreamUrl(savedUrl)
    if (savedApiKey) setYoutubeApiKey(savedApiKey)
    if (savedQuality && ["4k", "1440p", "1080p", "720p"].includes(savedQuality)) setQuality(savedQuality)
    if (savedCaptureMode && ["fullscreen", "app"].includes(savedCaptureMode)) setCaptureMode(savedCaptureMode)
    if (savedAudioMode && ["none", "microphone", "system"].includes(savedAudioMode)) setAudioMode(savedAudioMode)
  }

  const saveConfig = () => {
    localStorage.setItem("yt_stream_key", streamKey())
    localStorage.setItem("yt_stream_url", streamUrl())
    localStorage.setItem("yt_youtube_api_key", youtubeApiKey())
    localStorage.setItem("yt_stream_quality", quality())
    localStorage.setItem("yt_capture_mode", captureMode())
    localStorage.setItem("yt_audio_mode", audioMode())
  }

  loadSavedConfig()

  const startStream = async () => {
    if (!isElectron) {
      showToast({ variant: "error", title: "Desktop only", description: "Streaming is only available in the Electron desktop app." })
      return
    }
    if (!streamKey()) {
      showToast({ variant: "error", title: "Stream key required", description: "Please enter your YouTube stream key." })
      return
    }
    saveConfig()
    const api = getApi()
    try {
      const state = await api.youtubeStreamStart({
        streamKey: streamKey(),
        streamUrl: streamUrl() || undefined,
        youtubeApiKey: youtubeApiKey() || undefined,
        quality: quality(),
        captureMode: captureMode(),
        audioMode: audioMode(),
      })
      setStreamStatus(state.status)
      setError(state.error)
      setRtmpUrl(state.rtmpUrl)
      if (state.resolution) setResolution(state.resolution)
      if (state.captureMode) setCaptureMode(state.captureMode)
      if (state.audioMode) setAudioMode(state.audioMode)
      if (state.systemAudioAvailable !== undefined) setSystemAudioAvailable(state.systemAudioAvailable)
    } catch (err: any) {
      showToast({ variant: "error", title: "Stream failed", description: err.message || "Failed to start stream" })
    }
  }

  const stopStream = async () => {
    if (!isElectron) return
    const api = getApi()
    try {
      const state = await api.youtubeStreamStop()
      setStreamStatus(state.status)
      setError(state.error)
    } catch (err: any) {
      showToast({ variant: "error", title: "Stop failed", description: err.message || "Failed to stop stream" })
    }
  }

  const statusColor = () => {
    switch (status()) {
      case "idle": return "#888"
      case "starting": return "#f0ad4e"
      case "streaming": return "#ff0000"
      case "stopping": return "#f0ad4e"
      case "error": return "#e74c3c"
    }
  }

  const isStreaming = () => status() === "streaming" || status() === "starting"

  return (
    <div class="flex-1 overflow-auto">
      <div class="max-w-3xl mx-auto p-8">
        <div class="flex items-center gap-4 mb-8">
          <div
            style={{ "background-color": statusColor() }}
            class="w-4 h-4 rounded-full"
          />
          <h1 class="text-3xl font-bold text-text-strong">YouTube Live Streaming</h1>
          <Show when={status() === "streaming"}>
            <div class="px-3 py-1 rounded-full text-white font-bold text-sm animate-pulse"
                 style={{ "background-color": "#ff0000" }}>
              LIVE
            </div>
          </Show>
        </div>

        <div class="flex flex-col gap-6">
          {/* Capture Mode Toggle */}
          <div class="flex flex-col gap-2">
            <label class="text-14-medium text-text-base">Capture Mode</label>
            <div class="grid grid-cols-2 gap-3">
              <For each={CAPTURE_OPTIONS}>
                {(opt) => (
                  <button
                    type="button"
                    classList={{
                      "p-4 rounded-xl border-2 text-left transition-all cursor-pointer": true,
                      "border-blue-500 bg-blue-500/10": captureMode() === opt.value,
                      "border-zinc-700 bg-background-stronger hover:border-zinc-500": captureMode() !== opt.value,
                    }}
                    onClick={() => setCaptureMode(opt.value)}
                    disabled={isStreaming()}
                  >
                    <div class="text-14-medium text-text-strong">{opt.label}</div>
                    <div class="text-12-regular text-text-weak mt-1">{opt.desc}</div>
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Audio Mode */}
          <div class="flex flex-col gap-2">
            <label class="text-14-medium text-text-base">Audio Source</label>
            <div class="grid grid-cols-3 gap-3">
              <For each={AUDIO_OPTIONS}>
                {(opt) => (
                  <button
                    type="button"
                    classList={{
                      "p-4 rounded-xl border-2 text-left transition-all cursor-pointer": true,
                      "border-green-500 bg-green-500/10": audioMode() === opt.value,
                      "border-zinc-700 bg-background-stronger hover:border-zinc-500": audioMode() !== opt.value,
                      "opacity-40 cursor-not-allowed": opt.value === "system" && !systemAudioAvailable() && audioMode() !== "system",
                    }}
                    onClick={() => {
                      if (opt.value === "system" && !systemAudioAvailable()) return
                      setAudioMode(opt.value)
                    }}
                    disabled={isStreaming()}
                  >
                    <div class="text-14-medium text-text-strong flex items-center gap-2">
                      {opt.label}
                      <Show when={opt.value === "system" && !systemAudioAvailable()}>
                        <span class="text-[10px] text-red-400 font-normal">(Not found)</span>
                      </Show>
                      <Show when={opt.value === "system" && systemAudioAvailable()}>
                        <span class="text-[10px] text-green-400 font-normal">(Detected)</span>
                      </Show>
                    </div>
                    <div class="text-12-regular text-text-weak mt-1">{opt.desc}</div>
                  </button>
                )}
              </For>
            </div>
            <Show when={!systemAudioAvailable()}>
              <div class="text-12-regular text-yellow-400 mt-1">
                System audio requires VB-CABLE or similar virtual audio device. Install from <a href="https://vb-audio.com/Cable/" target="_blank" class="underline">vb-audio.com</a> and restart the app.
              </div>
            </Show>
          </div>

          {/* Stream Key */}
          <div class="flex flex-col gap-2">
            <label class="text-14-medium text-text-base">Stream Key</label>
            <input
              type="password"
              value={streamKey()}
              onInput={(e) => setStreamKey(e.currentTarget.value)}
              placeholder="xxxx-xxxx-xxxx-xxxx"
              class="w-full px-4 py-3 rounded-xl bg-background-stronger border border-zinc-700 text-text-strong text-14-regular focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isStreaming()}
            />
          </div>

          {/* Stream URL */}
          <div class="flex flex-col gap-2">
            <label class="text-14-medium text-text-base">Stream URL (RTMP)</label>
            <input
              type="text"
              value={streamUrl()}
              onInput={(e) => setStreamUrl(e.currentTarget.value)}
              placeholder="rtmp://a.rtmp.youtube.com/live2"
              class="w-full px-4 py-3 rounded-xl bg-background-stronger border border-zinc-700 text-text-strong text-14-regular focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isStreaming()}
            />
          </div>

          {/* Quality Selector */}
          <div class="flex flex-col gap-2">
            <label class="text-14-medium text-text-base">Stream Quality</label>
            <div class="grid grid-cols-2 gap-3">
              <For each={QUALITY_OPTIONS}>
                {(opt) => (
                  <button
                    type="button"
                    classList={{
                      "p-4 rounded-xl border-2 text-left transition-all cursor-pointer": true,
                      "border-blue-500 bg-blue-500/10": quality() === opt.value,
                      "border-zinc-700 bg-background-stronger hover:border-zinc-500": quality() !== opt.value,
                    }}
                    onClick={() => setQuality(opt.value)}
                    disabled={isStreaming()}
                  >
                    <div class="text-14-medium text-text-strong">{opt.label}</div>
                    <div class="text-12-regular text-text-weak mt-1">{opt.desc}</div>
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* YouTube API Key */}
          <div class="flex flex-col gap-2">
            <label class="text-14-medium text-text-base">
              YouTube Data API Key <span class="text-text-weak">(optional, for viewer count)</span>
            </label>
            <input
              type="password"
              value={youtubeApiKey()}
              onInput={(e) => setYoutubeApiKey(e.currentTarget.value)}
              placeholder="AIza..."
              class="w-full px-4 py-3 rounded-xl bg-background-stronger border border-zinc-700 text-text-strong text-14-regular focus:outline-none focus:border-blue-500 transition-colors"
              disabled={isStreaming()}
            />
          </div>

          {/* Start/Stop Button */}
          <div class="flex gap-4 mt-2">
            <Show
              when={isStreaming()}
              fallback={
                <Button onClick={startStream} disabled={!streamKey()} class="px-8 py-3 text-16-medium">
                  Start Streaming
                </Button>
              }
            >
              <Button onClick={stopStream} variant="destructive" class="px-8 py-3 text-16-medium">
                Stop Streaming
              </Button>
            </Show>
          </div>

          {/* Error */}
          <Show when={error()}>
            <div class="p-4 rounded-xl bg-red-900/30 border border-red-800 text-red-300 text-14-regular">
              {error()}
            </div>
          </Show>

          {/* Live Stats */}
          <Show when={isStreaming()}>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="p-4 rounded-xl bg-surface-base border border-zinc-700 text-center">
                <div class="text-32-bold font-mono text-text-strong">{formatDuration(duration())}</div>
                <div class="text-12-regular text-text-weak mt-1">Duration</div>
              </div>
              <div class="p-4 rounded-xl bg-surface-base border border-zinc-700 text-center">
                <div class="text-32-bold font-mono text-text-strong">{viewerCount()}</div>
                <div class="text-12-regular text-text-weak mt-1">Viewers</div>
              </div>
              <div class="p-4 rounded-xl bg-surface-base border border-zinc-700 text-center">
                <div class="text-32-bold font-mono text-text-strong">{resolution()}</div>
                <div class="text-12-regular text-text-weak mt-1">Resolution</div>
              </div>
              <div class="p-4 rounded-xl bg-surface-base border border-zinc-700 text-center">
                <div class="text-32-bold font-mono text-text-strong">
                  {captureMode() === "app" ? "APP" : "FULL"}
                </div>
                <div class="text-12-regular text-text-weak mt-1">Capture</div>
              </div>
            </div>
          </Show>

          {/* Stream Info */}
          <Show when={isStreaming() && rtmpUrl()}>
            <div class="p-4 rounded-xl bg-surface-base border border-zinc-700">
              <div class="text-12-regular text-text-weak mb-1">Stream URL</div>
              <div class="text-13-regular text-text-strong font-mono break-all">{rtmpUrl()}</div>
            </div>
          </Show>

          {/* Electron Warning */}
          <Show when={!isElectron}>
            <div class="p-4 rounded-xl bg-yellow-900/20 border border-yellow-700 text-yellow-300 text-14-regular">
              YouTube streaming is only available in the ZYRAXON desktop app. Run the app from the Electron shell to use this feature.
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
