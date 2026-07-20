// ZYRAXON MCP Server 3: Data Processing
// 20 real working tools for data manipulation

import fs from "fs/promises"
import path from "path"

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

// Tool 1: JSON to CSV
export async function jsonToCsv(jsonString: string): Promise<ToolResult> {
  try {
    const data = JSON.parse(jsonString)
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, output: "", error: "Input must be a non-empty JSON array" }
    }
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
    for (const row of data) {
      const values = headers.map(h => {
        const val = row[h]
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      })
      csvRows.push(values.join(','))
    }
    
    return { success: true, output: csvRows.join('\n') }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 2: CSV to JSON
export async function csvToJson(csvString: string): Promise<ToolResult> {
  try {
    const lines = csvString.trim().split('\n')
    if (lines.length < 2) {
      return { success: false, output: "", error: "CSV must have at least a header and one data row" }
    }
    
    const headers = lines[0].split(',').map(h => h.trim())
    const result = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx] || ''
      })
      result.push(row)
    }
    
    return { success: true, output: JSON.stringify(result, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 3: XML to JSON (simple)
export async function xmlToJson(xmlString: string): Promise<ToolResult> {
  try {
    // Simple XML parser
    const result: any = {}
    const tags = xmlString.match(/<(\w+)[^>]*>([^<]*)<\/\1>/g)
    
    if (tags) {
      for (const tag of tags) {
        const match = tag.match(/<(\w+)[^>]*>([^<]*)<\/\1>/)
        if (match) {
          result[match[1]] = match[2]
        }
      }
    }
    
    return { success: true, output: JSON.stringify(result, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 4: Text Statistics
export async function textStats(text: string): Promise<ToolResult> {
  try {
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const chars = text.length
    const lines = text.split('\n').length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    const wordFreq: Record<string, number> = {}
    for (const word of words) {
      const lower = word.toLowerCase()
      wordFreq[lower] = (wordFreq[lower] || 0) + 1
    }
    
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    
    return {
      success: true,
      output: JSON.stringify({
        characters: chars,
        words: words.length,
        lines,
        sentences,
        topWords,
      }, null, 2)
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 5: Text Diff
export async function textDiff(text1: string, text2: string): Promise<ToolResult> {
  try {
    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const diff: string[] = []
    
    const maxLen = Math.max(lines1.length, lines2.length)
    for (let i = 0; i < maxLen; i++) {
      if (lines1[i] !== lines2[i]) {
        diff.push(`Line ${i + 1}:`)
        if (lines1[i]) diff.push(`  - ${lines1[i]}`)
        if (lines2[i]) diff.push(`  + ${lines2[i]}`)
      }
    }
    
    return {
      success: true,
      output: diff.length > 0 ? diff.join('\n') : "No differences found"
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 6: Sort Lines
export async function sortLines(text: string, order: string = 'asc'): Promise<ToolResult> {
  try {
    const lines = text.split('\n')
    if (order === 'desc') {
      lines.sort().reverse()
    } else {
      lines.sort()
    }
    return { success: true, output: lines.join('\n') }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 7: Remove Duplicates
export async function removeDuplicates(text: string): Promise<ToolResult> {
  try {
    const lines = text.split('\n')
    const unique = [...new Set(lines)]
    return { success: true, output: unique.join('\n') }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 8: Find and Replace
export async function findReplace(text: string, find: string, replace: string): Promise<ToolResult> {
  try {
    const result = text.split(find).join(replace)
    return { success: true, output: result }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 9: Extract Emails
export async function extractEmails(text: string): Promise<ToolResult> {
  try {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = text.match(emailRegex) || []
    return { success: true, output: JSON.stringify([...new Set(emails)], null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 10: Extract URLs
export async function extractUrls(text: string): Promise<ToolResult> {
  try {
    const urlRegex = /https?:\/\/[^\s]+/g
    const urls = text.match(urlRegex) || []
    return { success: true, output: JSON.stringify([...new Set(urls)], null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 11: Extract Numbers
export async function extractNumbers(text: string): Promise<ToolResult> {
  try {
    const numbers = text.match(/-?\d+\.?\d*/g) || []
    return { success: true, output: JSON.stringify(numbers.map(Number), null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 12: Word Frequency
export async function wordFrequency(text: string): Promise<ToolResult> {
  try {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const freq: Record<string, number> = {}
    
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1
    }
    
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
    
    return { success: true, output: JSON.stringify(sorted, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 13: Generate Password
export async function generatePassword(length: string = '16'): Promise<ToolResult> {
  try {
    const len = parseInt(length) || 16
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    for (let i = 0; i < len; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return { success: true, output: password }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 14: Regex Match
export async function regexMatch(text: string, pattern: string): Promise<ToolResult> {
  try {
    const regex = new RegExp(pattern, 'g')
    const matches = text.match(regex) || []
    return { success: true, output: JSON.stringify(matches, null, 2) }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 15: Text Summary
export async function textSummary(text: string, sentences: string = '3'): Promise<ToolResult> {
  try {
    const numSentences = parseInt(sentences) || 3
    const textSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const summary = textSentences.slice(0, numSentences).join('. ') + '.'
    return { success: true, output: summary }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 16: Convert Case
export async function convertCase(text: string, caseType: string = 'lower'): Promise<ToolResult> {
  try {
    let result = text
    switch (caseType.toLowerCase()) {
      case 'upper':
        result = text.toUpperCase()
        break
      case 'lower':
        result = text.toLowerCase()
        break
      case 'title':
        result = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        break
      case 'sentence':
        result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
        break
      case 'reverse':
        result = text.split('').reverse().join('')
        break
    }
    return { success: true, output: result }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 17: Trim Text
export async function trimText(text: string): Promise<ToolResult> {
  try {
    const trimmed = text.trim().replace(/\s+/g, ' ')
    return { success: true, output: trimmed }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 18: Pad Text
export async function padText(text: string, length: string = '50', char: string = ' '): Promise<ToolResult> {
  try {
    const len = parseInt(length) || 50
    const padded = text.padStart(len, char).padEnd(len, char)
    return { success: true, output: padded }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 19: Truncate Text
export async function truncateText(text: string, maxLength: string = '100'): Promise<ToolResult> {
  try {
    const max = parseInt(maxLength) || 100
    const truncated = text.length > max ? text.substring(0, max) + '...' : text
    return { success: true, output: truncated }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 20: Word Count
export async function wordCount(text: string): Promise<ToolResult> {
  try {
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const chars = text.length
    const lines = text.split('\n').length
    
    return {
      success: true,
      output: JSON.stringify({
        words: words.length,
        characters: chars,
        lines,
        averageWordLength: words.length > 0 ? (words.reduce((sum, w) => sum + w.length, 0) / words.length).toFixed(2) : 0,
      }, null, 2)
    }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Export all tools
export const dataTools = {
  jsonToCsv,
  csvToJson,
  xmlToJson,
  textStats,
  textDiff,
  sortLines,
  removeDuplicates,
  findReplace,
  extractEmails,
  extractUrls,
  extractNumbers,
  wordFrequency,
  generatePassword,
  regexMatch,
  textSummary,
  convertCase,
  trimText,
  padText,
  truncateText,
  wordCount,
}
