import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("speechBridge", {
  onCommand: (callback: (command: string, lang?: string) => void) => {
    ipcRenderer.on("speech-command", (_event, command, lang) => callback(command, lang))
  },
  sendResult: (text: string, isFinal: boolean) => {
    ipcRenderer.send("speech-result", text, isFinal)
  },
  sendState: (listening: boolean) => {
    ipcRenderer.send("speech-state", listening)
  },
  sendError: (error: string) => {
    ipcRenderer.send("speech-error", error)
  },
})
