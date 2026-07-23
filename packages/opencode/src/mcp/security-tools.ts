// ZYRAXON MCP Server 4: Security Intelligence
// 20 real working tools for security scanning — Cross-Platform

import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import https from "https"
import http from "http"
import { URL } from "url"
import os from "os"
import crypto from "crypto"
import net from "net"

const execAsync = promisify(exec)
const platform = process.platform

// Cross-platform command helper
async function runCmd(winCmd: string, linuxCmd: string, macCmd?: string): Promise<string> {
  try {
    let cmd = winCmd
    if (platform === "linux") cmd = linuxCmd
    else if (platform === "darwin") cmd = macCmd || linuxCmd
    const { stdout } = await execAsync(cmd, { timeout: 30000 })
    return stdout
  } catch (e: any) {
    return e.stdout || e.stderr || e.message
  }
}

// TCP port checker (works on ALL platforms, no external tool needed)
function checkPort(host: string, port: number, timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(timeout)
    socket.on("connect", () => { socket.destroy(); resolve(true) })
    socket.on("timeout", () => { socket.destroy(); resolve(false) })
    socket.on("error", () => { socket.destroy(); resolve(false) })
    socket.connect(port, host)
  })
}

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

// Tool 1: Port Scan (TCP connect — cross-platform, no netstat needed)
export async function portScan(host: string, ports: string = '80,443,8080,22,21'): Promise<ToolResult> {
  try {
    const portList = ports.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
    const results: string[] = []
    
    const checks = await Promise.all(
      portList.map(async (port) => {
        const open = await checkPort(host, port)
        return `Port ${port}: ${open ? 'OPEN' : 'CLOSED'}`
      })
    )
    results.push(...checks)
    
    return { success: true, output: results.join('\n') }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 2: SSL Certificate Check (cross-platform via Node TLS)
export async function sslCheck(domain: string): Promise<ToolResult> {
  return new Promise((resolve) => {
    try {
      const socket = require('tls').connect({ host: domain, port: 443, servername: domain, rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate()
        if (!cert || !cert.subject) {
          socket.destroy()
          resolve({ success: false, output: "", error: "No certificate returned" })
          return
        }
        const output = [
          `Subject: ${cert.subject.CN || 'N/A'}`,
          `Issuer: ${cert.issuer.O || cert.issuer.CN || 'N/A'}`,
          `Valid From: ${cert.valid_from}`,
          `Valid To: ${cert.valid_to}`,
          `Serial: ${cert.serialNumber}`,
          `Fingerprint: ${cert.fingerprint}`,
        ].join('\n')
        socket.destroy()
        resolve({ success: true, output })
      })
      socket.setTimeout(10000)
      socket.on('timeout', () => { socket.destroy(); resolve({ success: false, output: "", error: "Connection timed out" }) })
      socket.on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
    } catch (e: any) {
      resolve({ success: false, output: "", error: e.message })
    }
  })
}

// Tool 3: HTTP Headers Check (cross-platform via Node HTTP)
export async function httpHeaders(url: string): Promise<ToolResult> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(url)
      const client = parsedUrl.protocol === 'https:' ? https : http
      const req = client.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
        const headers = Object.entries(res.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n')
        resolve({ success: true, output: `Status: ${res.statusCode} ${res.statusMessage}\n\n${headers}` })
      })
      req.on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
      req.on('timeout', () => { req.destroy(); resolve({ success: false, output: "", error: "Timeout" }) })
      req.end()
    } catch (e: any) {
      resolve({ success: false, output: "", error: e.message })
    }
  })
}

