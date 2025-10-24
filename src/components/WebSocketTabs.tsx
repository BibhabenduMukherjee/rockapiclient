import React, { useState, useRef } from 'react';
import { Tabs, Input, Button, Space, Typography, Card, Tag, message, Tooltip } from 'antd';
import { SendOutlined, ClearOutlined, CopyOutlined, DisconnectOutlined, LinkOutlined } from '@ant-design/icons';
import { WebSocketMessage } from '../types';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface WebSocketTabsProps {
  messages: WebSocketMessage[];
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  onConnect: (url: string, headers?: Record<string, string>) => Promise<void>;
  onDisconnect: () => void;
  url: string;
  headers: Record<string, string>;
  onUrlChange: (url: string) => void;
  onHeadersChange: (headers: Record<string, string>) => void;
}

export default function WebSocketTabs({
  messages,
  onSendMessage,
  onClearMessages,
  connectionState,
  onConnect,
  onDisconnect,
  url,
  headers,
  onUrlChange,
  onHeadersChange
}: WebSocketTabsProps) {
  const [messageText, setMessageText] = useState('');
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSendMessage();
    }
  };

  const handleAddHeader = () => {
    if (headerKey.trim() && headerValue.trim()) {
      onHeadersChange({
        ...headers,
        [headerKey]: headerValue
      });
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const handleRemoveHeader = (key: string) => {
    const newHeaders = { ...headers };
    delete newHeaders[key];
    onHeadersChange(newHeaders);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('Message copied to clipboard');
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'green';
      case 'connecting': return 'blue';
      case 'error': return 'red';
      default: return 'default';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Disconnected';
    }
  };

  const tabItems = [
    {
      key: 'message',
      label: 'Message',
      children: (
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          {/* Connection Status */}
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--theme-background-secondary)', borderRadius: '6px' }}>
            <Space>
              <Tag color={getConnectionStatusColor()}>
                {getConnectionStatusText()}
              </Tag>
              {connectionState === 'connected' && (
                <Button 
                  size="small" 
                  danger 
                  icon={<DisconnectOutlined />}
                  onClick={onDisconnect}
                >
                  Disconnect
                </Button>
              )}
            </Space>
          </div>

          {/* Messages Display */}
          <div style={{ 
            flex: 1, 
            border: '1px solid var(--theme-border)', 
            borderRadius: '6px', 
            padding: '12px', 
            overflowY: 'auto',
            background: 'var(--theme-background)',
            marginBottom: '12px'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--theme-text-secondary)', padding: '20px' }}>
                No messages yet. Connect and start sending messages.
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <Tag color={msg.type === 'sent' ? 'blue' : 'green'}>
                      {msg.type === 'sent' ? 'Sent' : 'Received'}
                    </Tag>
                    <Space>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Text>
                      <Tooltip title="Copy message">
                        <Button 
                          size="small" 
                          type="text" 
                          icon={<CopyOutlined />}
                          onClick={() => copyMessage(msg.content)}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                  <Card size="small" style={{ 
                    background: msg.type === 'sent' ? '#e6f7ff' : '#f6ffed',
                    border: `1px solid ${msg.type === 'sent' ? '#91d5ff' : '#b7eb8f'}`
                  }}>
                    <Paragraph 
                      style={{ 
                        margin: 0, 
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, SF Mono, Monaco, Inconsolata, Roboto Mono, Source Code Pro, monospace',
                        fontSize: '13px'
                      }}
                    >
                      {msg.content}
                    </Paragraph>
                  </Card>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div>
            <TextArea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here... (Ctrl+Enter to send)"
              rows={3}
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Press Ctrl+Enter to send
              </Text>
              <Space>
                <Button 
                  size="small" 
                  icon={<ClearOutlined />}
                  onClick={onClearMessages}
                  disabled={messages.length === 0}
                >
                  Clear
                </Button>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || connectionState !== 'connected'}
                >
                  Send
                </Button>
              </Space>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'params',
      label: 'Params',
      children: (
        <div style={{ padding: '16px' }}>
          <Text type="secondary">
            WebSocket connections don't use traditional query parameters.
            Parameters are typically sent as part of the connection URL or in the initial handshake headers.
          </Text>
        </div>
      )
    },
    {
      key: 'headers',
      label: 'Headers',
      children: (
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Text strong>Connection Headers</Text>
            <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
              Headers sent during WebSocket connection handshake
            </Text>
          </div>

          {/* Add Header Form */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px',
            alignItems: 'center'
          }}>
            <Input
              placeholder="Header name"
              value={headerKey}
              onChange={(e) => setHeaderKey(e.target.value)}
              style={{ flex: 1 }}
            />
            <Input
              placeholder="Header value"
              value={headerValue}
              onChange={(e) => setHeaderValue(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button 
              type="primary" 
              onClick={handleAddHeader}
              disabled={!headerKey.trim() || !headerValue.trim()}
            >
              Add
            </Button>
          </div>

          {/* Headers List */}
          {Object.keys(headers).length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--theme-text-secondary)', 
              padding: '20px',
              border: '1px dashed var(--theme-border)',
              borderRadius: '6px'
            }}>
              No headers added
            </div>
          ) : (
            <div style={{ 
              border: '1px solid var(--theme-border)', 
              borderRadius: '6px',
              background: 'var(--theme-background)'
            }}>
              {Object.entries(headers).map(([key, value]) => (
                <div key={key} style={{ 
                  padding: '12px', 
                  borderBottom: '1px solid var(--theme-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <Text strong>{key}</Text>
                    <div style={{ color: 'var(--theme-text-secondary)', fontSize: '12px' }}>{value}</div>
                  </div>
                  <Button 
                    size="small" 
                    type="text" 
                    danger
                    onClick={() => handleRemoveHeader(key)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'settings',
      label: 'Settings',
      children: (
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Text strong>WebSocket Settings</Text>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Text strong>Connection URL</Text>
            <Input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="ws://localhost:8080/websocket"
              style={{ marginTop: '8px' }}
              prefix={<LinkOutlined />}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: '4px' }}>
              WebSocket URL (ws:// or wss://)
            </Text>
          </div>

          <div style={{ 
            padding: '12px', 
            background: 'var(--theme-background-secondary)', 
            borderRadius: '6px',
            marginTop: '16px'
          }}>
            <Text type="secondary">
              <strong>Note:</strong> WebSocket connections are persistent and bidirectional. 
              Once connected, you can send and receive messages in real-time.
            </Text>
          </div>
        </div>
      )
    }
  ];

  return tabItems;
}
