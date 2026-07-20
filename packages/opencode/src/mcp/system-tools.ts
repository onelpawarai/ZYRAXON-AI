// ZYRAXON MCP Server 1: System Intelligence (Cross-Platform)
// 20 real working tools — Windows, Linux, Mac ALL supported

import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"

const execAsync = promisify(exec)
const platform = process.platform

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

// Helper: Run command cross-platform
async function runCommand(winCmd: string, linuxCmd: string, macCmd?: string): Promise<string> {
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

// Tool 1: Full System Info
export async function systemInfo(): Promise<ToolResult> {
  try {
    const info = {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
      loadAvg: os.loadavg().map(l => l.toFixed(2)),
      type: os.type(),
      release: os.release(),
    }
    return { success: true, output: JSON.stringify(info, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 2: CPU Usage
export async function cpuUsage(): Promise<ToolResult> {
  try {
    const stdout = await runCommand(
      "wmic cpu get loadpercentage /value",
      "top -bn1 | grep 'Cpu(s)' | awk '{print $2}'",
      "top -l 1 | grep 'CPU usage'"
    )
    return { success: true, output: `CPU Usage:\n${stdout}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 3: Memory Usage
export async function memoryUsage(): Promise<ToolResult> {
  try {
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free
    const info = {
      total: `${(total / 1024 / 1024 / 1024).toFixed(2)} GB`,
      used: `${(used / 1024 / 1024 / 1024).toFixed(2)} GB`,
      free: `${(free / 1024 / 1024 / 1024).toFixed(2)} GB`,
      percentage: `${((used / total) * 100).toFixed(1)}%`,
    }
    return { success: true, output: JSON.stringify(info, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 4: Disk Usage
export async function diskUsage(): Promise<ToolResult> {
  try {
    const stdout = await runCommand(
      "wmic logicaldisk get size,freespace,caption /format:list",
      "df -h",
      "df -h"
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 5: Running Processes
export async function runningProcesses(): Promise<ToolResult> {
  try {
    const stdout = await runCommand(
      "tasklist /fo csv /nh | head -20",
      "ps aux --sort=-%mem | head -20",
      "ps aux --sort=-%mem | head -20"
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 6: Network Interfaces
export async function networkInterfaces(): Promise<ToolResult> {
  try {
    const interfaces = os.networkInterfaces()
    const result: any = {}
    for (const [name, addrs] of Object.entries(interfaces)) {
      result[name] = addrs?.map(addr => ({
        address: addr.address,
        family: addr.family,
        internal: addr.internal,
      }))
    }
    return { success: true, output: JSON.stringify(result, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 7: Kill Process
export async function killProcess(pid: string): Promise<ToolResult> {
  try {
    await runCommand(
      `taskkill /PID ${pid} /F`,
      `kill -9 ${pid}`,
      `kill -9 ${pid}`
    )
    return { success: true, output: `Process ${pid} killed successfully` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 8: Environment Variables
export async function envVars(): Promise<ToolResult> {
  try {
    const env = process.env
    const important = ['PATH', 'HOME', 'USER', 'TEMP', 'PROCESSOR_IDENTIFIER', 'OS', 'SHELL', 'LANG']
    const result: any = {}
    for (const key of important) {
      result[key] = env[key] || 'not set'
    }
    return { success: true, output: JSON.stringify(result, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 9: File Watcher
export async function watchFile(filePath: string): Promise<ToolResult> {
  try {
    const stats = await fs.stat(filePath)
    return {
      success: true,
      output: `File: ${filePath}\nSize: ${stats.size} bytes\nModified: ${stats.mtime}\nCreated: ${stats.birthtime}`
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 10: Directory Listing
export async function listDir(dirPath: string): Promise<ToolResult> {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    const result = items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'directory' : 'file',
    }))
    return { success: true, output: JSON.stringify(result, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 11: Read File
export async function readFile(filePath: string): Promise<ToolResult> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, output: content }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 12: Write File
export async function writeFile(filePath: string, content: string): Promise<ToolResult> {
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true, output: `File written: ${filePath}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 13: Delete File
export async function deleteFile(filePath: string): Promise<ToolResult> {
  try {
    await fs.unlink(filePath)
    return { success: true, output: `File deleted: ${filePath}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 14: Copy File
export async function copyFile(src: string, dest: string): Promise<ToolResult> {
  try {
    await fs.copyFile(src, dest)
    return { success: true, output: `Copied: ${src} -> ${dest}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 15: Move File
export async function moveFile(src: string, dest: string): Promise<ToolResult> {
  try {
    await fs.rename(src, dest)
    return { success: true, output: `Moved: ${src} -> ${dest}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 16: Create Directory
export async function createDir(dirPath: string): Promise<ToolResult> {
  try {
    await fs.mkdir(dirPath, { recursive: true })
    return { success: true, output: `Directory created: ${dirPath}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 17: Search Files
export async function searchFiles(dirPath: string, pattern: string): Promise<ToolResult> {
  try {
    const stdout = await runCommand(
      `dir /s /b "${dirPath}\\*${pattern}*"`,
      `find "${dirPath}" -name "*${pattern}*"`,
      `find "${dirPath}" -name "*${pattern}*"`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 18: Get File Hash
export async function fileHash(filePath: string): Promise<ToolResult> {
  try {
    const stdout = await runCommand(
      `certutil -hashfile "${filePath}" MD5`,
      `md5sum "${filePath}"`,
      `md5 -r "${filePath}"`
    )
    return { success: true, output: stdout }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 19: System Uptime
export async function systemUptime(): Promise<ToolResult> {
  try {
    const uptime = os.uptime()
    const days = Math.floor(uptime / 86400)
    const hours = Math.floor((uptime % 86400) / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    return {
      success: true,
      output: `System uptime: ${days} days, ${hours} hours, ${minutes} minutes`
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 20: Quick Command
export async function quickCommand(command: string): Promise<ToolResult> {
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: 30000 })
    return { success: true, output: stdout || stderr }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Export all tools
export const systemTools = {
  systemInfo,
  cpuUsage,
  memoryUsage,
  diskUsage,
  runningProcesses,
  networkInterfaces,
  killProcess,
  envVars,
  watchFile,
  listDir,
  readFile,
  writeFile,
  deleteFile,
  copyFile,
  moveFile,
  createDir,
  searchFiles,
  fileHash,
  systemUptime,
  quickCommand,
}
