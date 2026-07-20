// ZYRAXON MCP Server — 124+ Real Working Tools
// The most powerful MCP server ever created
// Cross-platform: Windows, Linux, Mac ALL supported

import { systemTools } from "./system-tools"
import { webTools } from "./web-tools"
import { dataTools } from "./data-tools"
import { securityTools } from "./security-tools"
import { aiTools } from "./ai-tools"
import { productivityTools } from "./productivity-tools"
import { autoMemory } from "../memory/auto-injection"
import { autoScreenVision } from "../screen/auto-vision"

// ============================================
// TOOL REGISTRY — 100+ TOOLS
// ============================================

export const TOOL_REGISTRY = {
  // System Intelligence (20 tools)
  system: {
    systemInfo: systemTools.systemInfo,
    cpuUsage: systemTools.cpuUsage,
    memoryUsage: systemTools.memoryUsage,
    diskUsage: systemTools.diskUsage,
    runningProcesses: systemTools.runningProcesses,
    networkInterfaces: systemTools.networkInterfaces,
    killProcess: systemTools.killProcess,
    envVars: systemTools.envVars,
    watchFile: systemTools.watchFile,
    listDir: systemTools.listDir,
    readFile: systemTools.readFile,
    writeFile: systemTools.writeFile,
    deleteFile: systemTools.deleteFile,
    copyFile: systemTools.copyFile,
    moveFile: systemTools.moveFile,
    createDir: systemTools.createDir,
    searchFiles: systemTools.searchFiles,
    fileHash: systemTools.fileHash,
    systemUptime: systemTools.systemUptime,
    quickCommand: systemTools.quickCommand,
  },

  // Web Intelligence (20 tools)
  web: {
    httpGet: webTools.httpGet,
    httpPost: webTools.httpPost,
    urlStatus: webTools.urlStatus,
    dnsLookup: webTools.dnsLookup,
    ping: webTools.ping,
    portCheck: webTools.portCheck,
    downloadFile: webTools.downloadFile,
    webScrape: webTools.webScrape,
    jsonParse: webTools.jsonParse,
    jsonValidate: webTools.jsonValidate,
    base64Encode: webTools.base64Encode,
    base64Decode: webTools.base64Decode,
    urlEncode: webTools.urlEncode,
    urlDecode: webTools.urlDecode,
    md5Hash: webTools.md5Hash,
    sha256Hash: webTools.sha256Hash,
    timestamp: webTools.timestamp,
    generateUUID: webTools.generateUUID,
    randomString: webTools.randomString,
    webhookTest: webTools.webhookTest,
  },

  // Data Processing (20 tools)
  data: {
    jsonToCsv: dataTools.jsonToCsv,
    csvToJson: dataTools.csvToJson,
    xmlToJson: dataTools.xmlToJson,
    textStats: dataTools.textStats,
    textDiff: dataTools.textDiff,
    sortLines: dataTools.sortLines,
    removeDuplicates: dataTools.removeDuplicates,
    findReplace: dataTools.findReplace,
    extractEmails: dataTools.extractEmails,
    extractUrls: dataTools.extractUrls,
    extractNumbers: dataTools.extractNumbers,
    wordFrequency: dataTools.wordFrequency,
    generatePassword: dataTools.generatePassword,
    regexMatch: dataTools.regexMatch,
    textSummary: dataTools.textSummary,
    convertCase: dataTools.convertCase,
    trimText: dataTools.trimText,
    padText: dataTools.padText,
    truncateText: dataTools.truncateText,
    wordCount: dataTools.wordCount,
  },

  // Security Intelligence (20 tools)
  security: {
    portScan: securityTools.portScan,
    sslCheck: securityTools.sslCheck,
    httpHeaders: securityTools.httpHeaders,
    whoisLookup: securityTools.whoisLookup,
    subdomainScan: securityTools.subdomainScan,
    dirBruteForce: securityTools.dirBruteForce,
    techDetect: securityTools.techDetect,
    validateEmail: securityTools.validateEmail,
    passwordStrength: securityTools.passwordStrength,
    ipGeo: securityTools.ipGeo,
    dnsEnum: securityTools.dnsEnum,
    traceroute: securityTools.traceroute,
    macLookup: securityTools.macLookup,
    urlSafety: securityTools.urlSafety,
    filePerms: securityTools.filePerms,
    networkConnections: securityTools.networkConnections,
    firewallStatus: securityTools.firewallStatus,
    serviceStatus: securityTools.serviceStatus,
    userAccounts: securityTools.userAccounts,
    scheduledTasks: securityTools.scheduledTasks,
  },

  // AI Enhancement (20 tools)
  ai: {
    textToSpeech: aiTools.textToSpeech,
    takeScreenshot: aiTools.takeScreenshot,
    clipboard: aiTools.clipboard,
    openApp: aiTools.openApp,
    closeApp: aiTools.closeApp,
    volumeControl: aiTools.volumeControl,
    takeNote: aiTools.takeNote,
    readNotes: aiTools.readNotes,
    generateReport: aiTools.generateReport,
    calculator: aiTools.calculator,
    setTimer: aiTools.setTimer,
    wakeWordDetection: aiTools.wakeWordDetection,
    imageInfo: aiTools.imageInfo,
    pdfInfo: aiTools.pdfInfo,
    audioInfo: aiTools.audioInfo,
    videoInfo: aiTools.videoInfo,
    imageResize: aiTools.imageResize,
    convertFormat: aiTools.convertFormat,
    backupFiles: aiTools.backupFiles,
    systemCleanup: aiTools.systemCleanup,
  },

  // Productivity Power (20 tools)
  productivity: {
    createReminder: productivityTools.createReminder,
    listReminders: productivityTools.listReminders,
    addTodo: productivityTools.addTodo,
    listTodos: productivityTools.listTodos,
    completeTodo: productivityTools.completeTodo,
    createEvent: productivityTools.createEvent,
    listEvents: productivityTools.listEvents,
    quickNote: productivityTools.quickNote,
    readQuickNotes: productivityTools.readQuickNotes,
    addBookmark: productivityTools.addBookmark,
    listBookmarks: productivityTools.listBookmarks,
    quickMath: productivityTools.quickMath,
    unitConvert: productivityTools.unitConvert,
    colorConvert: productivityTools.colorConvert,
    textEncrypt: productivityTools.textEncrypt,
    textDecrypt: productivityTools.textDecrypt,
    jsonFormatter: productivityTools.jsonFormatter,
    markdownToHtml: productivityTools.markdownToHtml,
    summarizeText: productivityTools.summarizeText,
    trackHabit: productivityTools.trackHabit,
  },

  // Auto Memory System
  memory: {
    autoInject: autoMemory.autoInjectContext,
    autoStore: autoMemory.autoStoreConversation,
    autoLearn: autoMemory.autoLearnPattern,
    smartRecall: autoMemory.smartRecall,
  },

  // Auto Screen Vision (ALWAYS ACTIVE)
  vision: {
    autoCapture: autoScreenVision.autoScreenVision.autoCaptureScreen,
    getLatest: autoScreenVision.autoScreenVision.getLatestCapture,
    history: autoScreenVision.autoScreenVision.getCaptureHistory,
    describe: autoScreenVision.autoScreenVision.describeScreen,
  },
}

// Tool count
export const TOOL_COUNT = {
  system: 20,
  web: 20,
  data: 20,
  security: 20,
  ai: 20,
  productivity: 20,
  memory: 4,
  vision: 4,
  total: 128,
}

// Get tool by category and name
export function getTool(category: string, name: string): Function | null {
  const categoryTools = TOOL_REGISTRY[category as keyof typeof TOOL_REGISTRY]
  if (!categoryTools) return null
  return (categoryTools as any)[name] || null
}

// Get all tools in a category
export function getCategoryTools(category: string): Record<string, Function> | null {
  return (TOOL_REGISTRY as any)[category] || null
}

// List all tool names
export function listAllTools(): string[] {
  const tools: string[] = []
  for (const [category, categoryTools] of Object.entries(TOOL_REGISTRY)) {
    if (typeof categoryTools === 'object' && categoryTools !== null) {
      for (const [name, tool] of Object.entries(categoryTools)) {
        if (typeof tool === 'function') {
          tools.push(`${category}.${name}`)
        }
      }
    }
  }
  return tools
}

// Export everything
export default TOOL_REGISTRY
