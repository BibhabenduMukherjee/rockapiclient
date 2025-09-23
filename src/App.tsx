import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Layout, Input, Select, Button, Flex, Tabs, Modal, message, List, Tag, Collapse, Card, Typography, Space } from 'antd';
import { ExperimentOutlined, FolderOutlined, HistoryOutlined, PlusOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useCollections } from './hooks/useCollections';
import { useEnvironments, substituteTemplate } from './hooks/useEnvironments';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import SidebarCollection from './components/Sidebar';
import HeadersTab from './components/HeadersTab';
import AuthorizationTab, { AuthConfig } from './components/AuthorizationTab';
import BodyTab, { BodyType, RawBodyType, FormDataItem } from './components/BodyTab';
import HistorySearch from './components/HistorySearch';
import RequestDuplication from './components/RequestDuplication';
import RequestDiff from './components/RequestDiff';
import CommandPalette from './components/CommandPalette';
import RequestTemplates from './components/RequestTemplates';
import ThemeSettings from './components/ThemeSettings';
import { showRequestSuccess, showRequestError, showCollectionSaved } from './components/EnhancedNotifications';
import { sendRequest, RequestConfig } from './utils/requestSender';
import { generateCode, CodeGenConfig, CodeGenType } from './utils/codeGenerator';
import { ApiRequest, HistoryItem } from './types'
const { Content, Sider, Header } = Layout;
const { Option } = Select;
const { Text, Title } = Typography;
const { Panel } = Collapse;
function App() {
  // State for the currently active request in the main panel
  const [method, setMethod] = useState<ApiRequest['method']>('GET');
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('collections');
  const [activeContentTab, setActiveContentTab] = useState('params');
  const [paramsJson, setParamsJson] = useState<string>('{}');
  
  // Headers state
  const [headers, setHeaders] = useState<Array<{key: string, value: string, enabled: boolean}>>([]);
  
  // Authorization state
  const [auth, setAuth] = useState<AuthConfig>({
    type: 'none',
    apiKey: { key: '', value: '', addTo: 'header' },
    bearer: { token: '' },
    basic: { username: '', password: '' },
    jwt: { token: '' }
  });
  
  // Body state
  const [bodyType, setBodyType] = useState<BodyType>('none');
  const [rawBodyType, setRawBodyType] = useState<RawBodyType>('json');
  const [rawBody, setRawBody] = useState<string>('');
  const [formData, setFormData] = useState<FormDataItem[]>([]);
  const [urlEncoded, setUrlEncoded] = useState<FormDataItem[]>([]);
  const [responseText, setResponseText] = useState<string>('');
  const [responseMeta, setResponseMeta] = useState<{ status: number | null; durationMs: number; headers: Record<string, string>; size: number }>({ status: null, durationMs: 0, headers: {}, size: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Validation helpers
  const paramsError = useMemo(() => {
    try { JSON.parse(paramsJson || '{}'); return null; } catch (e:any) { return 'Invalid JSON'; }
  }, [paramsJson]);
  
  const bodyError = useMemo(() => {
    if (bodyType === 'raw' && rawBodyType === 'json' && rawBody) {
      try {
        JSON.parse(rawBody);
        return null;
      } catch {
        return 'Invalid JSON';
      }
    }
    return null;
  }, [bodyType, rawBodyType, rawBody]);
  
  const hasValidationError = !!paramsError || !!bodyError || !url;
  // The custom hook provides all data and functions for managing collections
  const { collections, loading, addCollection, addRequest, renameNode, deleteNode, updateRequest } = useCollections();
  
  // Environment management
  const { state: envState, loading: envLoading, addEnvironment, removeEnvironment, setActiveEnvironment, updateVariables } = useEnvironments();
  // State for the "Add Collection" modal, which is simple enough to keep in App.tsx
  const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  
  // Environment modal states
  const [isEnvModalVisible, setIsEnvModalVisible] = useState(false);
  const [editingEnv, setEditingEnv] = useState<string | null>(null);
  const [envName, setEnvName] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  
  // Code generation modal
  const [isCodeGenModalVisible, setIsCodeGenModalVisible] = useState(false);
  const [codeGenType, setCodeGenType] = useState<CodeGenType>('curl');
  
  // New feature modals
  const [isCommandPaletteVisible, setIsCommandPaletteVisible] = useState(false);
  const [isTemplatesModalVisible, setIsTemplatesModalVisible] = useState(false);
  const [isThemeSettingsVisible, setIsThemeSettingsVisible] = useState(false);
  
  // Refs for focus management
  const urlInputRef = useRef<any>(null);
  const paramsTextAreaRef = useRef<any>(null);
  
  // Theme and keyboard shortcuts
  const { settings: themeSettings } = useTheme();
  
  // Focus handlers
  const handleFocusUrl = useCallback(() => {
    urlInputRef.current?.focus();
  }, []);
  
  const handleFocusParams = useCallback(() => {
    setActiveContentTab('params');
    setTimeout(() => paramsTextAreaRef.current?.focus(), 100);
  }, []);
  
  const handleFocusHeaders = useCallback(() => {
    setActiveContentTab('headers');
  }, []);
  
  const handleFocusBody = useCallback(() => {
    setActiveContentTab('body');
  }, []);
  
  const handleSwitchToHistory = useCallback(() => {
    setActiveTab('history');
  }, []);
  
  const handleSwitchToCollections = useCallback(() => {
    setActiveTab('collections');
  }, []);
  
  const handleSwitchToEnvironments = useCallback(() => {
    setActiveTab('environments');
  }, []);
  
  // Keyboard shortcuts will be initialized after handleSendRequest is defined
  // Load history on mount
  useEffect(() => {
    // @ts-ignore
    if (window.electron?.loadHistory) {
      // @ts-ignore
      window.electron.loadHistory().then((items: HistoryItem[]) => {
        setHistory(items || []);
        setFilteredHistory(items || []);
      }).catch(() => {});
    }
  }, []);
  // Handle history search
  const handleHistorySearch = (filtered: HistoryItem[]) => {
    setFilteredHistory(filtered);
  };
  // Handle request duplication
  const handleRequestDuplicate = (duplicatedRequest: ApiRequest) => {
    if (selectedRequest?.collectionKey) {
      // Generate a unique name if duplicate exists
      let newName = duplicatedRequest.name;
      let counter = 1;
      while (collections.find(c => c.key === selectedRequest.collectionKey)?.requests.some(r => r.name === newName)) {
        newName = `${duplicatedRequest.name} ${counter}`;
        counter++;
      }
      
      addRequest(selectedRequest.collectionKey, {
        ...duplicatedRequest,
        name: newName
      });
      message.success(`Request "${newName}" created successfully`);
    }
  };
  // Handle template application
  const handleApplyTemplate = (template: any) => {
    setMethod(template.request.method);
    setUrl(template.request.url);
    setParamsJson(JSON.stringify(template.request.params || {}, null, 2));
    
    // Convert headers to new format
    const templateHeaders = template.request.headers || {};
    setHeaders(Object.entries(templateHeaders).map(([key, value]) => ({
      key,
      value: String(value),
      enabled: true
    })));
    
    setRawBody(template.request.body || '');
    message.success(`Applied template: ${template.name}`);
  };
  // Persist history on change
  useEffect(() => {
    // @ts-ignore
    if (window.electron?.saveHistory) {
      // @ts-ignore
      window.electron.saveHistory(history);
    }
  }, [history]);
  const handleAddCollectionOk = () => {
    if (newCollectionName) {
      addCollection(newCollectionName);
      setNewCollectionName('');
      setIsAddCollectionModalVisible(false);
    }
  };
const handleRequestSelect = (request: ApiRequest) => {
    // Cancel any in-flight request when switching
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Clear previous response when switching requests
    setResponseText('');
    setResponseMeta({ status: null, durationMs: 0, headers: {}, size: 0 });
    setSelectedRequest(request);
    setMethod(request.method);
    setUrl(request.url);
    setParamsJson(JSON.stringify(request.params || {}, null, 2));
    // Convert old headers format to new format
    const oldHeaders = request.headers || {};
    setHeaders(Object.entries(oldHeaders).map(([key, value]) => ({
      key,
      value: String(value),
      enabled: true
    })));
    // Set body based on old format
    setRawBody(request.body || '');
  };
  // Persist changes of the current request fields to collections
  useEffect(() => {
    // @ts-ignore - selectedRequest from sidebar includes collectionKey
    const collectionKey = selectedRequest?.collectionKey as string | undefined;
    const requestKey = selectedRequest?.key as string | undefined;
    if (!collectionKey || !requestKey) return;
    // Try to parse JSON for params and headers; if invalid, skip persistence to avoid corrupting data
    let parsedParams: Record<string, string> | undefined = undefined;
    let parsedHeaders: Record<string, string> | undefined = undefined;
    try {
      parsedParams = JSON.parse(paramsJson || '{}') || {};
    } catch {}
    // Headers are now handled by the new modular system
    parsedHeaders = headers.reduce((acc, header) => {
      if (header.enabled && header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);
    // Convert new headers format to old format for persistence
    const oldHeaders = headers.reduce((acc, header) => {
      if (header.enabled && header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    updateRequest(collectionKey, requestKey, {
      method,
      url,
      params: parsedParams,
      headers: oldHeaders,
      body: rawBody,
    });
  }, [method, url, paramsJson, headers, rawBody, selectedRequest]);
  // Get active environment variables for substitution
  const activeEnvVars = useMemo(() => {
    const activeEnv = envState.items.find(env => env.key === envState.activeKey);
    return activeEnv?.variables || {};
  }, [envState]);
  const constructedUrl = useMemo(() => {
    try {
      const base = substituteTemplate(url || '', activeEnvVars);
      const parsedParams = JSON.parse(paramsJson || '{}');
      const substitutedParams = Object.fromEntries(
        Object.entries(parsedParams || {}).map(([k, v]) => [k, substituteTemplate(String(v), activeEnvVars)])
      );
      const u = new URL(base, base.startsWith('http') ? undefined : 'http://placeholder');
      Object.entries(substitutedParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null) u.searchParams.set(String(k), String(v));
      });
      const result = u.toString();
      return base.startsWith('http') ? result : result.replace('http://placeholder', '');
    } catch {
      return url;
    }
  }, [url, paramsJson, activeEnvVars]);
  const handleSendRequest = async () => {
    if (!url) {
      message.error('Please enter a URL');
      return;
    }
    if (hasValidationError) {
      message.error('Fix validation errors before sending');
      return;
    }
    
    // If a request is already in progress, cancel it first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsSending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      const requestConfig: RequestConfig = {
        method,
        url,
        paramsJson,
        headers,
        auth,
        bodyType,
        rawBodyType,
        rawBody,
        formData,
        urlEncoded,
        activeEnvVars
      };
      
      const result = await sendRequest(requestConfig, controller.signal);
      
      setResponseText(result.responseText);
      setResponseMeta(result.responseMeta);
      setHistory((h) => [result.historyItem, ...h].slice(0, 200));
      
      // Show success notification
      showRequestSuccess(result.responseMeta.durationMs, result.responseMeta.status || 0);
    } catch (err: any) {
      console.error('Request failed:', err);
      const errorMessage = err?.message || 'Unknown error';
      
      // Show error notification with retry option
      showRequestError(errorMessage, () => {
        handleSendRequest();
      });
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };
  // Initialize keyboard shortcuts after handleSendRequest is defined
  useKeyboardShortcuts({
    onSendRequest: handleSendRequest,
    onSaveCollection: () => showCollectionSaved(),
    onOpenCommandPalette: () => setIsCommandPaletteVisible(true),
    onFocusUrl: handleFocusUrl,
    onFocusParams: handleFocusParams,
    onFocusHeaders: handleFocusHeaders,
    onFocusBody: handleFocusBody,
    disabled: isSending
  });
  const handleGenerateCode = (): string => {
    const codeGenConfig: CodeGenConfig = {
      method,
      url,
      headers,
      auth,
      bodyType,
      rawBodyType,
      rawBody,
      urlEncoded,
      activeEnvVars
    };
    
    return generateCode(codeGenConfig, codeGenType);
  };
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
  // Environment handlers
  const handleAddEnvironment = () => {
    setEditingEnv(null);
    setEnvName('');
    setEnvVars({});
    setIsEnvModalVisible(true);
  };
  const handleEditEnvironment = (envKey: string) => {
    const env = envState.items.find(e => e.key === envKey);
    if (env) {
      setEditingEnv(envKey);
      setEnvName(env.name);
      setEnvVars(env.variables);
      setIsEnvModalVisible(true);
    }
  };
  const handleSaveEnvironment = () => {
    if (!envName.trim()) return;
    
    if (editingEnv) {
      updateVariables(editingEnv, envVars);
    } else {
      addEnvironment(envName);
    }
    setIsEnvModalVisible(false);
  };
  // Code generation
 
  const sidebarTabItems = [
    {
      key: 'collections',
      label: (
        <span>
          <FolderOutlined />
          Collections
        </span>
      ),
      children: (
        // Your existing Sidebar component goes here
        <SidebarCollection
          collections={collections}
          loading={loading}
          onSelectRequest={handleRequestSelect}
          onAddRequest={addRequest}
          onRenameNode={renameNode}
          onDeleteNode={deleteNode}
        />
      ),
    },
    {
      key: 'environments',
      label: (
        <span>
          <ExperimentOutlined />
          Environments
        </span>
      ),
      children: (
        <div style={{ padding: '8px' }}>
          <div style={{ marginBottom: 12 }}>
            <Button 
              type="primary" 
              size="small" 
              onClick={handleAddEnvironment}
              style={{ width: '100%' }}
            >
              Add Environment
            </Button>
          </div>
          <div style={{ marginBottom: 8 }}>
            <Text style={{ color: 'var(--theme-text)', fontSize: 12 }}>Active Environment:</Text>
            <Select
              value={envState.activeKey}
              onChange={setActiveEnvironment}
              placeholder="No environment"
              size="small"
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value={undefined}>No Environment</Option>
              {envState.items.map(env => (
                <Option key={env.key} value={env.key}>{env.name}</Option>
              ))}
            </Select>
          </div>
          <List
            size="small"
            dataSource={envState.items}
            renderItem={(env) => (
              <List.Item
                actions={[
                  <Button size="small" onClick={() => handleEditEnvironment(env.key)}>Edit</Button>,
                  <Button size="small" danger onClick={() => removeEnvironment(env.key)}>Delete</Button>
                ]}
              >
                <div style={{ color: 'var(--theme-text)' }}>
                  <div style={{ fontWeight: 'bold' }}>{env.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--theme-text-secondary)' }}>
                    {Object.keys(env.variables).length} variables
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          History
        </span>
      ),
      children: (
        <div style={{ padding: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: 'var(--theme-text)', fontSize: 12 }}>Request History</Text>
             {history.length > 0 && (
              <Button 
                size="small" 
                danger 
                onClick={() => setHistory([])}
              >
                Clear All
              </Button>
             )}
          </div>
          {/* History Search Component */}
          <HistorySearch 
            history={history} 
            onSearch={handleHistorySearch} 
          />
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            <List
              size="small"
              dataSource={filteredHistory}
              renderItem={(item) => (
                <List.Item
                  onClick={() => {
                    setMethod(item.method);
                    setUrl(item.url);
                  setParamsJson(JSON.stringify(item.request.params || {}, null, 2));
                  // Convert old headers format to new format
                  const oldHeaders = item.request.headers || {};
                  setHeaders(Object.entries(oldHeaders).map(([key, value]) => ({
                    key,
                    value: String(value),
                    enabled: true
                  })));
                  setRawBody(item.request.body || '');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Flex align="center" gap={8} style={{ width: '100%' }}>
                    <Tag color={item.method === 'GET' ? 'blue' : item.method === 'POST' ? 'orange' : item.method === 'PUT' ? 'gold' : 'red'}>{item.method}</Tag>
                    <span style={{ color: 'var(--theme-text)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</span>
                    <span style={{ color: 'var(--theme-text-secondary)' }}>{item.status ?? 'ERR'}</span>
                    <span style={{ color: 'var(--theme-text-secondary)' }}>{item.durationMs} ms</span>
                  </Flex>
                </List.Item>
              )}
            />
          </div>
        </div>
      ),
    },
  ];
   const renderAddButton = () => {
    if (activeTab === 'collections') {
      return <Button icon={<PlusOutlined />} onClick={() => setIsAddCollectionModalVisible(true)} size="small" title="Add New Collection" type="primary" ghost />;
    }
    return null;
  };
  
  // This function is called when a request is clicked in the sidebar
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', background: '#252526' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Rock API Client</span>
          <Space>
            <Button
              type="text"
              icon={<ThunderboltOutlined />}
              onClick={() => setIsTemplatesModalVisible(true)}
              style={{ color: '#fff' }}
              title="Request Templates (Ctrl+T)"
            >
              Templates
            </Button>
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => setIsThemeSettingsVisible(true)}
              style={{ color: '#fff' }}
              title="Theme Settings"
            >
              Theme
            </Button>
          </Space>
        </div>
      </Header>
      <Layout>
          <Sider width={themeSettings.sidebarWidth} className="cool-sidebar">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="sidebar-tabs" // Ensure you have the CSS for this class
            tabBarExtraContent={renderAddButton()}
            items={sidebarTabItems}
            moreIcon={<span style={{ fontSize: 12, color: 'var(--theme-text-secondary)' }}>⋯</span>}
          />
        </Sider>
        <Content style={{ padding: '24px', margin: 0, background: '#F5F5F5' }}>
          <Flex gap="small" align="center">
            <Select value={method} onChange={setMethod} style={{ width: 120 }}>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
            <Input 
              ref={urlInputRef}
              placeholder="https://api.example.com/resource" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
            />
            <Button type="primary" onClick={handleSendRequest} loading={isSending} disabled={isSending || hasValidationError}>Send</Button>
            <Button onClick={() => setIsCodeGenModalVisible(true)}>Code</Button>
            
            {/* Request Duplication Button */}
            {selectedRequest && (
              <RequestDuplication 
                request={selectedRequest} 
                onDuplicate={handleRequestDuplicate}
              />
            )}
            
            {/* Request Diff Button */}
            <RequestDiff 
              currentRequest={selectedRequest || { 
                key: 'current',
                title: 'Current Request',
                name: 'Current Request', 
                method, 
                url, 
                params: JSON.parse(paramsJson || '{}'), 
                headers: headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}), 
                body: rawBody 
              }}
              history={history}
            />
          </Flex>
          <Tabs
            activeKey={activeContentTab}
            onChange={setActiveContentTab}
            style={{ marginTop: 20 }}
            items={[
              {
                key: 'params',
                label: 'Query Params',
                children: (
                  <>
                    <Input.TextArea 
                      ref={paramsTextAreaRef}
                      rows={8} 
                      value={paramsJson} 
                      onChange={(e) => setParamsJson(e.target.value)} 
                      placeholder={`{\n  "page": "1"\n}`} 
                      status={paramsError ? 'error' as any : ''} 
                    />
                    {paramsError && <div style={{ color: '#ff4d4f', marginTop: 6, fontSize: 12 }}>{paramsError}</div>}
                  </>
                ),
              },
              {
                key: 'headers',
                label: 'Headers',
                children: (
                  <HeadersTab headers={headers} onChange={setHeaders} />
                ),
              },
              {
                key: 'auth',
                label: 'Authorization',
                children: (
                  <AuthorizationTab auth={auth} onChange={setAuth} />
                ),
              },
              {
                key: 'body',
                label: 'Body',
                children: (
                  <BodyTab 
                    bodyType={bodyType}
                    rawBodyType={rawBodyType}
                    rawBody={rawBody}
                    formData={formData}
                    urlEncoded={urlEncoded}
                    onChange={(config) => {
                      setBodyType(config.bodyType);
                      setRawBodyType(config.rawBodyType);
                      setRawBody(config.rawBody);
                      setFormData(config.formData);
                      setUrlEncoded(config.urlEncoded);
                    }}
                  />
                ),
              },
            ]}
          />
          <Card
            title="Response"
            style={{ marginTop: 24, minHeight: 200 }}
            bodyStyle={{ padding: 0 }}
          >
            {isSending ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>
                <Space>
                  <span>Loading...</span>
                  <Button danger size="small" onClick={cancelRequest}>Cancel</Button>
                </Space>
              </div>
            ) : responseMeta.status ? (
              <div style={{ padding: 16 }}>
                {/* Status and Meta Info */}
                <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 6, border: '1px solid #e9ecef' }}>
                  <Space size="large" wrap>
                    <div>
                      <Text strong>Status: </Text>
                      <Tag
                        color={
                          responseMeta.status >= 200 && responseMeta.status < 300
                            ? 'green'
                            : responseMeta.status >= 300 && responseMeta.status < 400
                            ? 'blue'
                            : responseMeta.status >= 400 && responseMeta.status < 500
                            ? 'red'
                            : responseMeta.status >= 500
                            ? 'volcano'
                            : 'default'
                        }
                        style={{ fontSize: '14px', fontWeight: 'bold' }}
                      >
                        {responseMeta.status} {responseMeta.status >= 200 && responseMeta.status < 300 ? 'OK' : responseMeta.status >= 300 && responseMeta.status < 400 ? 'Redirect' : responseMeta.status >= 400 && responseMeta.status < 500 ? 'Client Error' : responseMeta.status >= 500 ? 'Server Error' : 'Unknown'}
                      </Tag>
                    </div>
                    <div>
                      <Text strong>Time: </Text>
                      <Text>{responseMeta.durationMs} ms</Text>
                    </div>
                    <div>
                      <Text strong>Size: </Text>
                      <Text>{responseMeta.size} bytes</Text>
                    </div>
                  </Space>
                </div>
                {/* Collapsible Sections */}
                <Collapse
                  size="small"
                  items={[
                    {
                      key: 'headers',
                      label: `Headers (${Object.keys(responseMeta.headers).length})`,
                      children: (
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                          {Object.entries(responseMeta.headers).map(([key, value]) => (
                            <div key={key} style={{ marginBottom: 8, fontFamily: 'monospace', fontSize: '12px' }}>
                              <Text strong style={{ color: '#1890ff' }}>{key}:</Text>
                              <Text style={{ marginLeft: 8 }}>{value}</Text>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                    {
                      key: 'body',
                      label: 'Body',
                      children: (
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                          <pre
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              margin: 0,
                              fontSize: '12px',
                              fontFamily: 'monospace',
                              background: '#f8f9fa',
                              padding: 12,
                              borderRadius: 4,
                              border: '1px solid #e9ecef',
                            }}
                          >
                            {(() => {
                              try {
                                const parsed = JSON.parse(responseText);
                                return JSON.stringify(parsed, null, 2);
                              } catch {
                                return responseText;
                              }
                            })()}
                          </pre>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>
                <Text>No response yet. Send a request to see the response here.</Text>
              </div>
            )}
          </Card>
        </Content>
      </Layout>
      <Modal title="Create New Collection" open={isAddCollectionModalVisible} onOk={handleAddCollectionOk} onCancel={() => setIsAddCollectionModalVisible(false)} okText="Create">
        <Input placeholder="Enter collection name" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} onPressEnter={handleAddCollectionOk} />
      </Modal>
      {/* Environment Modal */}
      <Modal 
        title={editingEnv ? "Edit Environment" : "Add Environment"} 
        open={isEnvModalVisible} 
        onOk={handleSaveEnvironment} 
        onCancel={() => setIsEnvModalVisible(false)} 
        okText="Save"
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Environment Name:</Text>
          <Input 
            value={envName} 
            onChange={(e) => setEnvName(e.target.value)} 
            placeholder="e.g., Development, Staging, Production"
            style={{ marginTop: 8 }}
          />
        </div>
        <div>
          <Text strong>Variables:</Text>
          <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
            {Object.entries(envVars).map(([key, value], index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Input 
                  placeholder="Variable name" 
                  value={key} 
                  onChange={(e) => {
                    const newVars = { ...envVars };
                    delete newVars[key];
                    newVars[e.target.value] = value;
                    setEnvVars(newVars);
                  }}
                  style={{ flex: 1 }}
                />
                <Input 
                  placeholder="Value" 
                  value={value} 
                  onChange={(e) => setEnvVars({ ...envVars, [key]: e.target.value })}
                  style={{ flex: 1 }}
                />
                <Button 
                  danger 
                  onClick={() => {
                    const newVars = { ...envVars };
                    delete newVars[key];
                    setEnvVars(newVars);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button 
              onClick={() => setEnvVars({ ...envVars, [`var_${Date.now()}`]: '' })} 
              style={{ width: '100%' }}
            >
              Add Variable
            </Button>
          </div>
        </div>
      </Modal>
      {/* Code Generation Modal */}
      <Modal 
        title="Generate Code" 
        open={isCodeGenModalVisible} 
        onCancel={() => setIsCodeGenModalVisible(false)} 
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Select format:</Text>
          <Select 
            value={codeGenType} 
            onChange={setCodeGenType} 
            style={{ width: 200, marginLeft: 8 }}
          >
            <Option value="curl">cURL</Option>
            <Option value="fetch">JavaScript fetch</Option>
            <Option value="axios">Axios</Option>
            <Option value="httpie">HTTPie</Option>
          </Select>
        </div>
        <Input.TextArea 
          value={handleGenerateCode()} 
          rows={12} 
          readOnly 
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={() => navigator.clipboard.writeText(handleGenerateCode())}>
            Copy to Clipboard
          </Button>
        </div>
      </Modal>
      {/* Command Palette */}
      <CommandPalette
        visible={isCommandPaletteVisible}
        onClose={() => setIsCommandPaletteVisible(false)}
        onSendRequest={handleSendRequest}
        onSaveCollection={() => showCollectionSaved()}
        onFocusUrl={handleFocusUrl}
        onFocusParams={handleFocusParams}
        onFocusHeaders={handleFocusHeaders}
        onFocusBody={handleFocusBody}
        onSwitchToHistory={handleSwitchToHistory}
        onSwitchToCollections={handleSwitchToCollections}
        onSwitchToEnvironments={handleSwitchToEnvironments}
      />
      {/* Request Templates */}
      <RequestTemplates
        visible={isTemplatesModalVisible}
        onClose={() => setIsTemplatesModalVisible(false)}
        onApplyTemplate={handleApplyTemplate}
      />
      {/* Theme Settings */}
      <ThemeSettings
        visible={isThemeSettingsVisible}
        onClose={() => setIsThemeSettingsVisible(false)}
      />
    </Layout>
  );
}
export default App;

