const { app, BrowserWindow,ipcMain } = require('electron');
const path = require('path');
//const { placeholder } = require('./config/placeholder');
const fs = require('fs');
const ServerManager = require('./main/serverManager');

// Initialize Server Manager
let serverManager;
let userDataPath;
let collectionsFilePath;
let historyFilePath;
let envsFilePath;

if (process.env.NODE_ENV === 'development') {
  try {   
    require('electron-reloader')(module);
  } catch {}  
}



const placeholder = {
  window: {
      title: 'Rock API Client',
      width: 1400,
      height: 1100,
      minWidth : 1200,
      minHeight: 900,
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
  }
}

function createWindow() {
  // Initialize file paths after app is ready
  userDataPath = app.getPath('userData');
  collectionsFilePath = path.join(userDataPath, 'collections.json');
  historyFilePath = path.join(userDataPath, 'history.json');
  envsFilePath = path.join(userDataPath, 'environments.json');

  const mainWindow = new BrowserWindow({
    width: placeholder.window.width || 800,
    height: placeholder.window.height || 600,
    title: placeholder.window.title || 'Rock API Client',
    minWidth : placeholder.window.minWidth,
    minHeight : placeholder.window.minHeight,
    resizable: placeholder.window.resizable || true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  mainWindow.webContents.openDevTools(); // Open DevTools for debugging
}

app.whenReady().then(() => {
  // Initialize server manager first
  serverManager = new ServerManager();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// Listens for the 'save-collections' event from the preload script.
ipcMain.handle('save-collections', (event, collections) => {
  try {
    // Stringify the collections array with pretty-printing (2-space indentation).
    const data = JSON.stringify(collections, null, 2);
    // Write the data to the collections.json file.
    fs.writeFileSync(collectionsFilePath, data);
  } catch (error) {
    console.error('Failed to save collections:', error);
  }
});

// Listens for the 'load-collections' event from the preload script.
ipcMain.handle('load-collections', () => {
  try {
    // Check if the collections file exists.
    if (fs.existsSync(collectionsFilePath)) {
      const data = fs.readFileSync(collectionsFilePath, 'utf-8');
      // Parse the JSON data and return it to the frontend.
      return JSON.parse(data);
    }
    return []; // If the file doesn't exist, return an empty array.
  } catch (error) {
    console.error('Failed to load collections:', error);
    return []; // If there's an error reading/parsing, return an empty array.
  }
});

// History persistence handlers
ipcMain.handle('save-history', (event, historyItems) => {
  try {
    const data = JSON.stringify(historyItems, null, 2);
    fs.writeFileSync(historyFilePath, data);
  } catch (error) {
    console.error('Failed to save history:', error);
  }
});

ipcMain.handle('load-history', () => {
  try {
    if (fs.existsSync(historyFilePath)) {
      const data = fs.readFileSync(historyFilePath, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
});

// Environments persistence handlers
ipcMain.handle('save-environments', (event, envState) => {
  try {
    const data = JSON.stringify(envState, null, 2);
    fs.writeFileSync(envsFilePath, data);
  } catch (error) {
    console.error('Failed to save environments:', error);
  }
});

ipcMain.handle('load-environments', () => {
  try {
    if (fs.existsSync(envsFilePath)) {
      const data = fs.readFileSync(envsFilePath, 'utf-8');
      return JSON.parse(data);
    }
    return { activeKey: undefined, items: [] };
  } catch (error) {
    console.error('Failed to load environments:', error);
    return { activeKey: undefined, items: [] };
  }
});
