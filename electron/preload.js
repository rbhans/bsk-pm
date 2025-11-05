const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body })
})
