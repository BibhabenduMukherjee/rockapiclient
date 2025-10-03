import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Layout, Input, Select, Button, Flex, Tabs, Space, Typography, Collapse } from 'antd';
import { ThunderboltOutlined, DownOutlined, LinkOutlined } from '@ant-design/icons';
import HeadersTab, { HeaderItem } from './HeadersTab';
import AuthorizationTab, { AuthConfig } from './AuthorizationTab';
import BodyTab, { BodyType, RawBodyType, FormDataItem } from './BodyTab';
import RequestDuplication from './RequestDuplication';
import RequestDiff from './RequestDiff';
import ResponseAnalytics from './ResponseAnalytics';
import DataTransformation from './DataTransformation';
import WebSocketTabs from './WebSocketTabs';
import { ApiRequest, HistoryItem } from '../types';
import CustomButton from './CustomButton';

const { Content } = Layout;
const { Option } = Select;
const { Text } = Typography;

interface RequestPanelProps {
  request: ApiRequest;
  onRequestChange: (request: ApiRequest) => void;
  onSendRequest: () => void;
  onDuplicateRequest: (request: ApiRequest) => void;
  history: HistoryItem[];
  isSending: boolean;
  hasValidationError: boolean;
  responseText: string;
  responseMeta: { status: number | null; durationMs: number; headers: Record<string, string>; size: number };
  activeContentTab: string;
  onContentTabChange: (tab: string) => void;
  responseTimeData: Array<{ timestamp: number; duration: number; status: number; url: string }>;
  hasNewResponse?: boolean;
}

