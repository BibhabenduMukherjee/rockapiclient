import React, { useState } from 'react';
import { Layout, Input, Select, Button, Flex, Tabs, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCollections } from './hooks/useCollections';
import Sidebar from './components/Sidebar';
import { ApiRequest } from './types'

const { Content, Sider, Header } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

function App() {
  // State for the currently active request in the main panel
  const [method, setMethod] = useState<ApiRequest['method']>('GET');
  const [url, setUrl] = useState('');
  
  // The custom hook provides all data and functions for managing collections
  const { collections, loading, addCollection, addRequest, renameNode, deleteNode } = useCollections();

  // State for the "Add Collection" modal, which is simple enough to keep in App.tsx
  const [isAddCollectionModalVisible, setIsAddCollectionModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleAddCollectionOk = () => {
    if (newCollectionName) {
      addCollection(newCollectionName);
      setNewCollectionName('');
      setIsAddCollectionModalVisible(false);
    }
  };
  
  // This function is called when a request is clicked in the sidebar
  const handleRequestSelect = (request: ApiRequest) => {
    setMethod(request.method);
    setUrl(request.url);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', background: '#2a2f4a' }}>Rock API Client</Header>
      <Layout>
        <Sider width={280} className="cool-sidebar">
          <Flex justify="space-between" align="center" className="cool-sidebar-header">
            <span>Collections</span>
            <Button icon={<PlusOutlined />} onClick={() => setIsAddCollectionModalVisible(true)} size="small" title="Add New Collection" type="primary" ghost />
          </Flex>
          <Sidebar
            collections={collections}
            loading={loading}
            onSelectRequest={handleRequestSelect}
            onAddRequest={addRequest}
            onRenameNode={renameNode}
            onDeleteNode={deleteNode}
          />
        </Sider>
        <Content style={{ padding: '24px', margin: 0, background: '#fff' }}>
          <Flex gap="small" align="center">
            <Select value={method} onChange={setMethod} style={{ width: 120 }}>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
            <Input placeholder="https://api.example.com/data" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Button type="primary">Send</Button>
          </Flex>
          <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
            <TabPane tab="Query Params" key="1">Query Params will go here.</TabPane>
            <TabPane tab="Authorization" key="2">Authorization options will go here.</TabPane>
            <TabPane tab="Headers" key="3">Request Headers.</TabPane>
            <TabPane tab="Body" key="4">Request Body (JSON, Form-Data, etc.).</TabPane>
          </Tabs>
          <div style={{ marginTop: 24, border: '1px solid #f0f0f0', padding: 16, borderRadius: 8, background: '#fafafa', minHeight: 200 }}>
            <h3>Response</h3>
          </div>
        </Content>
      </Layout>

      <Modal title="Create New Collection" open={isAddCollectionModalVisible} onOk={handleAddCollectionOk} onCancel={() => setIsAddCollectionModalVisible(false)} okText="Create">
        <Input placeholder="Enter collection name" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} onPressEnter={handleAddCollectionOk} />
      </Modal>
    </Layout>
  );
}

export default App;
