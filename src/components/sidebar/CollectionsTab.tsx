import React, { useState } from 'react';
import { Button, List, Space, Typography, Modal, Form, Input, Select, Dropdown, message } from 'antd';
import { 
  FolderOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MoreOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useCollections } from '../../hooks/useCollections';
import { ApiRequest } from '../../types';

const { Text, Title } = Typography;
const { Option } = Select;

interface CollectionsTabProps {
  onSelectRequest: (request: ApiRequest) => void;
}

export default function CollectionsTab({ onSelectRequest }: CollectionsTabProps) {
  const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isRenameCollectionModalVisible, setIsRenameCollectionModalVisible] = useState(false);
  const [editingCollectionKey, setEditingCollectionKey] = useState<string | null>(null);
  const [editingCollectionName, setEditingCollectionName] = useState('');
  const [isAddRequestModalVisible, setIsAddRequestModalVisible] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [selectedCollectionKey, setSelectedCollectionKey] = useState<string | null>(null);
  const [isRenameRequestModalVisible, setIsRenameRequestModalVisible] = useState(false);
  const [editingRequestKey, setEditingRequestKey] = useState<string | null>(null);
  const [editingRequestName, setEditingRequestName] = useState('');
  const [editingRequestCollectionKey, setEditingRequestCollectionKey] = useState<string | null>(null);
  const [newRequestMethod, setNewRequestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');

  const { collections, loading, addCollection, addRequest, renameNode, deleteNode } = useCollections();

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      addCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsAddCollectionModalVisible(false);
    }
  };

  const handleRenameCollection = () => {
    if (editingCollectionKey && editingCollectionName.trim()) {
      renameNode(editingCollectionKey, editingCollectionName.trim());
      setEditingCollectionKey(null);
      setEditingCollectionName('');
      setIsRenameCollectionModalVisible(false);
    }
  };

  const handleDeleteCollection = (collectionKey: string) => {
    deleteNode(collectionKey);
  };

  const handleAddRequest = () => {
    if (selectedCollectionKey && newRequestName.trim()) {
      const newRequest: Omit<ApiRequest, 'key'> = {
        title: newRequestName.trim(),
        name: newRequestName.trim(),
        method: newRequestMethod,
        url: '',
        params: {},
        headers: {},
        body: ''
      };
      addRequest(selectedCollectionKey, newRequest);
      setNewRequestName('');
      setSelectedCollectionKey(null);
      setIsAddRequestModalVisible(false);
    }
  };

  const handleRenameRequest = () => {
    if (editingRequestKey && editingRequestName.trim()) {
      renameNode(editingRequestKey, editingRequestName.trim());
      setEditingRequestKey(null);
      setEditingRequestName('');
      setEditingRequestCollectionKey(null);
      setIsRenameRequestModalVisible(false);
    }
  };

  const handleDeleteRequest = (requestKey: string) => {
    deleteNode(requestKey);
  };

  const getCollectionActions = (collectionKey: string) => [
    {
      key: 'rename',
      label: 'Rename',
      icon: <EditOutlined />,
      onClick: () => {
        const collection = collections.find(c => c.key === collectionKey);
        if (collection) {
          setEditingCollectionKey(collectionKey);
          setEditingCollectionName(collection.title);
          setIsRenameCollectionModalVisible(true);
        }
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: () => handleDeleteCollection(collectionKey)
    }
  ];

  const getRequestActions = (request: ApiRequest) => [
    {
      key: 'rename',
      label: 'Rename',
      icon: <EditOutlined />,
      onClick: () => {
        setEditingRequestKey(request.key);
        setEditingRequestName(request.title);
        setEditingRequestCollectionKey(request.collectionKey || null);
        setIsRenameRequestModalVisible(true);
      }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      onClick: () => handleDeleteRequest(request.key)
    }
  ];

  if (loading) {
    return <div>Loading collections...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Collections</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsAddCollectionModalVisible(true)}
        >
          New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          <Text>No collections yet. Create your first collection to organize your requests.</Text>
        </div>
      ) : (
        <List
          dataSource={collections}
          renderItem={(collection) => (
            <List.Item
              key={collection.key}
              style={{ 
                border: '1px solid #f0f0f0', 
                borderRadius: 6, 
                marginBottom: 8,
                padding: '12px 16px',
                backgroundColor: '#fafafa'
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <FolderOutlined />
                    <Text strong>{collection.title}</Text>
                    <Text type="secondary">({collection.requests.length} requests)</Text>
                  </Space>
                  <Dropdown
                    menu={{ items: getCollectionActions(collection.key) }}
                    trigger={['click']}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
                
                {collection.requests.length > 0 && (
                  <div>
                    {collection.requests.map((request) => (
                      <div
                        key={request.key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          margin: '4px 0',
                          backgroundColor: '#fff',
                          border: '1px solid #e8e8e8',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                        onClick={() => onSelectRequest(request)}
                      >
                        <Space>
                          <FileTextOutlined />
                          <Text>{request.title}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {request.method}
                          </Text>
                        </Space>
                        <Dropdown
                          menu={{ items: getRequestActions(request) }}
                          trigger={['click']}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button type="text" size="small" icon={<MoreOutlined />} />
                        </Dropdown>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedCollectionKey(collection.key);
                        setIsAddRequestModalVisible(true);
                      }}
                      style={{ width: '100%', marginTop: 8 }}
                    >
                      Add Request
                    </Button>
                  </div>
                )}
              </div>
            </List.Item>
          )}
        />
      )}

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

      {/* Rename Collection Modal */}
      <Modal
        title="Rename Collection"
        open={isRenameCollectionModalVisible}
        onOk={handleRenameCollection}
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
              onPressEnter={handleRenameCollection}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Request Modal */}
      <Modal
        title="Add New Request"
        open={isAddRequestModalVisible}
        onOk={handleAddRequest}
        onCancel={() => {
          setIsAddRequestModalVisible(false);
          setNewRequestName('');
          setSelectedCollectionKey(null);
        }}
      >
        <Form>
          <Form.Item label="Request Name">
            <Input
              value={newRequestName}
              onChange={(e) => setNewRequestName(e.target.value)}
              placeholder="Enter request name"
              onPressEnter={handleAddRequest}
            />
          </Form.Item>
          <Form.Item label="HTTP Method">
            <Select
              value={newRequestMethod}
              onChange={setNewRequestMethod}
              style={{ width: '100%' }}
            >
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Rename Request Modal */}
      <Modal
        title="Rename Request"
        open={isRenameRequestModalVisible}
        onOk={handleRenameRequest}
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
              onPressEnter={handleRenameRequest}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
