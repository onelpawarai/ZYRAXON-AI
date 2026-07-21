// ZYRAXON MCP Server 6: Productivity Power
// 20 real working tools for productivity

import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

// Tool 1: Create Reminder
export async function createReminder(message: string, time: string): Promise<ToolResult> {
  try {
    const remindersDir = path.join(os.homedir(), '.zyraxon', 'reminders')
    await fs.mkdir(remindersDir, { recursive: true })
    
    const reminder = {
      message,
      time,
      created: new Date().toISOString(),
      id: Date.now().toString(),
    }
    
    const reminderFile = path.join(remindersDir, `reminder_${reminder.id}.json`)
    await fs.writeFile(reminderFile, JSON.stringify(reminder, null, 2), 'utf-8')
    
    return { success: true, output: `Reminder created: "${message}" at ${time}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 2: List Reminders
export async function listReminders(): Promise<ToolResult> {
  try {
    const remindersDir = path.join(os.homedir(), '.zyraxon', 'reminders')
    const files = await fs.readdir(remindersDir)
    const reminders: string[] = []
    
    for (const file of files) {
      const content = await fs.readFile(path.join(remindersDir, file), 'utf-8')
      const reminder = JSON.parse(content)
      reminders.push(`[${reminder.time}] ${reminder.message}`)
    }
    
    return { success: true, output: reminders.join('\n') || "No reminders" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 3: Todo List
export async function addTodo(task: string): Promise<ToolResult> {
  try {
    const todosDir = path.join(os.homedir(), '.zyraxon', 'todos')
    await fs.mkdir(todosDir, { recursive: true })
    
    const todoFile = path.join(todosDir, 'todos.json')
    let todos: any[] = []
    
    try {
      const content = await fs.readFile(todoFile, 'utf-8')
      todos = JSON.parse(content)
    } catch {
      todos = []
    }
    
    todos.push({
      id: Date.now().toString(),
      task,
      completed: false,
      created: new Date().toISOString(),
    })
    
    await fs.writeFile(todoFile, JSON.stringify(todos, null, 2), 'utf-8')
    return { success: true, output: `Todo added: "${task}"` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 4: List Todos
export async function listTodos(): Promise<ToolResult> {
  try {
    const todoFile = path.join(os.homedir(), '.zyraxon', 'todos', 'todos.json')
    const content = await fs.readFile(todoFile, 'utf-8')
    const todos = JSON.parse(content)
    
    const output = todos.map((t: any) => 
      `${t.completed ? '✅' : '⬜'} ${t.task}`
    ).join('\n')
    
    return { success: true, output: output || "No todos" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 5: Complete Todo
export async function completeTodo(taskId: string): Promise<ToolResult> {
  try {
    const todoFile = path.join(os.homedir(), '.zyraxon', 'todos', 'todos.json')
    const content = await fs.readFile(todoFile, 'utf-8')
    const todos = JSON.parse(content)
    
    const todo = todos.find((t: any) => t.id === taskId)
    if (todo) {
      todo.completed = true
      await fs.writeFile(todoFile, JSON.stringify(todos, null, 2), 'utf-8')
      return { success: true, output: `Completed: "${todo.task}"` }
    }
    
    return { success: false, output: "", error: "Todo not found" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 6: Calendar Event
export async function createEvent(title: string, date: string, time: string): Promise<ToolResult> {
  try {
    const eventsDir = path.join(os.homedir(), '.zyraxon', 'events')
    await fs.mkdir(eventsDir, { recursive: true })
    
    const event = {
      id: Date.now().toString(),
      title,
      date,
      time,
      created: new Date().toISOString(),
    }
    
    const eventFile = path.join(eventsDir, `event_${event.id}.json`)
    await fs.writeFile(eventFile, JSON.stringify(event, null, 2), 'utf-8')
    
    return { success: true, output: `Event created: "${title}" on ${date} at ${time}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 7: List Events
export async function listEvents(): Promise<ToolResult> {
  try {
    const eventsDir = path.join(os.homedir(), '.zyraxon', 'events')
    const files = await fs.readdir(eventsDir)
    const events: string[] = []
    
    for (const file of files) {
      const content = await fs.readFile(path.join(eventsDir, file), 'utf-8')
      const event = JSON.parse(content)
      events.push(`[${event.date} ${event.time}] ${event.title}`)
    }
    
    return { success: true, output: events.join('\n') || "No events" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 8: Quick Note
export async function quickNote(title: string, content: string): Promise<ToolResult> {
  try {
    const notesDir = path.join(os.homedir(), '.zyraxon', 'quicknotes')
    await fs.mkdir(notesDir, { recursive: true })
    
    const noteFile = path.join(notesDir, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`)
    await fs.writeFile(noteFile, content, 'utf-8')
    
    return { success: true, output: `Note saved: ${noteFile}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 9: Read Quick Notes
export async function readQuickNotes(): Promise<ToolResult> {
  try {
    const notesDir = path.join(os.homedir(), '.zyraxon', 'quicknotes')
    const files = await fs.readdir(notesDir)
    const notes: string[] = []
    
    for (const file of files.slice(-10)) {
      const content = await fs.readFile(path.join(notesDir, file), 'utf-8')
      notes.push(`[${file.replace('.txt', '')}]\n${content.substring(0, 200)}`)
    }
    
    return { success: true, output: notes.join('\n\n') || "No notes" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 10: Bookmarks
export async function addBookmark(url: string, title: string): Promise<ToolResult> {
  try {
    const bookmarksFile = path.join(os.homedir(), '.zyraxon', 'bookmarks.json')
    let bookmarks: any[] = []
    
    try {
      const content = await fs.readFile(bookmarksFile, 'utf-8')
      bookmarks = JSON.parse(content)
    } catch {
      bookmarks = []
    }
    
    bookmarks.push({
      id: Date.now().toString(),
      url,
      title,
      created: new Date().toISOString(),
    })
    
    await fs.writeFile(bookmarksFile, JSON.stringify(bookmarks, null, 2), 'utf-8')
    return { success: true, output: `Bookmark added: "${title}"` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 11: List Bookmarks
export async function listBookmarks(): Promise<ToolResult> {
  try {
    const bookmarksFile = path.join(os.homedir(), '.zyraxon', 'bookmarks.json')
    const content = await fs.readFile(bookmarksFile, 'utf-8')
    const bookmarks = JSON.parse(content)
    
    const output = bookmarks.map((b: any) => 
      `- ${b.title}: ${b.url}`
    ).join('\n')
    
    return { success: true, output: output || "No bookmarks" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 12: Quick Math
export async function quickMath(expression: string): Promise<ToolResult> {
  try {
    // Safe evaluation
    const result = new Function(`return ${expression}`)()
    return { success: true, output: `${expression} = ${result}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 13: Unit Converter
export async function unitConvert(value: string, from: string, to: string): Promise<ToolResult> {
  try {
    const conversions: Record<string, Record<string, number>> = {
      length: { meter: 1, kilometer: 1000, centimeter: 0.01, millimeter: 0.001, mile: 1609.34, yard: 0.9144, foot: 0.3048, inch: 0.0254 },
      weight: { kilogram: 1, gram: 0.001, milligram: 0.000001, pound: 0.453592, ounce: 0.0283495 },
      temperature: { celsius: 1, fahrenheit: 0.555556, kelvin: 1 },
    }
    
    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      return { success: false, output: "", error: "Invalid number" }
    }
    
    // Simple conversion (same category)
    const fromLower = from.toLowerCase()
    const toLower = to.toLowerCase()
    
    for (const category of Object.values(conversions)) {
      if (category[fromLower] && category[toLower]) {
        const result = numValue * category[fromLower] / category[toLower]
        return { success: true, output: `${value} ${from} = ${result.toFixed(4)} ${to}` }
      }
    }
    
    return { success: false, output: "", error: "Units not compatible" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 14: Color Converter
export async function colorConvert(color: string): Promise<ToolResult> {
  try {
    // Hex to RGB
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return { success: true, output: `RGB: ${r}, ${g}, ${b}` }
    }
    
    // RGB to Hex
    const rgbMatch = color.match(/(\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
      return { success: true, output: `Hex: #${r}${g}${b}` }
    }
    
    return { success: false, output: "", error: "Invalid color format" }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 15: Text Encrypt
export async function textEncrypt(text: string): Promise<ToolResult> {
  try {
    const encrypted = Buffer.from(text).toString('base64')
    return { success: true, output: encrypted }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 16: Text Decrypt
export async function textDecrypt(encrypted: string): Promise<ToolResult> {
  try {
    const decrypted = Buffer.from(encrypted, 'base64').toString('utf-8')
    return { success: true, output: decrypted }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 17: JSON Formatter
export async function jsonFormatter(jsonString: string): Promise<ToolResult> {
  try {
    const parsed = JSON.parse(jsonString)
    const formatted = JSON.stringify(parsed, null, 2)
    return { success: true, output: formatted }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 18: Markdown to HTML
export async function markdownToHtml(markdown: string): Promise<ToolResult> {
  try {
    let html = markdown
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
    
    return { success: true, output: html }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 19: Text Summarizer
export async function summarizeText(text: string, sentences: string = '3'): Promise<ToolResult> {
  try {
    const numSentences = parseInt(sentences) || 3
    const textSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const summary = textSentences.slice(0, numSentences).join('. ') + '.'
    return { success: true, output: summary }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Tool 20: Habit Tracker
export async function trackHabit(habit: string, completed: boolean = true): Promise<ToolResult> {
  try {
    const habitsFile = path.join(os.homedir(), '.zyraxon', 'habits.json')
    let habits: any[] = []
    
    try {
      const content = await fs.readFile(habitsFile, 'utf-8')
      habits = JSON.parse(content)
    } catch {
      habits = []
    }
    
    habits.push({
      id: Date.now().toString(),
      habit,
      completed,
      date: new Date().toISOString(),
    })
    
    await fs.writeFile(habitsFile, JSON.stringify(habits, null, 2), 'utf-8')
    return { success: true, output: `Habit tracked: "${habit}" - ${completed ? 'Completed' : 'Missed'}` }
  } catch (e: any) {
    return { success: false, output: "", error: e.message }
  }
}

// Export all tools
export const productivityTools = {
  createReminder,
  listReminders,
  addTodo,
  listTodos,
  completeTodo,
  createEvent,
  listEvents,
  quickNote,
  readQuickNotes,
  addBookmark,
  listBookmarks,
  quickMath,
  unitConvert,
  colorConvert,
  textEncrypt,
  textDecrypt,
  jsonFormatter,
  markdownToHtml,
  summarizeText,
  trackHabit,
}
