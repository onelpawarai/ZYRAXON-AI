/**
 * SITE PREVIEW TOOL
 *
 * Sets the in-app preview URL so the website shows inside the application.
 * Called automatically after site_create and site_publish, or manually by the AI.
 */

import { Effect, Schema } from "effect"
import { Tool } from "../tool/tool"
import { getSiteManager, writePreviewState } from "../pro-builder/engine"

const DESCRIPTION = `Set the in-app preview URL for a website.

Actions:
- set: Set the preview to a specific URL (local or published)
- start: Start local server and set preview to localhost
- status: Get current preview state

The preview appears inside the application as a split-view panel.
Use this tool after publishing to show the live GitHub Pages URL in the preview.
Use "start" to preview locally before publishing.`

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "Action: set, start, or status",
  }),
  siteId: Schema.String.annotate({
    description: "The site ID to preview",
  }),
  url: Schema.optional(Schema.String).annotate({
    description: "URL to set as preview (for 'set' action). Can be localhost or GitHub Pages URL.",
  }),
})

export const SitePreviewTool = Tool.define<typeof Parameters>(
  "site_preview",
  Effect.gen(function* () {
    return {
      description: DESCRIPTION,
      parameters: Parameters,
      execute: (params, ctx) =>
        Effect.gen(function* () {
          const result = yield* Effect.promise(async () => {
            const manager = await getSiteManager()

            switch (params.action) {
              case "set": {
                if (!params.url) {
                  return { success: false, output: "", error: "URL is required for 'set' action" }
                }

                const site = manager.getSite(params.siteId)
                if (!site) {
                  return { success: false, output: "", error: `Site not found: ${params.siteId}` }
                }

                await writePreviewState({
                  url: params.url,
                  siteName: site.name,
                  siteId: site.id,
                  timestamp: new Date().toISOString(),
                })

                return {
                  success: true,
                  output: JSON.stringify({
                    message: `Preview set to ${params.url} for "${site.name}". The website is now visible in the app.`,
                    siteId: site.id,
                    url: params.url,
                    siteName: site.name,
                  }, null, 2),
                }
              }

              case "start": {
                const site = manager.getSite(params.siteId)
                if (!site) {
                  return { success: false, output: "", error: `Site not found: ${params.siteId}` }
                }

                const url = await manager.startServer(params.siteId)
                await writePreviewState({
                  url,
                  siteName: site.name,
                  siteId: site.id,
                  timestamp: new Date().toISOString(),
                })

                return {
                  success: true,
                  output: JSON.stringify({
                    message: `Local server started for "${site.name}". Preview is now active at ${url}.`,
                    siteId: site.id,
                    url,
                    siteName: site.name,
                  }, null, 2),
                }
              }

              case "status": {
                const { readPreviewState } = await import("../pro-builder/engine")
                const state = await readPreviewState()
                return {
                  success: true,
                  output: JSON.stringify({
                    currentUrl: state.url,
                    siteName: state.siteName,
                    siteId: state.siteId,
                    timestamp: state.timestamp,
                    hasPreview: !!state.url,
                  }, null, 2),
                }
              }

              default:
                return { success: false, output: "", error: `Unknown action: ${params.action}. Use set, start, or status.` }
            }
          })

          return {
            title: `Site preview ${params.action}`,
            metadata: {},
            output: result.output || (result.success ? "Action completed" : result.error || "Unknown error"),
          }
        }),
    }
  }),
)
