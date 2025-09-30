import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { Collection, ApiRequest, TreeNode } from '../types';

// This custom hook encapsulates all logic for managing collections.
export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On initial mount, load collections from the backend.
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        // @ts-ignore
        if (window.electronAPI) {
          // @ts-ignore
          const loadedCollections = await window.electronAPI.loadCollections();
          setCollections(loadedCollections || []);
        } else {
          // If not in Electron, just finish loading with an empty array.
          console.warn('Electron API not found. Running in browser mode.');
          setCollections([]);
        }
      } catch (error) {
        const errorMessage = 'Failed to load collections.';
        setError(errorMessage);
        message.error(errorMessage);
        console.error('Collections loading error:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // When the `collections` state changes, save it back to the file.
  useEffect(() => {
    // We don't want to save during the initial loading phase.
    // @ts-ignore
    if (!loading && window.electronAPI) {
      // @ts-ignore
      window.electronAPI.saveCollections(collections);
    }
  }, [collections, loading]);

  const addCollection = useCallback((name: string) => {
    if (!name.trim()) {
      message.error('Collection name cannot be empty.');
      return;
    }
    
    const newCollection: Collection = { 
      key: `coll-${Date.now()}`, 
      title: name.trim(), 
      requests: [] 
    };
    setCollections(current => [...current, newCollection]);
    message.success(`Collection "${name.trim()}" created.`);
  }, []);

  const addRequest = useCallback((collectionKey: string, request: Omit<ApiRequest, 'key'>) => {
    if (!request.title?.trim()) {
      message.error('Request title cannot be empty.');
      return;
    }
    
    const newRequest: ApiRequest = { 
      ...request, 
      key: `req-${Date.now()}`,
      title: request.title.trim()
    };
    setCollections(current =>
      current.map(c =>
        c.key === collectionKey ? { ...c, requests: [...c.requests, newRequest] } : c
      )
    );
    message.success(`Request "${request.title.trim()}" added.`);
  }, []);

  const renameNode = (node: TreeNode, newName: string) => {
    setCollections(current =>
      current.map(collection => {
        if (collection.key === node.key && node.type === 'collection') {
          return { ...collection, title: newName };
        }
        if (collection.key === node.collectionKey) {
          return {
            ...collection,
            requests: collection.requests.map(req =>
              req.key === node.key && node.type === 'request'
                ? { ...req, title: newName, name: newName }
                : req
            ),
          };
        }
        return collection;
      })
    );
  };

  const deleteNode = (node: TreeNode) => {
    
    if (node.type === 'collection') {
      setCollections(current => {
        const filtered = current.filter(c => c.key !== node.key);
        return filtered;
      });
    } else if (node.type === 'request') {
      setCollections(current => {
        const updated = current.map(c =>
          c.key === node.collectionKey
            ? { ...c, requests: c.requests.filter(r => r.key !== node.key) }
            : c
        );
        return updated;
      });
    }
  };

  const updateRequest = (
    collectionKey: string,
    requestKey: string,
    updates: Partial<ApiRequest>
  ) => {
    setCollections(current =>
      current.map(c =>
        c.key === collectionKey
          ? {
              ...c,
              requests: c.requests.map(r => (r.key === requestKey ? { ...r, ...updates } : r)),
            }
          : c
      )
    );
  };

  // Export collections to JSON file
  const exportCollections = useCallback(async () => {
    try {
      // Validate collections before export
      if (!collections || collections.length === 0) {
        message.warning('No collections to export');
        return;
      }

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        appName: 'Rock API Client',
        collections: collections.map(collection => ({
          ...collection,
          // Ensure all request data is included
          requests: collection.requests.map(request => ({
            ...request,
            // Include all request properties with proper defaults
            params: request.params || {},
            headers: request.headers || {},
            body: request.body || '',
            bodyType: request.bodyType || 'none',
            rawBodyType: request.rawBodyType || 'json',
            formData: request.formData || [],
            urlEncoded: request.urlEncoded || [],
            auth: request.auth || { 
              type: 'none', 
              basic: { username: '', password: '' }, 
              bearer: { token: '' }, 
              jwt: { token: '' } 
            }
          }))
        }))
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Check file size (warn if > 10MB)
      const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);
      if (sizeInMB > 10) {
        message.warning(`Large export file (${sizeInMB.toFixed(1)}MB). This may take a moment.`);
      }

      // @ts-ignore
      if (window.electronAPI && window.electronAPI.saveFile) {
        // @ts-ignore
        const result = await window.electronAPI.saveFile(jsonString, 'rock-api-collections.json');
        if (result.success) {
          message.success(`Collections exported successfully to ${result.path}`);
        } else if (result.canceled) {
          message.info('Export cancelled');
        } else {
          message.error(`Export failed: ${result.error || 'Unknown error'}`);
        }
      } else {
        // Fallback for browser mode
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rock-api-collections.json';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success('Collections exported successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Failed to export collections: ${errorMessage}`);
    }
  }, [collections]);

  // Helper function to validate and process import data
  const processImportData = useCallback((importData: any) => {
    if (!importData || typeof importData !== 'object') {
      throw new Error('Invalid file format: Not a valid JSON object');
    }

    if (!importData.collections || !Array.isArray(importData.collections)) {
      throw new Error('Invalid file format: Missing or invalid collections array');
    }

    if (importData.collections.length === 0) {
      throw new Error('No collections found in the file');
    }

    // Check for duplicate keys and generate new ones if needed
    const existingKeys = new Set(collections.map(c => c.key));
    const processedCollections = importData.collections.map((collection: any, index: number) => {
      let collectionKey = collection.key;
      if (!collectionKey || existingKeys.has(collectionKey)) {
        collectionKey = `imported-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
      }
      existingKeys.add(collectionKey);

      return {
        key: collectionKey,
        title: collection.title || `Imported Collection ${index + 1}`,
        requests: (collection.requests || []).map((request: any, reqIndex: number) => ({
          key: request.key || `imported-${Date.now()}-${index}-${reqIndex}-${Math.random().toString(36).substr(2, 9)}`,
          title: request.title || `Imported Request ${reqIndex + 1}`,
          name: request.name || request.title,
          method: request.method || 'GET',
          url: request.url || '',
          protocol: request.protocol || 'http',
          params: request.params || {},
          headers: request.headers || {},
          body: request.body || '',
          bodyType: request.bodyType || 'none',
          rawBodyType: request.rawBodyType || 'json',
          formData: request.formData || [],
          urlEncoded: request.urlEncoded || [],
          auth: request.auth || { 
            type: 'none', 
            basic: { username: '', password: '' }, 
            bearer: { token: '' }, 
            jwt: { token: '' } 
          },
          collectionKey: collectionKey
        }))
      };
    });

    return processedCollections;
  }, [collections]);

  // Import collections from JSON file
  const importCollections = useCallback(async () => {
    try {
      // @ts-ignore
      if (window.electronAPI && window.electronAPI.openFile) {
        // @ts-ignore
        const fileContent = await window.electronAPI.openFile();
        if (!fileContent) {
          message.info('No file selected');
          return;
        }

        // Validate file size (max 50MB)
        if (fileContent.length > 50 * 1024 * 1024) {
          message.error('File too large. Maximum size is 50MB.');
          return;
        }

        const importData = JSON.parse(fileContent);
        const processedCollections = processImportData(importData);
        
        setCollections(prev => [...prev, ...processedCollections]);
        message.success(`Successfully imported ${processedCollections.length} collections`);
      } else {
        // Fallback for browser mode
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        const handleFileSelect = (e: Event) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          // Validate file size
          if (file.size > 50 * 1024 * 1024) {
            message.error('File too large. Maximum size is 50MB.');
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const importData = JSON.parse(e.target?.result as string);
              const processedCollections = processImportData(importData);
              
              setCollections(prev => [...prev, ...processedCollections]);
              message.success(`Successfully imported ${processedCollections.length} collections`);
            } catch (error) {
              console.error('Import error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              message.error(`Import failed: ${errorMessage}`);
            }
          };
          
          reader.onerror = () => {
            message.error('Failed to read file');
          };
          
          reader.readAsText(file);
        };

        input.addEventListener('change', handleFileSelect);
        document.body.appendChild(input);
        input.click();
        
        // Cleanup after a delay
        setTimeout(() => {
          document.body.removeChild(input);
        }, 1000);
      }
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Failed to import collections: ${errorMessage}`);
    }
  }, [processImportData]);

  return { 
    collections, 
    loading, 
    addCollection, 
    addRequest, 
    renameNode, 
    deleteNode, 
    updateRequest,
    exportCollections,
    importCollections
  };
}
