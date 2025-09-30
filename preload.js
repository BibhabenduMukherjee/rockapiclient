const { contextBridge, ipcRenderer } = require('electron');

// Use contextBridge to securely expose APIs to the renderer process (React).
// This creates a `window.electronAPI` object in your React app.
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Saves the collections data by invoking the 'save-collections' handler in main.js.
   * @param {object[]} collections - The array of collections to save.
   * @returns {Promise<void>}
   */
  saveCollections: (collections) => ipcRenderer.invoke('save-collections', collections),

  /**
   * Loads the collections data by invoking the 'load-collections' handler in main.js.
   * @returns {Promise<object[]>} - The array of collections.
   */
  loadCollections: () => ipcRenderer.invoke('load-collections'),

  /**
   * Saves request history items array.
   */
  saveHistory: (historyItems) => ipcRenderer.invoke('save-history', historyItems),
  /**
   * Loads saved request history items array.
   */
  loadHistory: () => ipcRenderer.invoke('load-history'),

  // Environments
  saveEnvironments: (envState) => ipcRenderer.invoke('save-environments', envState),
  loadEnvironments: () => ipcRenderer.invoke('load-environments'),

  // Mock Server APIs
  createHttpServer: (config) => ipcRenderer.invoke('create-http-server', config),
  createWebSocketServer: (config) => ipcRenderer.invoke('create-websocket-server', config),
  stopServer: (port) => ipcRenderer.invoke('stop-server', port),
  getServerStatus: (port) => ipcRenderer.invoke('get-server-status', port),
  getAllServers: () => ipcRenderer.invoke('get-all-servers'),
  getServerLogs: (port) => ipcRenderer.invoke('get-server-logs', port),
  saveServerConfig: (config) => ipcRenderer.invoke('save-server-config', config),
  loadServerConfigs: () => ipcRenderer.invoke('load-server-configs'),
  deleteServerConfig: (port) => ipcRenderer.invoke('delete-server-config', port),
  getSavedServerConfigs: () => ipcRenderer.invoke('get-saved-server-configs'),

  // File operations for export/import
  saveFile: (content, filename) => ipcRenderer.invoke('save-file', content, filename),
  openFile: () => ipcRenderer.invoke('open-file'),
});