// Tool 4: WHOIS Lookup
export async function whoisLookup(domain: string): Promise<ToolResult> {
  try {
    const { stdout } = await execAsync(`whois ${domain}`)
    return { success: true, output: stdout.substring(0, 3000) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 5: Subdomain Scan (cross-platform)
export async function subdomainScan(domain: string): Promise<ToolResult> {
  try {
    const subdomains = ['www', 'mail', 'ftp', 'admin', 'api', 'dev', 'test', 'staging', 'blog', 'shop', 'cdn', 'media', 'static', 'assets', 'img', 'portal', 'vpn', 'remote', 'gateway', 'proxy']
    const results: string[] = []
    
    const checks = await Promise.all(
      subdomains.map(async (sub) => {
        try {
          const cmd = platform === 'win32' ? `nslookup ${sub}.${domain}` : `dig +short ${sub}.${domain}`
          const { stdout } = await execAsync(cmd, { timeout: 5000 })
          const hasRecord = stdout && !stdout.includes('NXDOMAIN') && !stdout.includes('can\'t find') && !stdout.includes('server can\'t find')
          return `${sub}.${domain}: ${hasRecord ? 'EXISTS' : 'NOT FOUND'}`
        } catch {
          return `${sub}.${domain}: NOT FOUND`
        }
      })
    )
    results.push(...checks)
    
    return { success: true, output: results.join('\n') }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 6: Directory Brute Force (cross-platform via Node HTTP)
export async function dirBruteForce(url: string): Promise<ToolResult> {
  try {
    const dirs = ['admin', 'login', 'wp-admin', 'backup', 'config', 'db', 'sql', 'phpmyadmin', '.git', '.env', '.env.local', '.env.production', 'api', 'api/v1', 'docs', 'swagger', 'metrics', 'health', 'status', 'debug']
    const results: string[] = []
    
    const checks = await Promise.all(
      dirs.map(async (dir) => {
        return new Promise<string>((resolve) => {
          try {
            const fullUrl = `${url.replace(/\/$/, '')}/${dir}`
            const parsedUrl = new URL(fullUrl)
            const client = parsedUrl.protocol === 'https:' ? https : http
            const req = client.request(fullUrl, { method: 'HEAD', timeout: 5000 }, (res) => {
              if (res.statusCode !== 404) {
                resolve(`${fullUrl}: ${res.statusCode}`)
              } else {
                resolve('')
              }
            })
            req.on('error', () => resolve(''))
            req.on('timeout', () => { req.destroy(); resolve('') })
            req.end()
          } catch { resolve('') }
        })
      })
    )
    results.push(...checks.filter(r => r.length > 0))
    
    return { success: true, output: results.length > 0 ? results.join('\n') : "No directories found" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 7: Technology Detection
export async function techDetect(url: string): Promise<ToolResult> {
  try {
    const { stdout } = await execAsync(`curl -s "${url}" | head -50`)
    const technologies: string[] = []
    
    if (stdout.includes('WordPress')) technologies.push('WordPress')
    if (stdout.includes('Drupal')) technologies.push('Drupal')
    if (stdout.includes('Joomla')) technologies.push('Joomla')
    if (stdout.includes('Laravel')) technologies.push('Laravel')
    if (stdout.includes('Django')) technologies.push('Django')
    if (stdout.includes('React')) technologies.push('React')
    if (stdout.includes('Vue.js')) technologies.push('Vue.js')
    if (stdout.includes('Angular')) technologies.push('Angular')
    if (stdout.includes('jQuery')) technologies.push('jQuery')
    if (stdout.includes('Bootstrap')) technologies.push('Bootstrap')
    if (stdout.includes('nginx')) technologies.push('Nginx')
    if (stdout.includes('Apache')) technologies.push('Apache')
    
    return {
      success: true,
      output: technologies.length > 0 ? `Technologies: ${technologies.join(', ')}` : "No technologies detected"
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 8: Email Validation
export async function validateEmail(email: string): Promise<ToolResult> {
  try {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const isValid = emailRegex.test(email)
    return {
      success: true,
      output: `Email: ${email}\nValid: ${isValid ? 'YES' : 'NO'}`
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 9: Password Strength
export async function passwordStrength(password: string): Promise<ToolResult> {
  try {
    let score = 0
    const feedback: string[] = []
    
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    
    const strength = score <= 2 ? 'WEAK' : score <= 4 ? 'MEDIUM' : 'STRONG'
    
    return {
      success: true,
      output: `Password length: ${password.length}\nStrength: ${strength} (${score}/6)`
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 10: IP Geolocation (cross-platform via Node HTTP)
export async function ipGeo(ip: string): Promise<ToolResult> {
  return new Promise((resolve) => {
    try {
      const url = `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting`
      http.get(url, { timeout: 10000 }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          try {
            const geo = JSON.parse(data)
            if (geo.status === 'success') {
              const output = [
                `IP: ${ip}`,
                `Country: ${geo.country} (${geo.countryCode})`,
                `Region: ${geo.regionName}`,
                `City: ${geo.city}`,
                `Zip: ${geo.zip}`,
                `Coords: ${geo.lat}, ${geo.lon}`,
                `Timezone: ${geo.timezone}`,
                `ISP: ${geo.isp}`,
                `Org: ${geo.org}`,
                `AS: ${geo.as}`,
                `Mobile: ${geo.mobile}`,
                `Proxy: ${geo.proxy}`,
                `Hosting: ${geo.hosting}`,
              ].join('\n')
              resolve({ success: true, output })
            } else {
              resolve({ success: false, output: "", error: geo.message || "Lookup failed" })
            }
          } catch {
            resolve({ success: true, output: data })
          }
        })
      }).on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
    } catch (e: any) {
      resolve({ success: false, output: "", error: e.message })
    }
  })
}

// Tool 11: DNS Enumeration (cross-platform)
export async function dnsEnum(domain: string): Promise<ToolResult> {
  try {
    const stdout = await runCmd(
      `nslookup -type=ALL ${domain}`,
      `dig ANY ${domain} +noall +answer 2>/dev/null || nslookup -type=ALL ${domain}`,
      `dig ANY ${domain} +noall +answer`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 12: Traceroute (cross-platform)
export async function traceroute(host: string): Promise<ToolResult> {
  try {
    const stdout = await runCmd(`tracert ${host}`, `traceroute -m 15 ${host}`, `traceroute ${host}`)
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 13: MAC Address Lookup (cross-platform via Node HTTP)
export async function macLookup(mac: string): Promise<ToolResult> {
  return new Promise((resolve) => {
    try {
      const url = `https://api.macvendors.com/${encodeURIComponent(mac)}`
      https.get(url, { timeout: 10000 }, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          resolve({ success: true, output: `MAC: ${mac}\nVendor: ${data}` })
        })
      }).on('error', (e: any) => resolve({ success: false, output: "", error: e.message }))
    } catch (e: any) {
      resolve({ success: false, output: "", error: e.message })
    }
  })
}

// Tool 14: URL Safety Check (cross-platform)
export async function urlSafety(url: string): Promise<ToolResult> {
  try {
    // Check URL structure and known suspicious patterns
    const parsed = new URL(url)
    const warnings: string[] = []
    
    if (parsed.hostname.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      warnings.push("IP address used instead of domain name")
    }
    if (parsed.protocol === 'http:') {
      warnings.push("Using HTTP (not HTTPS) — insecure")
    }
    if (parsed.hostname.includes('@') || parsed.href.includes('@')) {
      warnings.push("URL contains @ symbol — possible authentication bypass")
    }
    if (parsed.hostname.includes('..') || parsed.pathname.includes('..')) {
      warnings.push("Path traversal detected (..)")
    }
    if (parsed.port && !['80', '443', '8080', '8443'].includes(parsed.port)) {
      warnings.push(`Unusual port: ${parsed.port}`)
    }
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.buzz']
    if (suspiciousTlds.some(tld => parsed.hostname.endsWith(tld))) {
      warnings.push("Suspicious TLD detected")
    }
    
    const output = warnings.length > 0
      ? `URL: ${url}\nWarnings:\n${warnings.map(w => `  - ${w}`).join('\n')}`
      : `URL: ${url}\nNo obvious suspicious patterns detected`
    
    return { success: true, output }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 15: File Permissions Check (cross-platform)
export async function filePerms(filePath: string): Promise<ToolResult> {
  try {
    const stdout = await runCmd(
      `icacls "${filePath}"`,
      `ls -la "${filePath}"`,
      `ls -la "${filePath}"`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 16: Network Connections (cross-platform)
export async function networkConnections(): Promise<ToolResult> {
  try {
    const stdout = await runCmd(
      `netstat -an | findstr ESTABLISHED`,
      `ss -tunap | grep ESTABLISHED`,
      `netstat -an | grep ESTABLISHED`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 17: Firewall Status (cross-platform)
export async function firewallStatus(): Promise<ToolResult> {
  try {
    const stdout = await runCmd(
      `netsh advfirewall show allprofiles state`,
      `sudo iptables -L -n --line-numbers 2>/dev/null || sudo ufw status verbose 2>/dev/null || echo "Firewall tool not available"`,
      `sudo pfctl -sr 2>/dev/null || echo "Firewall status check not available"`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 18: Service Status (cross-platform)
export async function serviceStatus(serviceName: string): Promise<ToolResult> {
  try {
    const stdout = await runCmd(
      `sc query "${serviceName}"`,
      `systemctl status ${serviceName} 2>/dev/null || service ${serviceName} status 2>/dev/null`,
      `launchctl list | grep ${serviceName} 2>/dev/null || echo "Service: ${serviceName}"`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 19: User Accounts (cross-platform)
export async function userAccounts(): Promise<ToolResult> {
  try {
    const stdout = await runCmd(
      `net user`,
      `cat /etc/passwd | grep -v nologin | grep -v false`,
      `dscl . list /Users | grep -v '^_'`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 20: Scheduled Tasks (cross-platform)
export async function scheduledTasks(): Promise<ToolResult> {
  try {
    const stdout = await runCmd(
      `schtasks /query /fo LIST 2>nul`,
      `crontab -l 2>/dev/null && echo "---SYSTEM CRONS---" && ls /etc/cron* 2>/dev/null`,
      `launchctl list 2>/dev/null | head -30`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Export all tools
export const securityTools = {
  portScan,
  sslCheck,
  httpHeaders,
  whoisLookup,
  subdomainScan,
  dirBruteForce,
  techDetect,
  validateEmail,
  passwordStrength,
  ipGeo,
  dnsEnum,
  traceroute,
  macLookup,
  urlSafety,
  filePerms,
  networkConnections,
  firewallStatus,
  serviceStatus,
  userAccounts,
  scheduledTasks,
}
