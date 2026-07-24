/**
 * SITE PREVIEW COMPONENT
 *
 * Shows live preview of published GitHub Pages site in an iframe.
 * Split view: chat left, preview right.
 * Auto-activates after publish. Supports responsive toggles.
 */

import { createSignal, onCleanup, onMount, Show, Match, Switch } from "solid-js"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { TooltipKeybind } from "@opencode-ai/ui/tooltip"
import { IconButtonV2 } from "@opencode-ai/ui/v2/icon-button-v2"
import { TooltipV2 } from "@opencode-ai/ui/v2/tooltip-v2"

type DeviceMode = "desktop" | "tablet" | "mobile"

type PreviewState = {
  url: string | null
  siteName: string | null
  siteId: string | null
  timestamp: string
}

declare global {
  interface Window {
    api?: {
      getPreviewState: () => Promise<PreviewState>
      setPreviewState: (state: PreviewState) => Promise<void>
      onSitePreviewUpdate: (cb: (state: PreviewState) => void) => () => void
      openLink?: (url: string) => void
    }
  }
}

// ─── Device Frame Widths ────────────────────────────────────────────────────

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

const DEVICE_HEIGHTS: Record<DeviceMode, string> = {
  desktop: "100%",
  tablet: "1024px",
  mobile: "812px",
}

const DEVICE_LABELS: Record<DeviceMode, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
}

// ─── SitePreview Component ──────────────────────────────────────────────────

export function SitePreview() {
  const [preview, setPreview] = createSignal<PreviewState>({
    url: null,
    siteName: null,
    siteId: null,
    timestamp: new Date().toISOString(),
  })
  const [device, setDevice] = createSignal<DeviceMode>("desktop")
  const [loading, setLoading] = createSignal(true)
  const [iframeKey, setIframeKey] = createSignal(0)

  let iframeRef: HTMLIFrameElement | undefined

  // Load initial state
  onMount(async () => {
    if (window.api?.getPreviewState) {
      try {
        const state = await window.api.getPreviewState()
        if (state.url) {
          setPreview(state)
          setLoading(false)
        }
      } catch {}
    }

    // Subscribe to updates
    if (window.api?.onSitePreviewUpdate) {
      const unsub = window.api.onSitePreviewUpdate((state) => {
        setPreview(state)
        if (state.url) {
          setLoading(false)
          // Auto-refresh iframe when URL changes
          setIframeKey((k) => k + 1)
        }
      })
      onCleanup(unsub)
    }
  })

  const hasUrl = () => !!preview().url

  const refreshIframe = () => {
    setIframeKey((k) => k + 1)
  }

  const cycleDevice = () => {
    const modes: DeviceMode[] = ["desktop", "tablet", "mobile"]
    const idx = modes.indexOf(device())
    setDevice(modes[(idx + 1) % modes.length])
  }

  const openInBrowser = () => {
    if (preview().url) {
      if (window.api?.openLink) {
        window.api.openLink(preview().url)
      } else {
        window.open(preview().url, "_blank")
      }
    }
  }

  return (
    <div class="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div class="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border-weaker-base">
        <div class="flex items-center gap-2 min-w-0">
          <Show when={hasUrl()}>
            <div class="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span class="text-12-regular text-text truncate max-w-[180px]">
              {preview().siteName || "Live Preview"}
            </span>
          </Show>
          <Show when={!hasUrl()}>
            <span class="text-12-regular text-text-weak">No preview</span>
          </Show>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          {/* Device toggle */}
          <Show when={hasUrl()}>
            <TooltipV2 value={`Device: ${DEVICE_LABELS[device()]}`} placement="bottom">
              <IconButtonV2
                icon={
                  <Switch>
                    <Match when={device() === "desktop"}>
                      <Icon name="monitor" size="small" />
                    </Match>
                    <Match when={device() === "tablet"}>
                      <Icon name="tablet" size="small" />
                    </Match>
                    <Match when={device() === "mobile"}>
                      <Icon name="smartphone" size="small" />
                    </Match>
                  </Switch>
                }
                variant="ghost-muted"
                size="normal"
                onClick={cycleDevice}
              />
            </TooltipV2>
            {/* Refresh */}
            <TooltipV2 value="Refresh preview" placement="bottom">
              <IconButtonV2
                icon={<Icon name="refresh" size="small" />}
                variant="ghost-muted"
                size="normal"
                onClick={refreshIframe}
              />
            </TooltipV2>
            {/* Open in browser */}
            <TooltipV2 value="Open in browser" placement="bottom">
              <IconButtonV2
                icon={<Icon name="external-link" size="small" />}
                variant="ghost-muted"
                size="normal"
                onClick={openInBrowser}
              />
            </TooltipV2>
          </Show>
        </div>
      </div>

      {/* Iframe Container */}
      <div class="flex-1 min-h-0 overflow-hidden flex items-start justify-center bg-background-base">
        <Show
          when={hasUrl()}
          fallback={
            <div class="h-full w-full flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div class="w-16 h-16 rounded-2xl bg-surface-base flex items-center justify-center">
                <Icon name="globe" size="large" class="text-text-weak" />
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-14-medium text-text">No site published yet</div>
                <div class="text-12-regular text-text-weak max-w-[240px]">
                  Publish your website to see a live preview here
                </div>
              </div>
            </div>
          }
        >
          <div
            class="h-full overflow-hidden transition-all duration-300"
            style={{
              width: DEVICE_WIDTHS[device()],
              "max-width": "100%",
              "background": device() !== "desktop" ? "var(--v2-background-bg-base, #0a0a0a)" : "transparent",
            }}
          >
            {/* Device frame for mobile/tablet */}
            <Show when={device() !== "desktop"}>
              <div
                class="h-full mx-auto overflow-hidden"
                style={{
                  "max-width": DEVICE_WIDTHS[device()],
                  "border-left": "1px solid var(--border-weaker-base, #2a2a2a)",
                  "border-right": "1px solid var(--border-weaker-base, #2a2a2a)",
                }}
              >
                <iframe
                  ref={iframeRef}
                  key={iframeKey()}
                  src={preview().url!}
                  class="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  title={`Preview: ${preview().siteName || "Site"}`}
                />
              </div>
            </Show>

            {/* Desktop: full width iframe */}
            <Show when={device() === "desktop"}>
              <iframe
                ref={iframeRef}
                key={iframeKey()}
                src={preview().url!}
                class="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title={`Preview: ${preview().siteName || "Site"}`}
              />
            </Show>
          </div>
        </Show>
      </div>

      {/* Status Bar */}
      <Show when={hasUrl()}>
        <div class="shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-border-weaker-base bg-surface-base">
          <div class="text-11-regular text-text-faint truncate max-w-[200px]">
            {preview().url}
          </div>
          <div class="text-11-regular text-text-faint shrink-0">
            {DEVICE_LABELS[device()]}
          </div>
        </div>
      </Show>
    </div>
  )
}
