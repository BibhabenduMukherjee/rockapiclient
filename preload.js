const { contextBridge, ipcRenderer } = require('electron');

// Use contextBridge to securely expose APIs to the renderer process (React).
// This creates a `window.electron` object in your React app.
contextBridge.exposeInMainWorld('electron', {
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
});