const { ipcMain } = require('electron');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs').promises;

class ServerManager {
  constructor(configFilePath) {
    this.servers = new Map(); // port -> server instance
    this.configs = new Map(); // port -> server config
    this.logs = new Map(); // port -> logs array
    this.configFilePath = configFilePath; // Use the provided path from main.js
    this.setupIPC();
    // Load configurations asynchronously
    this.loadConfigurations().then(configs => {
      console.log('📁 Loaded server configurations:', Object.keys(configs).length);
      // Auto-start saved servers if they were running before
      this.autoStartServers(configs);
    }).catch(err => {
      console.warn('Failed to load server configurations:', err);
    });
  }

  setupIPC() {
    // Create HTTP Server
    ipcMain.handle('create-http-server', async (event, config) => {
      try {
        return await this.createHttpServer(config);
      } catch (error) {
        console.error('Error creating HTTP server:', error);
        throw error;
      }
    });

    // Create WebSocket Server
    ipcMain.handle('create-websocket-server', async (event, config) => {
      try {
        return await this.createWebSocketServer(config);
      } catch (error) {
        console.error('Error creating WebSocket server:', error);
        throw error;
      }
    });

    // Stop Server
    ipcMain.handle('stop-server', async (event, port) => {
      try {
        return await this.stopServer(port);
      } catch (error) {
        console.error('Error stopping server:', error);
        throw error;
      }
    });

    // Get Server Status
    ipcMain.handle('get-server-status', async (event, port) => {
      return this.getServerStatus(port);
    });

    // Get All Servers
    ipcMain.handle('get-all-servers', async () => {
      return this.getAllServers();
    });

    // Get Server Logs
    ipcMain.handle('get-server-logs', async (event, port) => {
      return this.getServerLogs(port);
    });

    // Save Configuration
    ipcMain.handle('save-server-config', async (event, config) => {
      return await this.saveServerConfig(config);
    });

    // Load Configurations
    ipcMain.handle('load-server-configs', async () => {
      return await this.loadConfigurations();
    });

    // Delete Server Configuration
    ipcMain.handle('delete-server-config', async (event, port) => {
      return await this.deleteServerConfig(port);
    });

    // Get Saved Server Configurations
    ipcMain.handle('get-saved-server-configs', async () => {
      return await this.loadConfigurations();
    });
  }

