import { createSignal } from "solid-js"

const [viewerCount, setViewerCount] = createSignal(0)
const [streamStatus, setStreamStatus] = createSignal<"idle" | "starting" | "streaming" | "stopping" | "error">("idle")
const [captureMode, setCaptureMode] = createSignal<"fullscreen" | "app">("fullscreen")
const [audioMode, setAudioMode] = createSignal<"none" | "microphone" | "system">("system")
const [systemAudioAvailable, setSystemAudioAvailable] = createSignal(false)
const [probedDevices, setProbedDevices] = createSignal<string[]>([])

let initialized = false

export function initStreamListeners() {
  if (initialized) return
  const api = (window as any).api
  if (!api) return
  initialized = true

  api.onYouTubeStreamStatus?.((state: { status: string; viewerCount?: number; resolution?: string; captureMode?: string; audioMode?: string; systemAudioAvailable?: boolean }) => {
    setStreamStatus(state.status as any)
    if (state.captureMode) setCaptureMode(state.captureMode as "fullscreen" | "app")
    if (state.audioMode) setAudioMode(state.audioMode as "none" | "microphone" | "system")
    if (state.systemAudioAvailable !== undefined) setSystemAudioAvailable(state.systemAudioAvailable)
  })

  api.onYouTubeStreamViewers?.((count: number) => {
    setViewerCount(count)
  })
}

export { viewerCount, setViewerCount, streamStatus, setStreamStatus, captureMode, setCaptureMode, audioMode, setAudioMode, systemAudioAvailable, setSystemAudioAvailable, probedDevices, setProbedDevices }
