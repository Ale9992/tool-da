import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectOutputDirectory: () => ipcRenderer.invoke('select-output-directory'),
  platform: process.platform
})

declare global {
  interface Window {
    electronAPI: {
      selectFiles: () => Promise<
        {
          path: string
          name: string
          type: string
          data: string
        }[]
      >
      selectOutputDirectory: () => Promise<string>
      platform: string
    }
  }
}
