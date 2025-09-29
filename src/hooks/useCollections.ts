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

  return { collections, loading, addCollection, addRequest, renameNode, deleteNode, updateRequest };
}
