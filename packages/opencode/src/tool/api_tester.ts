import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import https from "https"
import http from "http"

function makeRequest(url: string, options: { method?: string; headers?: Record<string, string>; body?: string; timeout?: number } = {}): Promise<{ status: number; headers: Record<string, string>; body: string; time: number }> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === "https:" ? https : http

    const req = client.request(url, {
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: options.timeout || 30000,
    }, (res) => {
      let body = ""
      res.on("data", (chunk) => { body += chunk })
      res.on("end", () => {
        const headers: Record<string, string> = {}
        for (const [key, value] of Object.entries(res.headers)) {
          if (typeof value === "string") headers[key] = value
        }
        resolve({
          status: res.statusCode || 0,
          headers,
          body: body.substring(0, 10000),
          time: Date.now() - start,
        })
      })
    })

    req.on("error", reject)
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out")) })

    if (options.body) req.write(options.body)
    req.end()
  })
}

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "Action: get, post, put, patch, delete, options, head (HTTP method to use)",
  }),
  url: Schema.String.annotate({
    description: "The full URL to test (e.g., https://api.example.com/users)",
  }),
  headers: Schema.optional(Schema.Record(Schema.String, Schema.String)).annotate({
    description: "HTTP headers as key-value pairs",
  }),
  body: Schema.optional(Schema.String).annotate({
    description: "Request body (for POST/PUT/PATCH). JSON string or plain text.",
  }),
  timeout: Schema.optional(Schema.Number).annotate({
    description: "Request timeout in milliseconds (default: 30000)",
  }),
})

export const ApiTesterTool = Tool.define<typeof Parameters>(
  "api_tester",
  Effect.gen(function* () {
    return {
      description: "API TESTING TOOL — Test any HTTP/HTTPS API endpoint. Send GET, POST, PUT, PATCH, DELETE requests with custom headers and body. See response status, headers, body, and timing. Perfect for debugging APIs, testing webhooks, checking endpoints.",
      parameters: Parameters,
      execute: (params: Schema.Schema.Type<typeof Parameters>, ctx: Tool.Context) =>
        Effect.gen(function* () {
          yield* ctx.ask({
            permission: "memory",
            patterns: ["*"],
            always: ["*"],
            metadata: {},
          })

          const result = yield* Effect.promise(async () => {
            try {
              const method = params.action.toUpperCase()
              const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]
              if (!validMethods.includes(method)) {
                return `Invalid method: "${params.action}". Use: get, post, put, patch, delete, options, head`
              }

              const response = await makeRequest(params.url, {
                method,
                headers: params.headers || {},
                body: params.body,
                timeout: params.timeout,
              })

              const headerStr = Object.entries(response.headers)
                .map(([k, v]) => `  ${k}: ${v}`)
                .join("\n")

              const isJson = response.headers["content-type"]?.includes("json")
              let formattedBody = response.body
              if (isJson) {
                try {
                  formattedBody = JSON.stringify(JSON.parse(response.body), null, 2)
                } catch {}
              }

              return `API RESPONSE — ${method} ${params.url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${response.status}
Time: ${response.time}ms
Size: ${(response.body.length / 1024).toFixed(1)}KB

Response Headers:
${headerStr}

Response Body:
${formattedBody.substring(0, 5000)}${formattedBody.length > 5000 ? "\n... (truncated)" : ""}`
            } catch (e: any) {
              return `API ERROR: ${e.message}\nURL: ${params.url}\nMethod: ${params.action.toUpperCase()}`
            }
          })

          return { title: "API Tester", metadata: {}, output: result }
        }),
    }
  }),
)