export default function RequestPanel({
  request,
  onRequestChange,
  onSendRequest,
  onDuplicateRequest,
  history,
  isSending,
  hasValidationError,
  responseText,
  responseMeta,
  activeContentTab,
  onContentTabChange,
  responseTimeData,
  hasNewResponse = false
}: RequestPanelProps) {
  const urlInputRef = useRef<any>(null);
  const paramsTextAreaRef = useRef<any>(null);
  
  // WebSocket state
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<any[]>([]);
  const [wsError, setWsError] = useState<string | null>(null);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  
  const connect = async (url: string, headers?: Record<string, string>) => {
    try {
      setConnectionState('connecting');
      setWsError(null);
      
      // Create WebSocket connection
      const ws = new WebSocket(url);
      setWsConnection(ws);
      
      ws.onopen = () => {
        setConnectionState('connected');
        setWsError(null);
        console.log('WebSocket connected to:', url);
      };
      
      ws.onmessage = (event) => {
        const newMessage = {
          id: Date.now().toString(),
          type: 'received',
          content: event.data,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        console.log('WebSocket message received:', event.data);
        console.log('Message object:', newMessage);
      };
      
      ws.onclose = (event) => {
        setConnectionState('disconnected');
        setWsConnection(null);
        console.log('WebSocket closed:', event.code, event.reason);
      };
      
      ws.onerror = (error) => {
        setConnectionState('error');
        setWsError('WebSocket connection failed');
        setWsConnection(null);
        console.error('WebSocket error:', error);
      };
      
    } catch (error: any) {
      setConnectionState('error');
      setWsError(error.message);
      console.error('Failed to connect to WebSocket:', error);
    }
  };
  
  const disconnect = () => {
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
    setConnectionState('disconnected');
  };
  
  const sendMessage = (message: string) => {
    if (wsConnection && connectionState === 'connected') {
      try {
        wsConnection.send(message);
        const newMessage = {
          id: Date.now().toString(),
          type: 'sent',
          content: message,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
        console.log('WebSocket message sent:', message);
      } catch (error: any) {
        console.error('Failed to send WebSocket message:', error);
        setWsError('Failed to send message');
      }
    }
  };
  
  const clearMessages = () => {
    setMessages([]);
  };

  // Cleanup WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  // Local state for params textarea
  const [paramsJson, setParamsJson] = useState(JSON.stringify(request.params || {}, null, 2));

  // Update local state when request changes
  useEffect(() => {
    setParamsJson(JSON.stringify(request.params || {}, null, 2));
  }, [request.params]);

  // Parse request data
  const method = request.method;
  const url = request.url;
  
  // Convert headers from Record<string, string> to HeaderItem[]
  const headers: HeaderItem[] = useMemo(() => {
    const headerEntries = Object.entries(request.headers || {});
    if (headerEntries.length === 0) {
      // Return empty array - HeadersTabNew will handle adding default empty row
      return [];
    }
    return headerEntries.map(([key, value], index) => ({
      id: `header-${key}-${index}`, // Stable ID based on key and index
      key,
      value: String(value),
      enabled: true
    }));
  }, [request.headers]);

  // Parse body data
  const bodyData = request.body || '';
  const bodyType: BodyType = (request.bodyType as BodyType) || (bodyData ? 'raw' : 'none');
  const rawBodyType: RawBodyType = (request.rawBodyType as RawBodyType) || 'json';
  const rawBody = bodyData;
  const formData: FormDataItem[] = (request.formData as FormDataItem[]) || [];
  const urlEncoded: FormDataItem[] = (request.urlEncoded as FormDataItem[]) || [];

  // Auth config
  const auth: AuthConfig = request.auth ? {
    type: request.auth.type as any,
    apiKey: (request.auth as any).apiKey || { key: '', value: '', addTo: 'header' },
    bearer: request.auth.bearer || { token: '' },
    basic: request.auth.basic || { username: '', password: '' },
    jwt: request.auth.jwt || { token: '' }
  } : {
    type: 'none',
    apiKey: { key: '', value: '', addTo: 'header' },
    bearer: { token: '' },
    basic: { username: '', password: '' },
    jwt: { token: '' }
  };

  // Validation helpers
  const paramsError = useMemo(() => {
    try { 
      JSON.parse(paramsJson || '{}'); 
      return null; 
    } catch (e: any) { 
      return 'Invalid JSON'; 
    }
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

  const handleMethodChange = (newMethod: string) => {
    onRequestChange({
      ...request,
      method: newMethod as any
    });
  };

  const handleProtocolChange = (protocol: string) => {
    onRequestChange({
      ...request,
      protocol: protocol as 'http' | 'websocket'
    });
    
    // Reset to appropriate default tab when protocol changes
    if (protocol === 'websocket') {
      onContentTabChange('message');
    } else {
      onContentTabChange('params');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRequestChange({
      ...request,
      url: e.target.value
    });
  };

  const handleParamsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setParamsJson(newValue); // Update local state immediately for responsive UI
    
    // Only update the request if JSON is valid
    if (newValue.trim() === '') {
      // Empty value - set empty object
      onRequestChange({
        ...request,
        params: {}
      });
    } else {
      try {
        const params = JSON.parse(newValue);
        onRequestChange({
          ...request,
          params
        });
      } catch (error) {
        // Don't update request state if JSON is invalid, but keep the text for editing
      }
    }
  };

  const handleHeadersChange = (newHeaders: HeaderItem[]) => {
    // Convert HeaderItem[] back to Record<string, string>
    const headersObj = newHeaders.reduce((acc, h) => {
      if (h.enabled && h.key && h.key.trim() !== '') {
        acc[h.key.trim()] = h.value || ''; // Allow empty values
      }
      return acc;
    }, {} as Record<string, string>);

    onRequestChange({
      ...request,
      headers: headersObj
    });
  };

  const handleBodyChange = (config: {
    bodyType: BodyType;
    rawBodyType: RawBodyType;
    rawBody: string;
    formData: FormDataItem[];
    urlEncoded: FormDataItem[];
  }) => {
    onRequestChange({
      ...request,
      body: config.rawBody,
      bodyType: config.bodyType as any,
      rawBodyType: config.rawBodyType as any,
      formData: config.formData as any,
      urlEncoded: config.urlEncoded as any
    });
  };

  const handleAuthChange = (newAuth: AuthConfig) => {
    onRequestChange({
      ...request,
      auth: newAuth as any
    });
  };

  // WebSocket-specific tabs
  const webSocketTabItems = WebSocketTabs({
    messages,
    onSendMessage: sendMessage,
    onClearMessages: clearMessages,
    connectionState,
    onConnect: connect,
    onDisconnect: disconnect,
    url,
    headers: request.headers || {},
    onUrlChange: (newUrl) => onRequestChange({ ...request, url: newUrl }),
    onHeadersChange: (newHeaders) => onRequestChange({ ...request, headers: newHeaders })
  });

  // HTTP-specific tabs
  const httpTabItems = [
    {
      key: 'params',
      label: 'Query Params',
      children: (
        <>
          <Input.TextArea 
            ref={paramsTextAreaRef}
            rows={8} 
            value={paramsJson} 
            onChange={handleParamsChange}
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
        <HeadersTab headers={headers} onChange={handleHeadersChange} />
      ),
    },
    {
      key: 'auth',
      label: 'Authorization',
      children: (
        <AuthorizationTab auth={auth} onChange={handleAuthChange} />
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
          onChange={handleBodyChange}
        />
      ),
    },
    {
      key: 'response',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Response</span>
          {hasNewResponse && (
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ff4d4f',
                animation: 'pulse 1.5s infinite'
              }}
              title="New response available"
            />
          )}
        </div>
      ),
      children: (
        <div>
          {/* Response Status Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 16,
            padding: '12px 16px',
            background: 'var(--theme-surface)',
            borderRadius: 8,
            border: '1px solid var(--theme-border)'
          }}>
            <Text strong style={{ color: 'var(--theme-text)', fontSize: '16px' }}>Response</Text>
            {responseMeta.status && (
              <>
                <Text 
                  style={{ 
                    color: getStatusColor(responseMeta.status),
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {responseMeta.status}
                </Text>
                <Text style={{ color: 'var(--theme-text-secondary)', fontSize: '12px' }}>
                  {responseMeta.durationMs}ms
                </Text>
                <Text style={{ color: 'var(--theme-text-secondary)', fontSize: '12px' }}>
                  {formatBytes(responseMeta.size)}
                </Text>
              </>
            )}
          </div>

          {/* Response Headers Dropdown */}
          {Object.keys(responseMeta.headers).length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Collapse
                size="small"
                className="response-collapse"
                style={{
                  background: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px'
                }}
                items={[
                  {
                    key: 'headers',
                    label: (
                      <Text strong style={{ fontSize: '13px', color: 'var(--theme-text)' }}>
                        Headers ({Object.keys(responseMeta.headers).length})
                      </Text>
                    ),
                    children: (
                      <div style={{ 
                        background: 'var(--theme-background)', 
                        padding: 12, 
                        borderRadius: 6,
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        height: '200px',
                        overflowY: 'auto',
                        border: '1px solid var(--theme-border)',
                        color: 'var(--theme-text)'
                      }}>
                        {Object.entries(responseMeta.headers).map(([key, value]) => (
                          <div key={key} style={{ 
                            marginBottom: 6, 
                            wordBreak: 'break-all',
                            padding: '4px 0',
                            borderBottom: '1px solid var(--theme-border)'
                          }}>
                            <Text strong style={{ color: 'var(--theme-primary)' }}>{key}:</Text> 
                            <span style={{ color: 'var(--theme-text-secondary)', marginLeft: '8px' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                ]}
              />
            </div>
          )}
          
          {/* Data Transformation */}
          {responseText && (
            <div style={{ marginBottom: 12 }}>
              <DataTransformation 
                responseData={responseText}
                onTransformedData={(data) => {
                  // You can handle the transformed data here if needed
                  console.log('Transformed data:', data);
                }}
              />
            </div>
          )}

          {/* Response Body Dropdown */}
          {responseText && (
            <div>
              <Collapse
                size="small"
                defaultActiveKey={['body']}
                className="response-collapse"
                style={{
                  background: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '6px'
                }}
                items={[
                  {
                    key: 'body',
                    label: (
                      <Text strong style={{ fontSize: '13px', color: 'var(--theme-text)' }}>
                        Body ({formatBytes(responseText.length)})
                      </Text>
                    ),
                    children: (
                      <div style={{ 
                        height: '300px',
                        overflow: 'hidden',
                        background: 'var(--theme-background)',
                        borderRadius: 6,
                        border: '1px solid var(--theme-border)'
                      }}>
                        <Input.TextArea 
                          value={responseText} 
                          readOnly 
                          placeholder="Response will appear here..."
                          style={{ 
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            height: '100%',
                            resize: 'none',
                            background: 'var(--theme-background)',
                            border: 'none',
                            color: 'var(--theme-text)',
                            padding: '12px'
                          }}
                        />
                      </div>
                    )
                  }
                ]}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  // Use appropriate tabs based on protocol
  const contentTabItems = request.protocol === 'websocket' ? webSocketTabItems : httpTabItems;

  return (
    <>
    <style>{`
      .response-collapse .ant-collapse-header {
        background: var(--theme-surface) !important;
        color: var(--theme-text) !important;
        border-bottom: 1px solid var(--theme-border) !important;
      }
      
      .response-collapse .ant-collapse-content {
        background: var(--theme-background) !important;
        color: var(--theme-text) !important;
      }
      
      .response-collapse .ant-collapse-content-box {
        background: var(--theme-background) !important;
        color: var(--theme-text) !important;
      }
      
      .response-collapse .ant-collapse-item {
        border: 1px solid var(--theme-border) !important;
        background: var(--theme-surface) !important;
      }
    `}</style>
    <Content style={{ padding: '24px', margin: 0, background: 'var(--theme-background)', height: '100%', overflow: 'auto' }}>
      {/* Request Builder */}
      <Flex gap="small" align="center" style={{ marginBottom: '20px' }}>
        <Select 
          value={request.protocol || 'http'} 
          onChange={handleProtocolChange} 
          style={{ width: 100 }}
        >
          <Option value="http">HTTP</Option>
          <Option value="websocket">WebSocket</Option>
        </Select>
        {request.protocol === 'http' && (
          <Select value={method} onChange={handleMethodChange} style={{ width: 120 }}>
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
            <Option value="PATCH">PATCH</Option>
            <Option value="HEAD">HEAD</Option>
            <Option value="OPTIONS">OPTIONS</Option>
          </Select>
        )}
        <Input 
          ref={urlInputRef}
          placeholder={request.protocol === 'websocket' ? "ws://localhost:8080/websocket" : "https://api.example.com/resource"}
          value={url} 
          onChange={handleUrlChange}
          style={{ flex: 1 }}
          prefix={request.protocol === 'websocket' ? <LinkOutlined /> : undefined}
        />
        {request.protocol === 'websocket' ? (
          <CustomButton 
            variant="primary" 
            onClick={() => connect(url, request.headers)} 
            loading={connectionState === 'connecting'} 
            disabled={connectionState === 'connected' || !url}
            icon={<LinkOutlined />}
          >
            {connectionState === 'connected' ? 'Connected' : 'Connect'}
          </CustomButton>
        ) : (
          <CustomButton 
            variant="primary" 
            onClick={onSendRequest} 
            loading={isSending} 
            disabled={isSending || hasValidationError}
            icon={<ThunderboltOutlined />}
          >
            Send
          </CustomButton>
        )}
        
        {/* Request Duplication Button */}
        <RequestDuplication 
          request={request} 
          onDuplicate={onDuplicateRequest}
        />
        
        {/* Request Diff Button */}
        <RequestDiff 
          currentRequest={request}
          history={history}
        />
      </Flex>

      {/* Content Tabs */}
      <div data-tour="request-tabs-content">
        <Tabs
          key={`tabs-${request.protocol || 'http'}`}
          activeKey={activeContentTab}
          onChange={onContentTabChange}
          items={contentTabItems}
          className="enhanced-content-tabs"
          style={{ marginTop: 20 }}
        />
      </div>

      {/* Response Analytics */}
      <ResponseAnalytics responseTimeData={responseTimeData} />

    </Content>
    <style>{pulseAnimation}</style>
    </>
  );
}

// Add CSS animation for the pulse effect
const pulseAnimation = `
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Enhanced content tabs styling for dark theme
const enhancedContentTabStyles = `
  .enhanced-content-tabs .ant-tabs-tab {
    padding: 14px 24px !important;
    margin-right: 2px !important;
    transition: all 0.2s ease !important;
    border-radius: 6px !important;
    font-weight: 500 !important;
  }
  
  .enhanced-content-tabs .ant-tabs-tab:hover {
    transform: translateY(-1px) !important;
  }
  
  .enhanced-content-tabs .ant-tabs-tab-active {
    font-weight: 600 !important;
  }
  
  .enhanced-content-tabs .ant-tabs-ink-bar {
    height: 3px !important;
    border-radius: 2px !important;
  }
  
  .enhanced-content-tabs .ant-tabs-content-holder {
    padding: 24px !important;
    border-radius: 0 0 8px 8px !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = enhancedContentTabStyles;
  document.head.appendChild(styleSheet);
}

// Helper function to get status code color
function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return '#52c41a'; // Green for success
  if (status >= 300 && status < 400) return '#1890ff'; // Blue for redirect
  if (status >= 400 && status < 500) return '#faad14'; // Orange for client error
  if (status >= 500) return '#ff4d4f'; // Red for server error
  return '#666'; // Gray for other status codes
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
