import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Input, Select, Button, Flex, Tabs, Modal, message, List, Tag, Collapse, Card, Typography, Space } from 'antd';
import { ExperimentOutlined, FolderOutlined, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import { useCollections } from './hooks/useCollections';
import SidebarCollection from './components/Sidebar';
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
  const [headersJson, setHeadersJson] = useState<string>('{}');
  const [body, setBody] = useState<string>('');
  const [responseText, setResponseText] = useState<string>('');
  const [responseMeta, setResponseMeta] = useState<{ status: number | null; durationMs: number; headers: Record<string, string>; size: number }>({ status: null, durationMs: 0, headers: {}, size: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);


  // The custom hook provides all data and functions for managing collections
  const { collections, loading, addCollection, addRequest, renameNode, deleteNode, updateRequest } = useCollections();

  // State for the "Add Collection" modal, which is simple enough to keep in App.tsx
  const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);

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
    // Clear previous response when switching requests
    setResponseText('');
    setResponseMeta({ status: null, durationMs: 0, headers: {}, size: 0 });
    setSelectedRequest(request);
    setMethod(request.method);
    setUrl(request.url);
    setParamsJson(JSON.stringify(request.params || {}, null, 2));
    setHeadersJson(JSON.stringify(request.headers || {}, null, 2));
    setBody(request.body || '');
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
    try {
      parsedHeaders = JSON.parse(headersJson || '{}') || {};
    } catch {}
    updateRequest(collectionKey, requestKey, {
      method,
      url,
      params: parsedParams,
      headers: parsedHeaders,
      body,
    });
  }, [method, url, paramsJson, headersJson, body, selectedRequest]);

  const constructedUrl = useMemo(() => {
    try {
      const base = url || '';
      const parsedParams = JSON.parse(paramsJson || '{}');
      const u = new URL(base, base.startsWith('http') ? undefined : 'http://placeholder');
      Object.entries(parsedParams || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) u.searchParams.set(String(k), String(v));
      });
      const result = u.toString();
      return base.startsWith('http') ? result : result.replace('http://placeholder', '');
    } catch {
      return url;
    }
  }, [url, paramsJson]);

  const sendRequest = async () => {
    if (!constructedUrl) {
      message.error('Please enter a URL');
      return;
    }
    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(headersJson || '{}') || {};
    } catch {
      message.error('Headers must be valid JSON');
      return;
    }
    let bodyToSend: BodyInit | undefined = undefined;
    if (method !== 'GET' && method !== 'DELETE' && body) {
      bodyToSend = body;
      if (!parsedHeaders['Content-Type']) parsedHeaders['Content-Type'] = 'application/json';
    }
    const started = performance.now();
    setIsSending(true);
    try {
      const res = await fetch(constructedUrl, {
        method,
        headers: parsedHeaders,
        body: bodyToSend,
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
          body,
        },
        response: { headers: resHeaders, body: resText },
      };
      setHistory((h) => [historyItem, ...h].slice(0, 200));
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - started);
      setResponseText(String(err?.message || err));
      setResponseMeta({ status: null, durationMs, headers: {}, size: 0 });
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
          body,
        },
        response: null,
      };
      setHistory((h) => [historyItem, ...h].slice(0, 200));
    }
    setIsSending(false);
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
      children: <div style={{ padding: '16px', color: 'white' }}>Environments UI here.</div>,
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
        <div style={{ padding: '8px' }}>
          <List
            size="small"
            dataSource={history}
            renderItem={(item) => (
              <List.Item
                onClick={() => {
                  setMethod(item.method);
                  setUrl(item.url);
                  setParamsJson(JSON.stringify(item.request.params || {}, null, 2));
                  setHeadersJson(JSON.stringify(item.request.headers || {}, null, 2));
                  setBody(item.request.body || '');
                }}
                style={{ cursor: 'pointer' }}
              >
                <Flex align="center" gap={8} style={{ width: '100%' }}>
                  <Tag color={item.method === 'GET' ? 'blue' : item.method === 'POST' ? 'orange' : item.method === 'PUT' ? 'gold' : 'red'}>{item.method}</Tag>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.url}</span>
                  <span style={{ color: '#888' }}>{item.status ?? 'ERR'}</span>
                  <span style={{ color: '#888' }}>{item.durationMs} ms</span>
                </Flex>
              </List.Item>
            )}
          />
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
            <Button type="primary" onClick={sendRequest} loading={isSending} disabled={isSending}>Send</Button>
          </Flex>
          <Tabs
            defaultActiveKey="params"
            style={{ marginTop: 20 }}
            items={[
              {
                key: 'params',
                label: 'Query Params',
                children: (
                  <Input.TextArea rows={8} value={paramsJson} onChange={(e) => setParamsJson(e.target.value)} placeholder={`{\n  "page": "1"\n}`} />
                ),
              },
              {
                key: 'headers',
                label: 'Headers',
                children: (
                  <Input.TextArea rows={8} value={headersJson} onChange={(e) => setHeadersJson(e.target.value)} placeholder={`{\n  "Authorization": "Bearer ..."\n}`} />
                ),
              },
              {
                key: 'body',
                label: 'Body',
                children: (
                  <Input.TextArea rows={12} value={body} onChange={(e) => setBody(e.target.value)} placeholder={`{\n  "name": "John"\n}`} />
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
              <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Loading...</div>
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
    </Layout>
  );
}

export default App;
