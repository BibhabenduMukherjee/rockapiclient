import React, { useState, useEffect } from 'react';
import { Layout, Button, List, Select, Typography, Space, Tag, Collapse, Input, Modal, Form, Dropdown, message } from 'antd';
import { 
  FolderOutlined, 
  ExperimentOutlined, 
  HistoryOutlined, 
  StarOutlined,
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';
import { useCollections } from '../hooks/useCollections';
import { useEnvironments } from '../hooks/useEnvironments';
import { HistoryItem, ApiRequest } from '../types';
import CustomButton from './CustomButton';

interface BookmarkedRequest extends ApiRequest {
  bookmarkedAt: number;
  tags?: string[];
}
import HistorySearch from './HistorySearch';
import BookmarksPanel from './BookmarksPanel';

const { Sider } = Layout;
const { Text, Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

interface VerticalSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSelectRequest: (request: ApiRequest) => void;
  history: HistoryItem[];
  onHistorySearch: (filteredHistory: HistoryItem[]) => void;
  filteredHistory: HistoryItem[];
  onClearHistory: () => void;
  bookmarks: BookmarkedRequest[];
  removeBookmark: (request: ApiRequest) => void;
  updateBookmarkTags: (request: ApiRequest, tags: string[]) => void;
  clearAllBookmarks: () => void;
}

export default function VerticalSidebar({
  activeTab,
  onTabChange,
  onSelectRequest,
  history,
  onHistorySearch,
  filteredHistory,
  onClearHistory,
  bookmarks,
  removeBookmark,
  updateBookmarkTags,
  clearAllBookmarks
}: VerticalSidebarProps) {
  // Mock server state
  const [runningServers, setRunningServers] = useState<any[]>([]);
  const [savedServers, setSavedServers] = useState<any[]>([]);
  
  // Load servers on component mount
  useEffect(() => {
    const loadServers = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getAllServers) {
          const running = await window.electronAPI.getAllServers();
          setRunningServers(running);
        }
        if (window.electronAPI && window.electronAPI.getSavedServerConfigs) {
          const saved = await window.electronAPI.getSavedServerConfigs();
          setSavedServers(Object.values(saved));
        }
      } catch (error) {
        console.error('Error loading servers:', error);
      }
    };
    
    loadServers();
    
    // Listen for server changes
    const handleServerChange = () => {
      loadServers();
    };
    
    window.addEventListener('server-changed', handleServerChange);
    
    return () => {
      window.removeEventListener('server-changed', handleServerChange);
    };
  }, []);
  
  const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isEnvModalVisible, setIsEnvModalVisible] = useState(false);
  const [editingEnv, setEditingEnv] = useState<string | null>(null);
  const [envName, setEnvName] = useState('');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  
  // Collection management states
  const [isRenameCollectionModalVisible, setIsRenameCollectionModalVisible] = useState(false);
  const [editingCollectionKey, setEditingCollectionKey] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState('');
  const [isAddRequestModalVisible, setIsAddRequestModalVisible] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [selectedCollectionKey, setSelectedCollectionKey] = useState<string | null>(null);
  
  // Rename request modal states
  const [isRenameRequestModalVisible, setIsRenameRequestModalVisible] = useState(false);
  const [editingRequestKey, setEditingRequestKey] = useState<string | null>(null);
  const [editingRequestName, setEditingRequestName] = useState('');
  const [editingRequestCollectionKey, setEditingRequestCollectionKey] = useState<string | null>(null);
  
  // Request creation states
  const [newRequestMethod, setNewRequestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');

  // Export/Import loading states
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { collections, loading, addCollection, addRequest, renameNode, deleteNode, exportCollections, importCollections } = useCollections();
  const { state: envState, loading: envLoading, addEnvironment, removeEnvironment, setActiveEnvironment, updateVariables } = useEnvironments();

  // Wrapper functions with loading states
  const handleExportCollections = async () => {
    setIsExporting(true);
    try {
      await exportCollections();
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCollections = async () => {
    setIsImporting(true);
    try {
      await importCollections();
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      addCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsAddCollectionModalVisible(false);
    }
  };

  const handleAddEnvironment = () => {
    if (envName.trim()) {
      addEnvironment(envName.trim());
      setEnvName('');
      setEnvVars({});
      setIsEnvModalVisible(false);
    }
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

  const handleUpdateEnvironment = () => {
    if (editingEnv && envName.trim()) {
      updateVariables(editingEnv, envVars);
      setEditingEnv(null);
      setEnvName('');
      setEnvVars({});
      setIsEnvModalVisible(false);
    }
  };

  // Collection management functions
  const handleRenameCollection = (collectionKey: string, currentName: string) => {
    setEditingCollectionKey(collectionKey);
    setEditingCollectionName(currentName);
    setIsRenameCollectionModalVisible(true);
  };

  const handleUpdateCollectionName = () => {
    if (editingCollectionKey && editingCollectionName.trim()) {
      const collection = collections.find(c => c.key === editingCollectionKey);
      if (collection) {
        renameNode({
          key: editingCollectionKey,
          title: collection.title,
          type: 'collection'
        }, editingCollectionName.trim());
        setEditingCollectionKey(null);
        setEditingCollectionName('');
        setIsRenameCollectionModalVisible(false);
        message.success('Collection renamed successfully');
      }
    }
  };

  const handleDeleteCollection = (collectionKey: string, collectionName: string) => {
    // Direct delete without modal for testing
    const collection = collections.find(c => c.key === collectionKey);
    
    if (collection) {
      const nodeToDelete = {
        key: collectionKey,
        title: collection.title,
        type: 'collection' as const
      };
      deleteNode(nodeToDelete);
      message.success('Collection deleted successfully');
    } else {
      console.error('🗑️ Collection not found!');
      message.error('Collection not found!');
    }
  };

  const handleAddRequestToCollection = (collectionKey: string) => {
    setSelectedCollectionKey(collectionKey);
    setNewRequestName('');
    setIsAddRequestModalVisible(true);
  };

  const handleCreateRequest = () => {
    if (selectedCollectionKey && newRequestName.trim()) {
      const newRequest = {
        key: `req-${Date.now()}`,
        title: newRequestName.trim(),
        name: newRequestName.trim(),
        method: newRequestMethod,
        url: '',
        protocol: 'http' as const,
        params: {},
        headers: {},
        body: ''
      };
      addRequest(selectedCollectionKey, newRequest);
      
      // Make the new request an active tab
      if (onSelectRequest) {
        onSelectRequest(newRequest);
      }
      
      setSelectedCollectionKey(null);
      setNewRequestName('');
      setNewRequestMethod('GET');
      setIsAddRequestModalVisible(false);
      message.success('Request created successfully');
    }
  };

  const handleDeleteRequest = (requestKey: string, requestName: string, collectionKey: string) => {    
    // Direct delete without modal for testing
    const nodeToDelete = {
      key: requestKey,
      title: requestName,
      type: 'request' as const,
      collectionKey: collectionKey
    };
    deleteNode(nodeToDelete);
    message.success('Request deleted successfully');
  };

  const handleRenameRequest = (requestKey: string, currentName: string, collectionKey: string) => {
    setEditingRequestKey(requestKey);
    setEditingRequestName(currentName);
    setEditingRequestCollectionKey(collectionKey);
    setIsRenameRequestModalVisible(true);
  };

  const handleUpdateRequestName = () => {
    if (editingRequestKey && editingRequestName.trim() && editingRequestCollectionKey) {
      renameNode({
        key: editingRequestKey,
        title: editingRequestName.trim(),
        type: 'request',
        collectionKey: editingRequestCollectionKey
      }, editingRequestName.trim());
      setEditingRequestKey(null);
      setEditingRequestName('');
      setEditingRequestCollectionKey(null);
      setIsRenameRequestModalVisible(false);
      message.success('Request renamed successfully');
    }
  };

  const sidebarItems = [
    {
      key: 'collections',
      icon: <FolderOutlined />,
      label: 'Collections',
      count: collections.length
    },
    {
      key: 'bookmarks',
      icon: <StarOutlined />,
      label: 'Bookmarks',
      count: bookmarks.length
    },
    {
      key: 'environments',
      icon: <ExperimentOutlined />,
      label: 'Environments',
      count: envState.items.length
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'History',
      count: history.length
    },
    {
      key: 'servers',
      icon: <ThunderboltOutlined />,
      label: 'Mock Servers',
      count: savedServers.length
    }
  ];

  return (
    <>
      <Sider 
        width={280} 
        className="theme-sidebar"
        style={{ 
          background: 'var(--theme-surface)',
          borderRight: '1px solid var(--theme-border)',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Sidebar Navigation */}
        <div style={{ 
          padding: '16px 12px', 
          borderBottom: '1px solid var(--theme-border)',
          background: 'var(--theme-background)'
        }}>
          <Title level={5} style={{ 
            margin: 0, 
            color: 'var(--theme-text)',
            textAlign: 'center',
            fontSize: '16px'
          }}>
            Rock API Client
          </Title>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '8px' }}>
          {sidebarItems.map(item => (
            <Button
              key={item.key}
              type={activeTab === item.key ? 'primary' : 'text'}
              block
              className="theme-sidebar-tab-button"
              data-tour={item.key === 'collections' ? 'collections-tab' : item.key === 'environments' ? 'environments-tab' : item.key === 'history' ? 'history-tab' : undefined}
              style={{
                marginBottom: '4px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
              onClick={() => onTabChange(item.key)}
            >
              <Space>
                {item.icon}
                <span>{item.label}</span>
              </Space>
              <span 
                style={{ 
                  color: activeTab === item.key ? 'white' : 'var(--theme-text-secondary)',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: activeTab === item.key ? 'rgba(255,255,255,0.2)' : 'transparent'
                }}
              >
                {item.count}
              </span>
            </Button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto', 
          padding: '0 8px 8px 8px',
          height: 'calc(100vh - 140px)'
        }}>
          {activeTab === 'collections' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: 'var(--theme-text)' }}>Collections</Text>
                <Space>
                  <Button 
                    size="small" 
                    icon={<ImportOutlined />}
                    onClick={handleImportCollections}
                    loading={isImporting}
                    disabled={isExporting}
                    title="Import Collections"
                  />
                  <Button 
                    size="small" 
                    icon={<ExportOutlined />}
                    onClick={handleExportCollections}
                    loading={isExporting}
                    disabled={isImporting}
                    title="Export Collections"
                  />
                  <Button 
                    size="small" 
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddCollectionModalVisible(true)}
                    disabled={isExporting || isImporting}
                  >
                    New
                  </Button>
                </Space>
              </div>
              
              <Collapse 
                size="small" 
                ghost
                items={collections.map(collection => ({
                  key: collection.key,
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Space>
                        <FolderOutlined />
                        <Text style={{ color: 'var(--theme-text)' }}>{collection.title}</Text>
                      </Space>
                      <Space>
                        <span 
                          style={{ 
                            color: 'var(--theme-text-secondary)', 
                            fontWeight: 'bold',
                            fontSize: '11px',
                            padding: '1px 4px',
                            borderRadius: '2px',
                            backgroundColor: 'var(--theme-surface)',
                            border: '1px solid var(--theme-border)'
                          }}
                        >
                          {collection.requests?.length || 0}
                        </span>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'add-request',
                                label: 'Add Request',
                                icon: <PlusOutlined />,
                                onClick: () => handleAddRequestToCollection(collection.key)
                              },
                              {
                                key: 'rename',
                                label: 'Rename',
                                icon: <EditOutlined />,
                                onClick: () => handleRenameCollection(collection.key, collection.title)
                              },
                              {
                                key: 'delete',
                                label: 'Delete',
                                icon: <DeleteOutlined />,
                                danger: true,
                                onClick: () => {
                                  handleDeleteCollection(collection.key, collection.title);
                                }
                              }
                            ]
                          }}
                          trigger={['click']}
                        >
                          <Button 
                            size="small" 
                            type="text" 
                            icon={<MoreOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: 'var(--theme-text-secondary)' }}
                          />
                        </Dropdown>
                      </Space>
                    </div>
                  ),
                  children: (
                    <div style={{ paddingLeft: '16px' }}>
                      {collection.requests && collection.requests.length > 0 ? (
                        collection.requests.map((request: any) => (
                          <div
                            key={request.key}
                            style={{
                              padding: '8px 12px',
                              margin: '4px 0',
                              background: 'var(--theme-background)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              border: '1px solid var(--theme-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onClick={() => onSelectRequest(request)}
                          >
                            <Space>
                              <Tag color={
                                request.method === 'GET' ? 'blue' : 
                                request.method === 'POST' ? 'green' : 
                                request.method === 'PUT' ? 'orange' : 
                                request.method === 'DELETE' ? 'red' : 'default'
                              }>
                                {request.method}
                              </Tag>
                              <Text style={{ color: 'var(--theme-text)', fontSize: '12px' }}>
                                {request.title}
                              </Text>
                            </Space>
                            <Dropdown
                              menu={{
                                items: [
                                  {
                                    key: 'duplicate',
                                    label: 'Duplicate',
                                    icon: <PlusOutlined />,
                                    onClick: () => {
                                      const duplicateRequest = {
                                        title: `${request.title} Copy`,
                                        name: `${request.title} Copy`,
                                        method: request.method,
                                        url: request.url,
                                        params: request.params || {},
                                        headers: request.headers || {},
                                        body: request.body || ''
                                      };
                                      addRequest(collection.key, duplicateRequest);
                                    }
                                  },
                                  {
                                    key: 'rename',
                                    label: 'Rename',
                                    icon: <EditOutlined />,
                                    onClick: () => handleRenameRequest(request.key, request.title, collection.key)
                                  },
                                  {
                                    key: 'delete',
                                    label: 'Delete',
                                    icon: <DeleteOutlined />,
                                    danger: true,
                                    onClick: () => {
                                      handleDeleteRequest(request.key, request.title, collection.key);
                                    }
                                  }
                                ]
                              }}
                              trigger={['click']}
                            >
                              <Button 
                                size="small" 
                                type="text" 
                                icon={<MoreOutlined />}
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: 'var(--theme-text-secondary)' }}
                              />
                            </Dropdown>
                          </div>
                        ))
                      ) : (
                        <div style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          color: 'var(--theme-text-secondary)',
                          fontSize: '12px'
                        }}>
                          No requests in this collection
                          <br />
                          <CustomButton 
                            variant="ghost" 
                            size="small" 
                            icon={<PlusOutlined />}
                            onClick={() => handleAddRequestToCollection(collection.key)}
                            style={{ marginTop: '8px' }}
                          >
                            Add Request
                          </CustomButton>
                        </div>
                      )}
                    </div>
                  )
                }))}
              />
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <BookmarksPanel 
              onSelectRequest={onSelectRequest}
              bookmarks={bookmarks}
              removeBookmark={removeBookmark}
              updateBookmarkTags={updateBookmarkTags}
              clearAllBookmarks={clearAllBookmarks}
            />
          )}

          {activeTab === 'environments' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: 'var(--theme-text)' }}>Environments</Text>
                <Button 
                  
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={() => setIsEnvModalVisible(true)}
                >
                  New
                </Button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <Text style={{ color: 'var(--theme-text)', fontSize: '12px' }}>Active Environment:</Text>
                <Select
                  value={envState.activeKey}
                  onChange={setActiveEnvironment}
                  placeholder="No environment"
                  size="small"
                  style={{ width: '100%', marginTop: '4px' }}
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
                    style={{ 
                      padding: '8px 0',
                      borderBottom: '1px solid var(--theme-border)'
                    }}
                    actions={[
                      <Button 
                        size="small" 
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditEnvironment(env.key)}
                      />,
                      <Button 
                        size="small" 
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeEnvironment(env.key)}
                      />
                    ]}
                  >
                    <div style={{ color: 'var(--theme-text)' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{env.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--theme-text-secondary)' }}>
                        {Object.keys(env.variables).length} variables
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: 'var(--theme-text)' }}>Request History</Text>
                {history.length > 0 && (
                  <Button 
                    size="small" 
                    danger 
                    onClick={onClearHistory}
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <HistorySearch 
                history={history} 
                onSearch={onHistorySearch} 
              />
              
              <div style={{ marginTop: '8px' }}>
                <List
                  size="small"
                  dataSource={filteredHistory}
                  renderItem={(item) => (
                    <List.Item
                      onClick={() => {
                        // This will be handled by the parent component
                        const request: ApiRequest = {
                          key: `history-${item.timestamp}`,
                          title: `${item.method} ${item.url}`,
                          name: `${item.method} ${item.url}`,
                          method: item.method,
                          url: item.url,
                          params: item.request.params || {},
                          headers: item.request.headers || {},
                          body: item.request.body || ''
                        };
                        onSelectRequest(request);
                      }}
                      style={{ 
                        cursor: 'pointer',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--theme-border)'
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <Tag color={
                            item.method === 'GET' ? 'blue' : 
                            item.method === 'POST' ? 'green' : 
                            item.method === 'PUT' ? 'orange' : 'red'
                          }>
                            {item.method}
                          </Tag>
                          <Text style={{ color: 'var(--theme-text-secondary)', fontSize: '11px' }}>
                            {item.durationMs}ms
                          </Text>
                        </div>
                        <Text 
                          style={{ 
                            color: 'var(--theme-text)', 
                            fontSize: '12px',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.url}
                        </Text>
                        <Text style={{ color: 'var(--theme-text-secondary)', fontSize: '11px' }}>
                          Status: {item.status || 'ERR'}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          )}

          {activeTab === 'servers' && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ color: 'var(--theme-white-text)' }}>Mock Servers</Text>
                <Button 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    // This will be handled by the parent component
                    window.dispatchEvent(new CustomEvent('open-mock-server-manager'));
                  }}
                >
                  New Server
                </Button>
              </div>
              
              <div style={{ 
                padding: '16px', 
                textAlign: 'center',
                color: 'var(--theme-text-secondary)',
                border: '2px dashed var(--theme-border)',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <ThunderboltOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>Mock Server Manager</Text>
                </div>
                <Text style={{ fontSize: '12px' }}>
                  Create and manage local HTTP and WebSocket servers for testing
                </Text>
              </div>
            </div>
          )}
        </div>
      </Sider>

      {/* Add Collection Modal */}
      <Modal
        title="Add New Collection"
        open={isAddCollectionModalVisible}
        onOk={handleAddCollection}
        onCancel={() => {
          setIsAddCollectionModalVisible(false);
          setNewCollectionName('');
        }}
      >
        <Form>
          <Form.Item label="Collection Name">
            <Input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Enter collection name"
              onPressEnter={handleAddCollection}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Environment Modal */}
      <Modal
        title={editingEnv ? "Edit Environment" : "Add New Environment"}
        open={isEnvModalVisible}
        onOk={editingEnv ? handleUpdateEnvironment : handleAddEnvironment}
        onCancel={() => {
          setIsEnvModalVisible(false);
          setEditingEnv(null);
          setEnvName('');
          setEnvVars({});
        }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Environment Name">
            <Input
              value={envName}
              onChange={(e) => setEnvName(e.target.value)}
              placeholder="Enter environment name"
            />
          </Form.Item>
          <Form.Item label="Variables">
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {Object.entries(envVars).map(([key, value], index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
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
                    placeholder="Variable value"
                    value={value}
                    onChange={(e) => {
                      setEnvVars({ ...envVars, [key]: e.target.value });
                    }}
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
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => {
                  const newKey = `var_${Object.keys(envVars).length + 1}`;
                  setEnvVars({ ...envVars, [newKey]: '' });
                }}
              >
                Add Variable
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rename Collection Modal */}
      <Modal
        title="Rename Collection"
        open={isRenameCollectionModalVisible}
        onOk={handleUpdateCollectionName}
        onCancel={() => {
          setIsRenameCollectionModalVisible(false);
          setEditingCollectionKey(null);
          setEditingCollectionName('');
        }}
      >
        <Form>
          <Form.Item label="Collection Name">
            <Input
              value={editingCollectionName}
              onChange={(e) => setEditingCollectionName(e.target.value)}
              placeholder="Enter collection name"
              onPressEnter={handleUpdateCollectionName}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Request Modal */}
      <Modal
        title="Add Request to Collection"
        open={isAddRequestModalVisible}
        onOk={handleCreateRequest}
        onCancel={() => {
          setIsAddRequestModalVisible(false);
          setSelectedCollectionKey(null);
          setNewRequestName('');
          setNewRequestMethod('GET');
        }}
      >
        <Form>
          <Form.Item label="Request Name">
            <Input
              value={newRequestName}
              onChange={(e) => setNewRequestName(e.target.value)}
              placeholder="Enter request name"
              onPressEnter={handleCreateRequest}
            />
          </Form.Item>
          <Form.Item label="Method">
            <Select
              value={newRequestMethod}
              onChange={setNewRequestMethod}
              style={{ width: '100%' }}
            >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
              <Option value="PATCH">PATCH</Option>
              <Option value="HEAD">HEAD</Option>
              <Option value="OPTIONS">OPTIONS</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rename Request Modal */}
      <Modal
        title="Rename Request"
        open={isRenameRequestModalVisible}
        onOk={handleUpdateRequestName}
        onCancel={() => {
          setIsRenameRequestModalVisible(false);
          setEditingRequestKey(null);
          setEditingRequestName('');
          setEditingRequestCollectionKey(null);
        }}
      >
        <Form>
          <Form.Item label="Request Name">
            <Input
              value={editingRequestName}
              onChange={(e) => setEditingRequestName(e.target.value)}
              placeholder="Enter request name"
              onPressEnter={handleUpdateRequestName}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