  async createHttpServer(config) {
    const { name, port, routes = [] } = config;

    // Check if port is already in use
    if (this.servers.has(port)) {
      throw new Error(`Port ${port} is already in use`);
    }

    // Create Express app
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Add request logging middleware
    app.use((req, res, next) => {
      this.addLog(port, {
        type: 'request',
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
        ip: req.ip || req.connection.remoteAddress
      });
      next();
    });

    // Add dynamic routes
    routes.forEach(route => {
      const { method, path: routePath, statusCode = 200, response } = route;
      
      // Validate method
      const validMethods = ['get', 'post', 'put', 'delete', 'patch'];
      if (!validMethods.includes(method.toLowerCase())) {
        console.warn(`Invalid method ${method} for route ${routePath}`);
        return;
      }
      
      app[method.toLowerCase()](routePath, (req, res) => {
        this.addLog(port, {
          type: 'response',
          method: req.method,
          path: req.path,
          statusCode,
          timestamp: new Date().toISOString()
        });

        res.status(statusCode).json(response);
      });
    });

    // Default health check route
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        server: name, 
        port, 
        timestamp: new Date().toISOString() 
      });
    });

    // Start server
    return new Promise((resolve, reject) => {
      const server = app.listen(port, 'localhost', (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.servers.set(port, {
          type: 'http',
          server,
          config,
          startTime: new Date()
        });

        this.configs.set(port, config);
        this.logs.set(port, []);

        this.addLog(port, {
          type: 'server',
          message: `HTTP Server started on port ${port}`,
          timestamp: new Date().toISOString()
        });

        console.log(`🚀 HTTP Server "${name}" started on http://localhost:${port}`);
        resolve({ success: true, port, url: `http://localhost:${port}` });
      });
    });
  }

  async createWebSocketServer(config) {
    const { name, port, messageHandlers = [] } = config;

    // Check if port is already in use
    if (this.servers.has(port)) {
      throw new Error(`Port ${port} is already in use`);
    }

    return new Promise((resolve, reject) => {
      const server = require('http').createServer();
      const wss = new WebSocket.Server({ server });

      wss.on('connection', (ws, req) => {
        const clientId = Date.now().toString();
        this.addLog(port, {
          type: 'connection',
          message: `WebSocket client connected: ${clientId}`,
          timestamp: new Date().toISOString(),
          clientId
        });

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'welcome',
          message: `Connected to ${name}`,
          server: name,
          timestamp: new Date().toISOString()
        }));

        ws.on('message', (data) => {
          const rawMessage = data.toString();
          this.addLog(port, {
            type: 'message',
            message: `Received: ${rawMessage}`,
            timestamp: new Date().toISOString(),
            clientId
          });

          try {
            // Try to parse as JSON first
            const message = JSON.parse(rawMessage);
            
            // Handle different message types
            if (messageHandlers.length > 0) {
              const handler = messageHandlers.find(h => h.type === message.type);
              if (handler) {
                const response = handler.response || { echo: message };
                ws.send(JSON.stringify(response));
              } else {
                // Default echo behavior
                ws.send(JSON.stringify({
                  type: 'echo',
                  original: message,
                  timestamp: new Date().toISOString()
                }));
              }
            } else {
              // Default echo behavior
              ws.send(JSON.stringify({
                type: 'echo',
                original: message,
                timestamp: new Date().toISOString()
              }));
            }
          } catch (error) {
            // If not JSON, treat as plain text
            this.addLog(port, {
              type: 'message',
              message: `Received plain text: ${rawMessage}`,
              timestamp: new Date().toISOString(),
              clientId
            });
            
            // Handle plain text messages
            if (messageHandlers.length > 0) {
              const handler = messageHandlers.find(h => h.type === 'message' || h.type === 'text');
              if (handler) {
                const response = handler.response || { echo: rawMessage };
                ws.send(JSON.stringify(response));
              } else {
                // Default echo behavior for plain text
                ws.send(JSON.stringify({
                  type: 'echo',
                  message: rawMessage,
                  timestamp: new Date().toISOString()
                }));
              }
            } else {
              // Default echo behavior for plain text
              ws.send(JSON.stringify({
                type: 'echo',
                message: rawMessage,
                timestamp: new Date().toISOString()
              }));
            }
          }
        });

        ws.on('close', () => {
          this.addLog(port, {
            type: 'disconnection',
            message: `WebSocket client disconnected: ${clientId}`,
            timestamp: new Date().toISOString(),
            clientId
          });
        });
      });

      server.listen(port, 'localhost', (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.servers.set(port, {
          type: 'websocket',
          server,
          wss,
          config,
          startTime: new Date()
        });

        this.configs.set(port, config);
        this.logs.set(port, []);

        this.addLog(port, {
          type: 'server',
          message: `WebSocket Server started on port ${port}`,
          timestamp: new Date().toISOString()
        });

        console.log(`🔌 WebSocket Server "${name}" started on ws://localhost:${port}`);
        resolve({ success: true, port, url: `ws://localhost:${port}` });
      });
    });
  }

  async stopServer(port) {
    const serverInfo = this.servers.get(port);
    if (!serverInfo) {
      throw new Error(`No server running on port ${port}`);
    }

    return new Promise((resolve, reject) => {
      serverInfo.server.close((err) => {
        if (err) {
          console.error(`Error stopping server on port ${port}:`, err);
          reject(err);
          return;
        }
        
        this.servers.delete(port);
        this.configs.delete(port);
        this.logs.delete(port);
        
        // Clean up persistent storage
        this.deleteServerConfig(port).catch(console.error);
        
        this.addLog(port, {
          type: 'server',
          message: `Server stopped on port ${port}`,
          timestamp: new Date().toISOString()
        });
        console.log(`🛑 Server stopped on port ${port}`);
        resolve({ success: true, port });
      });
    });
  }

  getServerStatus(port) {
    const serverInfo = this.servers.get(port);
    return {
      running: !!serverInfo,
      type: serverInfo?.type,
      startTime: serverInfo?.startTime,
      config: this.configs.get(port)
    };
  }

  getAllServers() {
    const servers = [];
    for (const [port, serverInfo] of this.servers) {
      servers.push({
        port,
        type: serverInfo.type,
        config: this.configs.get(port),
        startTime: serverInfo.startTime,
        running: true
      });
    }
    return servers;
  }

  getServerLogs(port) {
    return this.logs.get(port) || [];
  }

  addLog(port, logEntry) {
    if (!this.logs.has(port)) {
      this.logs.set(port, []);
    }
    const logs = this.logs.get(port);
    logs.push({ id: Date.now().toString(), ...logEntry });
    
    // Keep only last 100 logs per server
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
  }

  async saveServerConfig(config) {
    const configs = JSON.parse(await fs.readFile(this.configFilePath, 'utf8').catch(() => '{}'));
    configs[config.port] = {
      ...config,
      savedAt: new Date().toISOString()
    };
    await fs.writeFile(this.configFilePath, JSON.stringify(configs, null, 2));
    return { success: true };
  }

  async loadConfigurations() {
    try {
      const configs = JSON.parse(await fs.readFile(this.configFilePath, 'utf8'));
      return configs;
    } catch (error) {
      return {};
    }
  }

  async deleteServerConfig(port) {
    try {
      const configs = JSON.parse(await fs.readFile(this.configFilePath, 'utf8').catch(() => '{}'));
      delete configs[port];
      await fs.writeFile(this.configFilePath, JSON.stringify(configs, null, 2));
      console.log(`🗑️ Deleted server configuration for port ${port}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting server config for port ${port}:`, error);
      return { success: false, error: error.message };
    }
  }

  async autoStartServers(configs) {
    // For now, we'll just log the configurations
    // In the future, we could add a flag to auto-start servers
    console.log('📋 Available server configurations:');
    Object.entries(configs).forEach(([port, config]) => {
      console.log(`  - Port ${port}: ${config.name} (${config.type})`);
    });
    
    // TODO: Add auto-start functionality if needed
    // This would require checking if the server was running when saved
    // and automatically restarting it
  }
}

module.exports = ServerManager;
