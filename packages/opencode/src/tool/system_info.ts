import { Effect, Schema } from "effect"
import * as Tool from "./tool"
import { execSync } from "child_process"
import os from "os"
import fs from "fs/promises"

function getSystemInfo() {
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const uptime = os.uptime()

  const days = Math.floor(uptime / 86400)
  const hours = Math.floor((uptime % 86400) / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)

  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    osType: os.type(),
    osRelease: os.release(),
    cpuModel: cpus[0]?.model || "Unknown",
    cpuCores: cpus.length,
    cpuSpeed: cpus[0]?.speed || 0,
    totalMemory: (totalMem / 1073741824).toFixed(2),
    freeMemory: (freeMem / 1073741824).toFixed(2),
    usedMemory: (usedMem / 1073741824).toFixed(2),
    memoryPercent: ((usedMem / totalMem) * 100).toFixed(1),
    uptime: `${days}d ${hours}h ${minutes}m`,
    nodeVersion: process.version,
    currentDir: process.cwd(),
    homeDir: os.homedir(),
    tempDir: os.tmpdir(),
    userInfo: os.userInfo().username,
  }
}

async function getDiskInfo(): Promise<string> {
  try {
    if (process.platform === "win32") {
      const result = execSync('powershell -Command "Get-PSDrive -PSProvider FileSystem | Select-Object Name,@{N=\'Used(GB)\';E={[math]::Round($_.Used/1GB,2)}},@{N=\'Free(GB)\';E={[math]::Round($_.Free/1GB,2)}},@{N=\'Total(GB)\';E={[math]::Round(($_.Used+$_.Free)/1GB,2)}} | ConvertTo-Json"', { encoding: "utf-8", timeout: 10000 })
      const drives = JSON.parse(result)
      const driveList = Array.isArray(drives) ? drives : [drives]
      return driveList.map((d: any) => `  ${d.Name}: ${d['Used(GB)']}GB used / ${d['Free(GB)']}GB free / ${d['Total(GB)']}GB total`).join("\n")
    }
    return "  Disk info available on Windows only"
  } catch {
    return "  Could not retrieve disk info"
  }
}

async function getProcessInfo(): Promise<string> {
  try {
    if (process.platform === "win32") {
      const result = execSync('powershell -Command "Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name,@{N=\'CPU(s)\';E={$_.CPU}},@{N=\'Mem(MB)\';E={[math]::Round($_.WorkingSet64/1MB,1)}} | ConvertTo-Json"', { encoding: "utf-8", timeout: 10000 })
      const processes = JSON.parse(result)
      const procList = Array.isArray(processes) ? processes : [processes]
      return procList.map((p: any) => `  ${p.Name}: CPU ${p['CPU(s)']}s | Mem ${p['Mem(MB)']}MB`).join("\n")
    }
    return "  Process info available on Windows only"
  } catch {
    return "  Could not retrieve process info"
  }
}

const Parameters = Schema.Struct({
  action: Schema.String.annotate({
    description: "Action: full (complete system info), cpu (CPU only), memory (RAM only), disk (disk usage), processes (top processes), network (network info)",
  }),
})

export const SystemInfoTool = Tool.define<typeof Parameters>(
  "system_info",
  Effect.gen(function* () {
    return {
      description: "REAL-TIME SYSTEM INFO — Get live system information: CPU, RAM, disk, processes, network. Monitor system health, check resource usage, debug performance issues.",
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
            const info = getSystemInfo()
            const diskInfo = await getDiskInfo()
            const processInfo = await getProcessInfo()

            switch (params.action) {
              case "full":
                return `SYSTEM INFO — Real-time Snapshot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Platform: ${info.platform} (${info.arch})
OS: ${info.osType} ${info.osRelease}
Hostname: ${info.hostname}
User: ${info.userInfo}
Node: ${info.nodeVersion}
Uptime: ${info.uptime}

CPU:
  Model: ${info.cpuModel}
  Cores: ${info.cpuCores}
  Speed: ${info.cpuSpeed} MHz

Memory:
  Total: ${info.totalMemory} GB
  Used: ${info.usedMemory} GB (${info.memoryPercent}%)
  Free: ${info.freeMemory} GB

Disk:
${diskInfo}

Top Processes:
${processInfo}

Paths:
  CWD: ${info.currentDir}
  Home: ${info.homeDir}
  Temp: ${info.tempDir}`

              case "cpu":
                return `CPU INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: ${info.cpuModel}
Cores: ${info.cpuCores}
Speed: ${info.cpuSpeed} MHz`

              case "memory":
                return `MEMORY INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: ${info.totalMemory} GB
Used: ${info.usedMemory} GB (${info.memoryPercent}%)
Free: ${info.freeMemory} GB`

              case "disk":
                return `DISK INFO\n${diskInfo}`

              case "processes":
                return `TOP PROCESSES\n${processInfo}`

              case "network":
                try {
                  const interfaces = os.networkInterfaces()
                  const netInfo = Object.entries(interfaces)
                    .map(([name, addrs]) => {
                      const ipv4 = addrs?.find(a => a.family === "IPv4")
                      return `  ${name}: ${ipv4 ? ipv4.address : "N/A"}`
                    })
                    .join("\n")
                  return `NETWORK INTERFACES\n${netInfo}`
                } catch {
                  return "Network info unavailable"
                }

              default:
                return `Unknown action: "${params.action}". Use full, cpu, memory, disk, processes, or network.`
            }
          })

          return { title: "System Info", metadata: {}, output: result }
        }),
    }
  }),
)
