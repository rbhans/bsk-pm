import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import pkg from 'electron-updater'
const { autoUpdater } = pkg
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'hiddenInset', // Hides title bar but keeps traffic lights on macOS
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../public/icon.png')
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  // Check for updates only in production
  if (!isDev) {
    // Configure autoUpdater
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    // Check for updates on startup
    autoUpdater.checkForUpdates()

    // Check for updates every 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdates()
    }, 4 * 60 * 60 * 1000)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Auto-updater event listeners
autoUpdater.on('update-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info)
  }
})

autoUpdater.on('update-not-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available')
  }
})

autoUpdater.on('error', (error) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-error', error.message)
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj)
  }
})

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info)
  }
})

// IPC handlers for auto-updater
ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true)
})

ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { available: false, message: 'Updates disabled in development mode' }
  }
  try {
    const result = await autoUpdater.checkForUpdates()
    return { available: result?.updateInfo?.version !== app.getVersion() }
  } catch (error) {
    return { available: false, error: error.message }
  }
})

// IPC handlers for native notifications
ipcMain.handle('show-notification', async (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
})
