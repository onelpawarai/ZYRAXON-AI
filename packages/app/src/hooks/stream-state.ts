import { createSignal } from "solid-js"

const [viewerCount, setViewerCount] = createSignal(0)
const [streamStatus, setStreamStatus] = createSignal<"idle" | "starting" | "streaming" | "stopping" | "error">("idle")

let initialized = false

export function initStreamListeners() {
  if (initialized) return
  const api = (window as any).api
  if (!api) return
  initialized = true

  api.onYouTubeStreamStatus?.((state: { status: string; viewerCount?: number; resolution?: string }) => {
    setStreamStatus(state.status as any)
  })

  api.onYouTubeStreamViewers?.((count: number) => {
    setViewerCount(count)
  })
}

export { viewerCount, setViewerCount, streamStatus, setStreamStatus }
