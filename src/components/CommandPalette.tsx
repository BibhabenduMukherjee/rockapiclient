import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, List, Typography, Space, Tag } from 'antd';
import { SearchOutlined, SendOutlined, SaveOutlined, HistoryOutlined, FolderOutlined, ExperimentOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
  onSendRequest: () => void;
  onSaveCollection?: () => void;
  onFocusUrl?: () => void;
  onFocusParams?: () => void;
  onFocusHeaders?: () => void;
  onFocusBody?: () => void;
  onSwitchToHistory?: () => void;
  onSwitchToCollections?: () => void;
  onSwitchToEnvironments?: () => void;
}

export default function CommandPalette({
  visible,
  onClose,
  onSendRequest,
  onSaveCollection,
  onFocusUrl,
  onFocusParams,
  onFocusHeaders,
  onFocusBody,
  onSwitchToHistory,
  onSwitchToCollections,
  onSwitchToEnvironments
}: CommandPaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<any>(null);

  const commands: Command[] = [
    {
      id: 'send-request',
      title: 'Send Request',
      description: 'Execute the current request',
      icon: <SendOutlined />,
      action: () => {
        onSendRequest();
        onClose();
      },
      keywords: ['send', 'execute', 'request', 'go']
    },
    {
      id: 'save-collection',
      title: 'Save Collection',
      description: 'Save current collection changes',
      icon: <SaveOutlined />,
      action: () => {
        onSaveCollection?.();
        onClose();
      },
      keywords: ['save', 'collection', 'store']
    },
    {
      id: 'focus-url',
      title: 'Focus URL Field',
      description: 'Move cursor to URL input',
      icon: <SearchOutlined />,
      action: () => {
        onFocusUrl?.();
        onClose();
      },
      keywords: ['url', 'address', 'endpoint', 'focus']
    },
    {
      id: 'focus-params',
      title: 'Focus Params Tab',
      description: 'Switch to query parameters tab',
      icon: <SearchOutlined />,
      action: () => {
        onFocusParams?.();
        onClose();
      },
      keywords: ['params', 'parameters', 'query', 'focus']
    },
    {
      id: 'focus-headers',
      title: 'Focus Headers Tab',
      description: 'Switch to headers tab',
      icon: <SearchOutlined />,
      action: () => {
        onFocusHeaders?.();
        onClose();
      },
      keywords: ['headers', 'focus']
    },
    {
      id: 'focus-body',
      title: 'Focus Body Tab',
      description: 'Switch to request body tab',
      icon: <SearchOutlined />,
      action: () => {
        onFocusBody?.();
        onClose();
      },
      keywords: ['body', 'payload', 'focus']
    },
    {
      id: 'switch-history',
      title: 'Switch to History',
      description: 'Open history sidebar tab',
      icon: <HistoryOutlined />,
      action: () => {
        onSwitchToHistory?.();
        onClose();
      },
      keywords: ['history', 'switch', 'sidebar']
    },
    {
      id: 'switch-collections',
      title: 'Switch to Collections',
      description: 'Open collections sidebar tab',
      icon: <FolderOutlined />,
      action: () => {
        onSwitchToCollections?.();
        onClose();
      },
      keywords: ['collections', 'switch', 'sidebar']
    },
    {
      id: 'switch-environments',
      title: 'Switch to Environments',
      description: 'Open environments sidebar tab',
      icon: <ExperimentOutlined />,
      action: () => {
        onSwitchToEnvironments?.();
        onClose();
      },
      keywords: ['environments', 'switch', 'sidebar']
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <Modal
      title="Command Palette"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      style={{ top: 100 }}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          ref={inputRef}
          placeholder="Type a command or search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          prefix={<SearchOutlined />}
          size="large"
        />
      </div>
      
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <List
          dataSource={filteredCommands}
          renderItem={(command, index) => (
            <List.Item
              style={{
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#f0f8ff' : 'transparent',
                padding: '12px 16px',
                borderRadius: 4,
                marginBottom: 4
              }}
              onClick={() => command.action()}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <List.Item.Meta
                avatar={command.icon}
                title={
                  <Space>
                    <Text strong>{command.title}</Text>
                    {command.keywords.slice(0, 2).map(keyword => (
                      <Tag key={keyword} color="blue">
                        {keyword}
                      </Tag>
                    ))}
                  </Space>
                }
                description={command.description}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: '#f8f9fa', borderRadius: 4 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <strong>Keyboard shortcuts:</strong> ↑↓ to navigate, Enter to execute, Esc to close
        </Text>
      </div>
    </Modal>
  );
}
