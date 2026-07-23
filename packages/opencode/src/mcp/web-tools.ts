// ZYRAXON MCP Server 2: Web Intelligence
// 20 real working tools for web operations

import https from "https"
import http from "http"
import { URL } from "url"
import { exec } from "child_process"
import { promisify } from "util"
import crypto from "crypto"

const execAsync = promisify(exec)
const platform = process.platform

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

// Tool 1: HTTP GET
export async function httpGet(url: string): Promise<ToolResult> {
  try {
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === 'https:' ? https : http
    
    return new Promise((resolve) => {
      const req = client.get(url, { timeout: 10000 }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({
            success: true,
            output: `Status: ${res.statusCode}\nHeaders: ${JSON.stringify(res.headers, null, 2)}\nBody:\n${data.substring(0, 5000)}`
          })
        })
      })
      req.on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
      req.on('timeout', () => {
        req.destroy()
        resolve({ success: false, output: "", error: "Request timed out" })
      })
    })
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 2: HTTP POST
export async function httpPost(url: string, body: string, contentType: string = 'application/json'): Promise<ToolResult> {
  try {
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === 'https:' ? https : http
    
    return new Promise((resolve) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(body),
        },
      }
      
      const req = client.request(url, options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({
            success: true,
            output: `Status: ${res.statusCode}\nBody:\n${data.substring(0, 5000)}`
          })
        })
      })
      req.on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
      req.write(body)
      req.end()
    })
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 3: URL Status Check
export async function urlStatus(url: string): Promise<ToolResult> {
  try {
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === 'https:' ? https : http
    
    return new Promise((resolve) => {
      const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({
          success: true,
          output: `URL: ${url}\nStatus: ${res.statusCode}\nContent-Type: ${res.headers['content-type']}\nContent-Length: ${res.headers['content-length']}`
        })
      })
      req.on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
      req.on('timeout', () => {
        req.destroy()
        resolve({ success: false, output: "", error: "Request timed out" })
      })
      req.end()
    })
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 4: DNS Lookup (cross-platform)
export async function dnsLookup(domain: string): Promise<ToolResult> {
  try {
    const cmd = platform === 'win32' ? `nslookup ${domain}` : `dig ${domain} +noall +answer 2>/dev/null || nslookup ${domain}`
    const { stdout } = await execAsync(cmd, { timeout: 10000 })
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 5: Ping (cross-platform)
export async function ping(host: string): Promise<ToolResult> {
  try {
    const cmd = platform === 'win32' ? `ping -n 4 ${host}` : `ping -c 4 ${host}`
    const { stdout } = await execAsync(cmd, { timeout: 30000 })
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 6: Port Check (TCP connect — cross-platform)
export async function portCheck(host: string, port: string): Promise<ToolResult> {
  try {
    const net = require('net')
    const portNum = parseInt(port)
    if (isNaN(portNum)) return { success: false, output: "", error: "Invalid port number" }
    
    return new Promise((resolve) => {
      const socket = new net.Socket()
      socket.setTimeout(5000)
      socket.on('connect', () => {
        socket.destroy()
        resolve({ success: true, output: `Port ${port} on ${host}: OPEN` })
      })
      socket.on('timeout', () => {
        socket.destroy()
        resolve({ success: true, output: `Port ${port} on ${host}: CLOSED (timeout)` })
      })
      socket.on('error', () => {
        socket.destroy()
        resolve({ success: true, output: `Port ${port} on ${host}: CLOSED` })
      })
      socket.connect(portNum, host)
    })
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 7: Download File (cross-platform)
export async function downloadFile(url: string, dest: string): Promise<ToolResult> {
  try {
    const cmd = platform === 'win32'
      ? `curl -L -o "${dest}" "${url}"`
      : `curl -L -o "${dest}" "${url}" || wget -O "${dest}" "${url}"`
    const { stdout } = await execAsync(cmd, { timeout: 120000 })
    return { success: true, output: `Downloaded: ${url} -> ${dest}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 8: Web Scrape (cross-platform)
export async function webScrape(url: string): Promise<ToolResult> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url)
      const client = parsedUrl.protocol === 'https:' ? https : http
      client.get(url, { timeout: 15000 }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve({ success: true, output: `Redirect to: ${res.headers.location}` })
          return
        }
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          // Extract text content (strip HTML tags)
          const text = data
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          resolve({ success: true, output: `Status: ${res.statusCode}\nContent length: ${data.length}\n\nText preview:\n${text.substring(0, 5000)}` })
        })
      }).on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
    } catch (e: any) {
      resolve({ success: false, output: "", error: e.message })
    }
  })
}

// Tool 9: JSON Parse
export async function jsonParse(jsonString: string): Promise<ToolResult> {
  try {
    const parsed = JSON.parse(jsonString)
    return { success: true, output: JSON.stringify(parsed, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 10: JSON Validate
export async function jsonValidate(jsonString: string): Promise<ToolResult> {
  try {
    JSON.parse(jsonString)
    return { success: true, output: "Valid JSON" }
  } catch (e: any) {
    return { success: false, output: "Invalid JSON", error: e.message }
  }
}

// Tool 11: Base64 Encode
export async function base64Encode(text: string): Promise<ToolResult> {
  try {
    const encoded = Buffer.from(text).toString('base64')
    return { success: true, output: encoded }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 12: Base64 Decode
export async function base64Decode(encoded: string): Promise<ToolResult> {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
    return { success: true, output: decoded }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 13: URL Encode
export async function urlEncode(text: string): Promise<ToolResult> {
  try {
    const encoded = encodeURIComponent(text)
    return { success: true, output: encoded }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 14: URL Decode
export async function urlDecode(encoded: string): Promise<ToolResult> {
  try {
    const decoded = decodeURIComponent(encoded)
    return { success: true, output: decoded }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 15: MD5 Hash (cross-platform — Node crypto, no shell injection)
export async function md5Hash(text: string): Promise<ToolResult> {
  try {
    const hash = crypto.createHash('md5').update(text).digest('hex')
    return { success: true, output: hash }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 16: SHA256 Hash (cross-platform — Node crypto, no shell injection)
export async function sha256Hash(text: string): Promise<ToolResult> {
  try {
    const hash = crypto.createHash('sha256').update(text).digest('hex')
    return { success: true, output: hash }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 17: Timestamp
export async function timestamp(): Promise<ToolResult> {
  try {
    const now = new Date()
    return {
      success: true,
      output: `Unix: ${Math.floor(now.getTime() / 1000)}\nISO: ${now.toISOString()}\nLocal: ${now.toLocaleString()}`
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 18: UUID Generator
export async function generateUUID(): Promise<ToolResult> {
  try {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    return { success: true, output: uuid }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 19: Random String
export async function randomString(length: string = '16'): Promise<ToolResult> {
  try {
    const len = parseInt(length) || 16
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return { success: true, output: result }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 20: Webhook Test
export async function webhookTest(url: string, method: string = 'POST', payload: string = '{}'): Promise<ToolResult> {
  try {
    if (method.toUpperCase() === 'GET') {
      return await httpGet(url)
    } else {
      return await httpPost(url, payload)
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Export all tools
export const webTools = {
  httpGet,
  httpPost,
  urlStatus,
  dnsLookup,
  ping,
  portCheck,
  downloadFile,
  webScrape,
  jsonParse,
  jsonValidate,
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  md5Hash,
  sha256Hash,
  timestamp,
  generateUUID,
  randomString,
  webhookTest,
}
