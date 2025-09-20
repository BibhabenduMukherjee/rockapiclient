import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Input, Select, Button, Flex, Tabs, Modal, message, List, Tag, Collapse, Card, Typography, Space } from 'antd';
import { ExperimentOutlined, FolderOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import { useCollections } from './hooks/useCollections';
import { useEnvironments, substituteTemplate } from './hooks/useEnvironments';
import SidebarCollection from './components/Sidebar';
import HeadersTab from './components/HeadersTab';
import AuthorizationTab, { AuthConfig } from './components/AuthorizationTab';
import BodyTab, { BodyType, RawBodyType, FormDataItem } from './components/BodyTab';
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
  const [codeGenType, setCodeGenType] = useState<'curl' | 'fetch' | 'axios' | 'httpie'>('curl');

  // Load history on mount
  useEffect(() => {
    // @ts-ignore
    if (window.electron?.loadHistory) {
      // @ts-ignore
      window.electron.loadHistory().then((items: HistoryItem[]) => setHistory(items || [])).catch(() => {});
    }
  }, []);

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

  const sendRequest = async () => {
    if (!constructedUrl) {
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
    // Build headers from the new modular system
    let parsedHeaders: Record<string, string> = {};
    
    // Add headers from HeadersTab
    headers.forEach(header => {
      if (header.enabled && header.key && header.value) {
        parsedHeaders[header.key] = substituteTemplate(header.value, activeEnvVars);
      }
    });
    
    // Add authorization headers
    if (auth.type === 'apiKey' && auth.apiKey.key && auth.apiKey.value) {
      if (auth.apiKey.addTo === 'header') {
        parsedHeaders[auth.apiKey.key] = substituteTemplate(auth.apiKey.value, activeEnvVars);
      }
    } else if (auth.type === 'bearer' && auth.bearer.token) {
      parsedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.bearer.token, activeEnvVars)}`;
    } else if (auth.type === 'basic' && auth.basic.username && auth.basic.password) {
      const credentials = btoa(`${auth.basic.username}:${auth.basic.password}`);
      parsedHeaders['Authorization'] = `Basic ${credentials}`;
    } else if (auth.type === 'jwt' && auth.jwt.token) {
      parsedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.jwt.token, activeEnvVars)}`;
    }
    
    // Build body based on body type
    let bodyToSend: BodyInit | undefined = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      if (bodyType === 'raw' && rawBody) {
        bodyToSend = substituteTemplate(rawBody, activeEnvVars);
        if (rawBodyType === 'json' && !parsedHeaders['Content-Type']) {
          parsedHeaders['Content-Type'] = 'application/json';
        } else if (rawBodyType === 'xml' && !parsedHeaders['Content-Type']) {
          parsedHeaders['Content-Type'] = 'application/xml';
        } else if (rawBodyType === 'html' && !parsedHeaders['Content-Type']) {
          parsedHeaders['Content-Type'] = 'text/html';
        }
      } else if (bodyType === 'form-data' && formData.length > 0) {
        const formDataObj = new FormData();
        formData.forEach(item => {
          if (item.enabled && item.key && item.value) {
            formDataObj.append(item.key, item.value);
          }
        });
        bodyToSend = formDataObj;
        // Don't set Content-Type for FormData, let browser set it with boundary
        delete parsedHeaders['Content-Type'];
      } else if (bodyType === 'x-www-form-urlencoded' && urlEncoded.length > 0) {
        const params = new URLSearchParams();
        urlEncoded.forEach(item => {
          if (item.enabled && item.key && item.value) {
            params.append(item.key, item.value);
          }
        });
        bodyToSend = params.toString();
        if (!parsedHeaders['Content-Type']) {
          parsedHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }
    }
    const started = performance.now();
    setIsSending(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const res = await fetch(constructedUrl, {
        method,
        headers: parsedHeaders,
        body: bodyToSend,
        signal: controller.signal,
      });
      const durationMs = Math.round(performance.now() - started);
      const resText = await res.text();
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      setResponseText(resText);
      setResponseMeta({ status: res.status, durationMs, headers: resHeaders, size: new Blob([resText]).size });

      const historyItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        method,
        url: constructedUrl,
        status: res.status,
        durationMs,
        timestamp: Date.now(),
        request: {
          params: JSON.parse(paramsJson || '{}') || {},
          headers: parsedHeaders,
          body: rawBody,
        },
        response: { headers: resHeaders, body: resText },
      };
      setHistory((h) => [historyItem, ...h].slice(0, 200));
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - started);
      if (err?.name === 'AbortError') {
        setResponseText('Request cancelled');
        setResponseMeta({ status: null, durationMs, headers: {}, size: 0 });
      } else {
        setResponseText(String(err?.message || err));
        setResponseMeta({ status: null, durationMs, headers: {}, size: 0 });
      }
      const historyItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        method,
        url: constructedUrl,
        status: null,
        durationMs,
        timestamp: Date.now(),
        request: {
          params: JSON.parse(paramsJson || '{}') || {},
          headers: parsedHeaders,
          body: rawBody,
        },
        response: null,
      };
      setHistory((h) => [historyItem, ...h].slice(0, 200));
    }
    setIsSending(false);
    abortControllerRef.current = null;
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
  const generateCode = () => {
    // Build headers from the new modular system
    let substitutedHeaders: Record<string, string> = {};
    
    // Add headers from HeadersTab
    headers.forEach(header => {
      if (header.enabled && header.key && header.value) {
        substitutedHeaders[header.key] = substituteTemplate(header.value, activeEnvVars);
      }
    });
    
    // Add authorization headers
    if (auth.type === 'apiKey' && auth.apiKey.key && auth.apiKey.value) {
      if (auth.apiKey.addTo === 'header') {
        substitutedHeaders[auth.apiKey.key] = substituteTemplate(auth.apiKey.value, activeEnvVars);
      }
    } else if (auth.type === 'bearer' && auth.bearer.token) {
      substitutedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.bearer.token, activeEnvVars)}`;
    } else if (auth.type === 'basic' && auth.basic.username && auth.basic.password) {
      const credentials = btoa(`${auth.basic.username}:${auth.basic.password}`);
      substitutedHeaders['Authorization'] = `Basic ${credentials}`;
    } else if (auth.type === 'jwt' && auth.jwt.token) {
      substitutedHeaders['Authorization'] = `Bearer ${substituteTemplate(auth.jwt.token, activeEnvVars)}`;
    }
    
    // Build body
    let substitutedBody = '';
    if (bodyType === 'raw' && rawBody) {
      substitutedBody = substituteTemplate(rawBody, activeEnvVars);
    } else if (bodyType === 'x-www-form-urlencoded' && urlEncoded.length > 0) {
      const params = new URLSearchParams();
      urlEncoded.forEach(item => {
        if (item.enabled && item.key && item.value) {
          params.append(item.key, item.value);
        }
      });
      substitutedBody = params.toString();
    }

    switch (codeGenType) {
      case 'curl':
        let curlCmd = `curl -X ${method} "${constructedUrl}"`;
        Object.entries(substitutedHeaders).forEach(([k, v]) => {
          curlCmd += ` \\\n  -H "${k}: ${v}"`;
        });
        if (substitutedBody && method !== 'GET' && method !== 'DELETE') {
          curlCmd += ` \\\n  -d '${substitutedBody}'`;
        }
        return curlCmd;
      
      case 'fetch':
        return `fetch("${constructedUrl}", {
  method: "${method}",
  headers: ${JSON.stringify(substitutedHeaders, null, 2)},
  ${substitutedBody && method !== 'GET' && method !== 'DELETE' ? `body: ${rawBodyType === 'json' ? JSON.stringify(JSON.parse(substitutedBody), null, 2) : `'${substitutedBody}'`},` : ''}
});`;
      
      case 'axios':
        return `axios.${method.toLowerCase()}("${constructedUrl}", {
  headers: ${JSON.stringify(substitutedHeaders, null, 2)},
  ${substitutedBody && method !== 'GET' && method !== 'DELETE' ? `data: ${rawBodyType === 'json' ? JSON.stringify(JSON.parse(substitutedBody), null, 2) : `'${substitutedBody}'`},` : ''}
});`;
      
      case 'httpie':
        let httpieCmd = `http ${method} "${constructedUrl}"`;
        Object.entries(substitutedHeaders).forEach(([k, v]) => {
          httpieCmd += ` "${k}:${v}"`;
        });
        if (substitutedBody && method !== 'GET' && method !== 'DELETE') {
          httpieCmd += ` <<< '${substitutedBody}'`;
        }
        return httpieCmd;
      
      default:
        return '';
    }
  };
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
            <Text style={{ color: 'white', fontSize: 12 }}>Active Environment:</Text>
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
                <div style={{ color: 'white' }}>
                  <div style={{ fontWeight: 'bold' }}>{env.name}</div>
                  <div style={{ fontSize: 11, color: '#ccc' }}>
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
            <Text style={{ color: 'white', fontSize: 12 }}>Request History</Text>
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
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            <List
              size="small"
              dataSource={history}
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
                    <span style={{ color : "white", flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</span>
                    <span style={{ color: '#888' }}>{item.status ?? 'ERR'}</span>
                    <span style={{ color: '#888' }}>{item.durationMs} ms</span>
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
      <Header style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', background: '#252526' }}>Rock API Client</Header>
      <Layout>
          <Sider width={300} className="cool-sidebar">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="sidebar-tabs" // Ensure you have the CSS for this class
            tabBarExtraContent={renderAddButton()}
            items={sidebarTabItems}
            moreIcon={<span style={{ fontSize: 12, color : "wheat" }}>⋯</span>}
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
            <Input placeholder= "https://api.example.com/resource" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button type="primary" onClick={sendRequest} loading={isSending} disabled={isSending || hasValidationError}>Send</Button>
            <Button onClick={() => setIsCodeGenModalVisible(true)}>Code</Button>
          </Flex>
          <Tabs
            defaultActiveKey="params"
            style={{ marginTop: 20 }}
            items={[
              {
                key: 'params',
                label: 'Query Params',
                children: (
                  <>
                    <Input.TextArea rows={8} value={paramsJson} onChange={(e) => setParamsJson(e.target.value)} placeholder={`{\n  "page": "1"\n}`} status={paramsError ? 'error' as any : ''} />
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
          value={generateCode()} 
          rows={12} 
          readOnly 
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={() => navigator.clipboard.writeText(generateCode())}>
            Copy to Clipboard
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
