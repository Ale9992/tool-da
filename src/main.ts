import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename } from 'path'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'

let mainWindow: BrowserWindow
let pythonProcess: any

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    if (pythonProcess) {
      pythonProcess.kill()
    }
  })
}

function startPythonBackend() {
  const pythonPath = process.platform === 'win32' ? 'python' : 'python3'
  
  pythonProcess = spawn(pythonPath, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: join(__dirname, '../backend'),
    stdio: 'pipe'
  })

  pythonProcess.stdout.on('data', (data: Buffer) => {
    console.log(`Python: ${data}`)
  })

  pythonProcess.stderr.on('data', (data: Buffer) => {
    console.error(`Python Error: ${data}`)
  })
}

app.whenReady().then(() => {
  createWindow()
  startPythonBackend()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return []
  }

  const files = await Promise.all(
    result.filePaths.map(async filePath => {
      const data = await fs.readFile(filePath)

      return {
        path: filePath,
        name: basename(filePath),
        type: 'application/pdf',
        data: data.toString('base64')
      }
    })
  )

  return files
})

ipcMain.handle('select-output-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  return result.filePaths[0]
})
