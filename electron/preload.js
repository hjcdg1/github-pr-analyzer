const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getTheme: () => ipcRenderer.invoke('get-theme'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getAnalysisData: () => ipcRenderer.invoke('get-analysis-data'),
  saveAnalysisData: (analysisData) => ipcRenderer.invoke('save-analysis-data', analysisData)
});