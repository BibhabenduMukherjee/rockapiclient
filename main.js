const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
//const { placeholder } = require('./config/placeholder');
const fs = require('fs');

// Safety check for Electron
if (!app) {
  console.error('Failed to load Electron app module');
  process.exit(1);
}

// Initialize Server Manager
let serverManager;
let mainWindow;
let userDataPath;
let collectionsFilePath;
let historyFilePath;
let envsFilePath;
let serverConfigsFilePath;

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
  serverConfigsFilePath = path.join(userDataPath, 'server-configs.json');

  mainWindow = new BrowserWindow({
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
  
  // Only open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Initialize server manager first (only if express is available)
  try {
    const ServerManager = require('./main/serverManager');
    serverManager = new ServerManager(serverConfigsFilePath);
  } catch (error) {
    console.warn('ServerManager not available:', error.message);
    // Continue without server manager functionality
  }
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

// File operations for export/import
ipcMain.handle('save-file', async (event, content, filename) => {
  try {
    // Validate inputs
    if (!content || typeof content !== 'string') {
      return { success: false, error: 'Invalid content provided' };
    }

    if (!filename || typeof filename !== 'string') {
      return { success: false, error: 'Invalid filename provided' };
    }

    // Check content size (max 100MB)
    const contentSize = Buffer.byteLength(content, 'utf8');
    if (contentSize > 100 * 1024 * 1024) {
      return { success: false, error: 'Content too large (max 100MB)' };
    }

    const { dialog } = require('electron');
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });
    
    if (!result.canceled && result.filePath) {
      // Ensure directory exists
      const dir = path.dirname(result.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file with proper error handling
      fs.writeFileSync(result.filePath, content, 'utf-8');
      
      // Verify file was written correctly
      const stats = fs.statSync(result.filePath);
      if (stats.size === 0) {
        return { success: false, error: 'File was not written correctly' };
      }

      return { 
        success: true, 
        path: result.filePath,
        size: stats.size
      };
    }
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Failed to save file:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
});

ipcMain.handle('open-file', async () => {
  try {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'showHiddenFiles']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'File does not exist' };
      }

      // Check file size (max 50MB)
      const stats = fs.statSync(filePath);
      if (stats.size > 50 * 1024 * 1024) {
        return { success: false, error: 'File too large (max 50MB)' };
      }

      if (stats.size === 0) {
        return { success: false, error: 'File is empty' };
      }

      // Read file with encoding validation
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Basic JSON validation
      try {
        JSON.parse(content);
      } catch (jsonError) {
        return { success: false, error: 'File is not valid JSON' };
      }

      return content;
    }
    return null;
  } catch (error) {
    console.error('Failed to open file:', error);
    return null;
  }
});
