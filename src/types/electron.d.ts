declare global {
  interface Window {
    electronAPI: {
      // Collections
      saveCollections: (collections: any[]) => Promise<void>;
      loadCollections: () => Promise<any[]>;
      
      // History
      saveHistory: (history: any[]) => Promise<void>;
      loadHistory: () => Promise<any[]>;
      
      // Environments
      saveEnvironments: (envState: any) => Promise<void>;
      loadEnvironments: () => Promise<any>;
      
      // Mock Server APIs
      createHttpServer: (config: any) => Promise<{ success: boolean; port: number; url: string }>;
      createWebSocketServer: (config: any) => Promise<{ success: boolean; port: number; url: string }>;
      stopServer: (port: number) => Promise<{ success: boolean; port: number }>;
      getServerStatus: (port: number) => Promise<{ running: boolean; type?: string; startTime?: Date; config?: any }>;
      getAllServers: () => Promise<any[]>;
      getServerLogs: (port: number) => Promise<any[]>;
      saveServerConfig: (config: any) => Promise<{ success: boolean }>;
      loadServerConfigs: () => Promise<any>;
      deleteServerConfig: (port: number) => Promise<{ success: boolean; error?: string }>;
      getSavedServerConfigs: () => Promise<any>;
    };
  }
}

export {};
