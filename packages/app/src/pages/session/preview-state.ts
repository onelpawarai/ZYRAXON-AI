/**
 * Shared preview state for in-app website preview.
 * Used by session header (toggle button) and session side panel (preview tab).
 */
import { createSignal, type Accessor, type Setter } from "solid-js"

const [previewActive, setPreviewActive] = createSignal(false)
const DEFAULT_PREVIEW_WIDTH = 600
const [previewWidth, setPreviewWidth] = createSignal(DEFAULT_PREVIEW_WIDTH)

export function getPreviewActive(): Accessor<boolean> {
  return previewActive
}

export function setPreviewActiveState(active: boolean): void {
  setPreviewActive(active)
}

export function togglePreview(): void {
  setPreviewActive((prev) => !prev)
}

export function getPreviewWidth(): Accessor<number> {
  return previewWidth
}

export function setPreviewWidthState(width: number): void {
  setPreviewWidth(Math.max(360, Math.min(1200, width)))
}
