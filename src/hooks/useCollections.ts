import { useState, useEffect } from 'react';
import { message } from 'antd';
import { Collection, ApiRequest, TreeNode } from '../types';

// This custom hook encapsulates all logic for managing collections.
export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // On initial mount, load collections from the backend.
  useEffect(() => {
    const loadData = async () => {
      // @ts-ignore
      if (window.electron) {
        try {
          // @ts-ignore
          const loadedCollections = await window.electron.loadCollections();
          setCollections(loadedCollections || []);
        } catch (error) {
          message.error('Failed to load collections.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        // If not in Electron, just finish loading with an empty array.
        console.warn('Electron API not found. Running in browser mode.');
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // When the `collections` state changes, save it back to the file.
  useEffect(() => {
    // We don't want to save during the initial loading phase.
    // @ts-ignore
    if (!loading && window.electron) {
      // @ts-ignore
      window.electron.saveCollections(collections);
    }
  }, [collections, loading]);

  const addCollection = (name: string) => {
    const newCollection: Collection = { key: `coll-${Date.now()}`, title: name, requests: [] };
    setCollections(current => [...current, newCollection]);
    message.success(`Collection "${name}" created.`);
  };

  const addRequest = (collectionKey: string, request: Omit<ApiRequest, 'key'>) => {
    const newRequest: ApiRequest = { ...request, key: `req-${Date.now()}` };
    setCollections(current =>
      current.map(c =>
        c.key === collectionKey ? { ...c, requests: [...c.requests, newRequest] } : c
      )
    );
    message.success(`Request "${request.title}" added.`);
  };

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
    console.log('🗑️ deleteNode called with:', node);
    console.log('🗑️ Current collections before deletion:', collections);
    
    if (node.type === 'collection') {
      console.log('🗑️ Deleting collection:', node.key);
      setCollections(current => {
        const filtered = current.filter(c => c.key !== node.key);
        console.log('🗑️ Collections after deletion:', filtered);
        return filtered;
      });
    } else if (node.type === 'request') {
      console.log('🗑️ Deleting request:', node.key, 'from collection:', node.collectionKey);
      setCollections(current => {
        const updated = current.map(c =>
          c.key === node.collectionKey
            ? { ...c, requests: c.requests.filter(r => r.key !== node.key) }
            : c
        );
        console.log('🗑️ Collections after request deletion:', updated);
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
