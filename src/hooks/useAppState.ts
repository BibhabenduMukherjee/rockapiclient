import { useState, useRef, useCallback } from 'react';
import { ApiRequest, HistoryItem } from '../types';

export interface AppState {
  // Sidebar navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Request management
  requests: ApiRequest[];
  setRequests: React.Dispatch<React.SetStateAction<ApiRequest[]>>;
  activeRequestKey: string;
  setActiveRequestKey: (key: string) => void;
  activeContentTab: string;
  setActiveContentTab: (tab: string) => void;
  
  // Response state
  responseText: string;
  setResponseText: (text: string) => void;
  responseMeta: { status: number | null; durationMs: number; headers: Record<string, string>; size: number };
  setResponseMeta: (meta: { status: number | null; durationMs: number; headers: Record<string, string>; size: number }) => void;
  
  // History
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  filteredHistory: HistoryItem[];
  setFilteredHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  
  // Request state
  isSending: boolean;
  setIsSending: (sending: boolean) => void;
  hasNewResponse: boolean;
  setHasNewResponse: (hasNew: boolean) => void;
  abortControllerRef: React.MutableRefObject<AbortController | null>;
  
  // Response time data
  responseTimeData: Array<{ timestamp: number; duration: number; status: number; url: string }>;
  setResponseTimeData: React.Dispatch<React.SetStateAction<Array<{ timestamp: number; duration: number; status: number; url: string }>>>;
}

export function useAppState(): AppState {
  // Sidebar navigation
  const [activeTab, setActiveTab] = useState('collections');
  
  // Request management (Postman-like tabs)
  const [requests, setRequests] = useState<ApiRequest[]>([
    {
      key: 'new-request-1',
      title: 'New Request',
      name: 'New Request',
      method: 'GET',
      url: '',
      params: {},
      headers: {},
      body: '',
      protocol: 'http'
    }
  ]);
  const [activeRequestKey, setActiveRequestKey] = useState('new-request-1');
  const [activeContentTab, setActiveContentTab] = useState('params');
  
  // Response state
  const [responseText, setResponseText] = useState<string>('');
  const [responseMeta, setResponseMeta] = useState<{ status: number | null; durationMs: number; headers: Record<string, string>; size: number }>({ 
    status: null, 
    durationMs: 0, 
    headers: {}, 
    size: 0 
  });
  
  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  
  // Request state
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasNewResponse, setHasNewResponse] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Response time data
  const [responseTimeData, setResponseTimeData] = useState<Array<{ timestamp: number; duration: number; status: number; url: string }>>([]);

  return {
    activeTab,
    setActiveTab,
    requests,
    setRequests,
    activeRequestKey,
    setActiveRequestKey,
    activeContentTab,
    setActiveContentTab,
    responseText,
    setResponseText,
    responseMeta,
    setResponseMeta,
    history,
    setHistory,
    filteredHistory,
    setFilteredHistory,
    isSending,
    setIsSending,
    hasNewResponse,
    setHasNewResponse,
    abortControllerRef,
    responseTimeData,
    setResponseTimeData
  };
}

export function useRequestManagement(requests: ApiRequest[], setRequests: React.Dispatch<React.SetStateAction<ApiRequest[]>>, activeRequestKey: string, setActiveRequestKey: (key: string) => void) {
  const handleNewRequest = useCallback(() => {
    const newRequest: ApiRequest = {
      key: `new-request-${Date.now()}`,
      title: 'New Request',
      name: 'New Request',
      method: 'GET',
      url: '',
      params: {},
      headers: {},
      body: ''
    };
    setRequests(prev => [...prev, newRequest]);
    setActiveRequestKey(newRequest.key);
  }, [setRequests, setActiveRequestKey]);

  const handleCloseTab = useCallback((key: string) => {
    if (requests.length <= 1) return; // Don't close the last tab
    
    setRequests(prev => prev.filter(req => req.key !== key));
    
    // If we're closing the active tab, switch to another tab
    if (activeRequestKey === key) {
      const remainingRequests = requests.filter(req => req.key !== key);
      setActiveRequestKey(remainingRequests[0].key);
    }
  }, [requests, activeRequestKey, setRequests, setActiveRequestKey]);

  const handleRequestChange = useCallback((updatedRequest: ApiRequest) => {
    setRequests(prev => prev.map(req => 
      req.key === updatedRequest.key ? updatedRequest : req
    ));
  }, [setRequests]);

  const handleRequestSelect = useCallback((request: ApiRequest) => {
    // Check if request already exists in tabs by key first
    const existingRequestByKey = requests.find(req => req.key === request.key);
    if (existingRequestByKey) {
      setActiveRequestKey(existingRequestByKey.key);
      return;
    }

    // If not found by key, check by method + url combination
    const existingRequestByMethodUrl = requests.find(req => 
      req.method === request.method && req.url === request.url
    );
    
    if (existingRequestByMethodUrl) {
      setActiveRequestKey(existingRequestByMethodUrl.key);
      return;
    }

    // Create new tab for the request
    const newRequest: ApiRequest = {
      ...request,
      key: `request-${Date.now()}`,
      title: request.title || `${request.method} ${request.url}`,
      name: request.name || request.title || `${request.method} ${request.url}`
    };
    
    setRequests(prev => [...prev, newRequest]);
    setActiveRequestKey(newRequest.key);
  }, [requests, setActiveRequestKey, setRequests]);

  const handleDuplicateRequest = useCallback((request: ApiRequest) => {
    const duplicatedRequest: ApiRequest = {
      ...request,
      key: `duplicate-${Date.now()}`,
      title: `${request.title} (Copy)`,
      name: `${request.name || request.title} (Copy)`
    };
    
    setRequests(prev => [...prev, duplicatedRequest]);
    setActiveRequestKey(duplicatedRequest.key);
  }, [setRequests, setActiveRequestKey]);

  return {
    handleNewRequest,
    handleCloseTab,
    handleRequestChange,
    handleRequestSelect,
    handleDuplicateRequest
  };
}
