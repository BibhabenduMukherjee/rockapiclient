import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Table, 
  Space, 
  Typography, 
  Tag, 
  Modal, 
  message, 
  Tabs, 
  Divider,
  Row,
  Col,
  List,
  Badge,
  Tooltip,
  Upload,
  Collapse
} from 'antd';
import CustomButton from './CustomButton';
import { 
  PlusOutlined, 
  StopOutlined, 
  DeleteOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  CodeOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Array templates for different use cases
const arrayTemplates = {
  'products': {
    name: 'Product List',
    description: 'E-commerce products',
    template: [
      {
        "id": 1,
        "name": "Wireless Headphones",
        "price": 99.99,
        "category": "Electronics",
        "inStock": true,
        "rating": 4.5,
        "image": "https://example.com/headphones.jpg"
      },
      {
        "id": 2,
        "name": "Smart Watch",
        "price": 199.99,
        "category": "Electronics",
        "inStock": true,
        "rating": 4.8,
        "image": "https://example.com/watch.jpg"
      }
    ]
  },
  'users': {
    name: 'User List',
    description: 'User management',
    template: [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "active": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "avatar": "https://example.com/avatar1.jpg"
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "user",
        "active": true,
        "createdAt": "2024-01-16T14:20:00Z",
        "avatar": "https://example.com/avatar2.jpg"
      }
    ]
  },
  'posts': {
    name: 'Blog Posts',
    description: 'Blog posts with content',
    template: [
      {
        "id": 1,
        "title": "Getting Started with API Development",
        "content": "Learn the basics of building RESTful APIs...",
        "author": "John Doe",
        "publishedAt": "2024-01-15T09:00:00Z",
        "tags": ["API", "Development", "Tutorial"],
        "views": 1250,
        "likes": 45
      },
      {
        "id": 2,
        "title": "Advanced JavaScript Patterns",
        "content": "Explore modern JavaScript design patterns...",
        "author": "Jane Smith",
        "publishedAt": "2024-01-16T11:30:00Z",
        "tags": ["JavaScript", "Patterns", "Advanced"],
        "views": 890,
        "likes": 32
      }
    ]
  },
  'orders': {
    name: 'Order List',
    description: 'E-commerce orders',
    template: [
      {
        "id": "ORD-001",
        "customerId": 1,
        "customerName": "John Doe",
        "items": [
          {"productId": 1, "quantity": 2, "price": 99.99},
          {"productId": 2, "quantity": 1, "price": 199.99}
        ],
        "total": 399.97,
        "status": "shipped",
        "orderDate": "2024-01-15T10:30:00Z",
        "shippingAddress": "123 Main St, City, State"
      }
    ]
  },
  'notifications': {
    name: 'Notifications',
    description: 'User notifications',
    template: [
      {
        "id": 1,
        "type": "info",
        "title": "Welcome to our platform!",
        "message": "Thank you for signing up. Get started by exploring our features.",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "userId": 1
      },
      {
        "id": 2,
        "type": "warning",
        "title": "Account verification needed",
        "message": "Please verify your email address to continue.",
        "read": true,
        "createdAt": "2024-01-14T15:20:00Z",
        "userId": 1
      }
    ]
  },
  'simple': {
    name: 'Simple Array',
    description: 'Basic array with minimal data',
    template: [
      {"id": 1, "name": "Item 1", "active": true},
      {"id": 2, "name": "Item 2", "active": false},
      {"id": 3, "name": "Item 3", "active": true}
    ]
  }
};

interface Route {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  response: any;
}

interface WebSocketHandler {
  id: string;
  type: string;
  response: any;
}

interface ServerConfig {
  id: string;
  name: string;
  type: 'http' | 'websocket';
  port: number;
  routes?: Route[];
  messageHandlers?: WebSocketHandler[];
}

interface RunningServer {
  port: number;
  type: string;
  config: ServerConfig;
  startTime: string;
  running: boolean;
}

const MockServerManager: React.FC = () => {
  const [servers, setServers] = useState<RunningServer[]>([]);
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isLogsModalVisible, setIsLogsModalVisible] = useState(false);
  const [selectedServerPort, setSelectedServerPort] = useState<number | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [form] = Form.useForm();

  // Load servers on component mount
  useEffect(() => {
    loadServers();
    loadSavedConfigs();
  }, []);

  const loadServers = async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.getAllServers) {
        console.warn('Electron API not available');
        return;
      }
      const result = await window.electronAPI.getAllServers();
      setServers(result);
    } catch (error) {
      console.error('Error loading servers:', error);
    }
  };

  const loadSavedConfigs = async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.getSavedServerConfigs) {
        console.warn('Electron API not available');
        return;
      }
      const result = await window.electronAPI.getSavedServerConfigs();
      setSavedConfigs(Object.values(result));
    } catch (error) {
      console.error('Error loading saved configs:', error);
    }
  };

  const getAllServers = () => {
    // Combine running servers and saved configurations
    const allServers = [...servers];
    
    // Add saved configurations that are not currently running
    savedConfigs.forEach(config => {
      const isRunning = servers.some(server => server.port === config.port);
      if (!isRunning) {
        allServers.push({
          port: config.port,
          type: config.type,
          config: config,
          startTime: config.savedAt || new Date().toISOString(),
          running: false
        });
      }
    });
    
    return allServers;
  };

  const handleCreateServer = async (values: any) => {
    try {
      if (!window.electronAPI) {
        message.error('Electron API not available');
        return;
      }

      const config: ServerConfig = {
        id: Date.now().toString(),
        name: values.name,
        type: values.type,
        port: values.port,
        routes: values.routes || [],
        messageHandlers: values.messageHandlers || []
      };

      let result;
      if (values.type === 'http') {
        result = await window.electronAPI.createHttpServer(config);
      } else {
        result = await window.electronAPI.createWebSocketServer(config);
      }

      if (result.success) {
        // Save server configuration
        try {
          await window.electronAPI.saveServerConfig(config);
        } catch (error) {
          console.warn('Failed to save server configuration:', error);
        }
        
        message.success(`Server created successfully on port ${result.port}`);
        setIsCreateModalVisible(false);
        form.resetFields();
        loadServers();
        loadSavedConfigs();
        
        // Dispatch event to update sidebar count
        window.dispatchEvent(new CustomEvent('server-changed'));
      }
    } catch (error: any) {
      message.error(`Failed to create server: ${error.message}`);
    }
  };

  const handleStopServer = async (port: number) => {
    try {
      if (!window.electronAPI) {
        message.error('Electron API not available');
        return;
      }
      const result = await window.electronAPI.stopServer(port);
      if (result.success) {
        message.success(`Server stopped on port ${port}`);
        loadServers();
        loadSavedConfigs();
        
        // Dispatch event to update sidebar count
        window.dispatchEvent(new CustomEvent('server-changed'));
      }
    } catch (error: any) {
      message.error(`Failed to stop server: ${error.message}`);
    }
  };

  const handleStartServer = async (config: ServerConfig) => {
    try {
      if (!window.electronAPI) {
        message.error('Electron API not available');
        return;
      }

      let result;
      if (config.type === 'http') {
        result = await window.electronAPI.createHttpServer(config);
      } else {
        result = await window.electronAPI.createWebSocketServer(config);
      }

      if (result.success) {
        message.success(`Server started successfully on port ${result.port}`);
        loadServers();
        loadSavedConfigs();
        
        // Dispatch event to update sidebar count
        window.dispatchEvent(new CustomEvent('server-changed'));
      }
    } catch (error: any) {
      message.error(`Failed to start server: ${error.message}`);
    }
  };

  const handleDeleteServer = async (port: number) => {
    try {
      if (!window.electronAPI) {
        message.error('Electron API not available');
        return;
      }
      const result = await window.electronAPI.deleteServerConfig(port);
      if (result.success) {
        message.success(`Server configuration deleted for port ${port}`);
        loadServers();
        loadSavedConfigs();
        
        // Dispatch event to update sidebar count
        window.dispatchEvent(new CustomEvent('server-changed'));
      }
    } catch (error: any) {
      message.error(`Failed to delete server: ${error.message}`);
    }
  };

  const handleViewLogs = async (port: number) => {
    try {
      if (!window.electronAPI) {
        message.error('Electron API not available');
        return;
      }
      const serverLogs = await window.electronAPI.getServerLogs(port);
      setLogs(serverLogs);
      setSelectedServerPort(port);
      setIsLogsModalVisible(true);
    } catch (error) {
      message.error('Failed to load logs');
    }
  };

  const serverColumns = [
    {
      title: 'Name',
      dataIndex: 'config',
      key: 'name',
      render: (config: ServerConfig) => config?.name || 'Unknown',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'http' ? 'blue' : 'green'}>
          {type === 'http' ? <ApiOutlined /> : <ThunderboltOutlined />}
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      render: (port: number) => <Text code>{port}</Text>,
    },
    {
      title: 'URL',
      key: 'url',
      render: (record: RunningServer) => (
        <Text code>
          {record.type === 'http' ? 'http' : 'ws'}://localhost:{record.port}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'running',
      key: 'status',
      render: (running: boolean) => (
        <Badge 
          status={running ? 'success' : 'error'} 
          text={running ? 'Running' : 'Stopped'} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: RunningServer) => (
        <Space>
          {record.running ? (
            <>
              <Tooltip title="View Logs">
                <CustomButton
                  variant="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewLogs(record.port)}
                />
              </Tooltip>
              <Tooltip title="Stop Server">
                <CustomButton
                  variant="danger"
                  size="small"
                  icon={<StopOutlined />}
                  onClick={() => handleStopServer(record.port)}
                />
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip title="Start Server">
                <CustomButton
                  variant="success"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStartServer(record.config)}
                >
                  Start
                </CustomButton>
              </Tooltip>
              <Tooltip title="Delete Configuration">
                <CustomButton
                  variant="danger"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteServer(record.port)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>Mock Server Manager</Title>
            <Text type="secondary">Create and manage local HTTP and WebSocket servers</Text>
          </div>
          <CustomButton
            variant="primary"
            size="medium"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
            title="Create a new mock server"
          >
            Create Server
          </CustomButton>
        </div>

        <Table<RunningServer>
          columns={serverColumns}
          dataSource={getAllServers()}
          rowKey="port"
          pagination={false}
          locale={{ emptyText: 'No servers found' }}
        />
      </Card>

      {/* Create Server Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ApiOutlined style={{ color: '#1890ff' }} />
            <span>Create Mock Server</span>
          </div>
        }
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        width={900}
        footer={null}
        destroyOnClose
        style={{ top: 20 }}
      >
        <ServerCreationForm 
          form={form}
          onSubmit={handleCreateServer}
          onCancel={() => setIsCreateModalVisible(false)}
        />
      </Modal>

      {/* Logs Modal */}
      <Modal
        title={`Server Logs - Port ${selectedServerPort}`}
        open={isLogsModalVisible}
        onCancel={() => setIsLogsModalVisible(false)}
        width={800}
        footer={null}
      >
        <ServerLogsViewer logs={logs} />
      </Modal>
    </div>
  );
};

// Server Creation Form Component
const ServerCreationForm: React.FC<{
  form: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}> = ({ form, onSubmit, onCancel }) => {
  const [serverType, setServerType] = useState<'http' | 'websocket'>('http');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [messageHandlers, setMessageHandlers] = useState<WebSocketHandler[]>([]);
  const [routeTextValues, setRouteTextValues] = useState<Record<string, string>>({});
  const [handlerTextValues, setHandlerTextValues] = useState<Record<string, string>>({});
  const [showExamples, setShowExamples] = useState(false);

  const addRoute = () => {
    const routeId = Date.now().toString();
    const newRoute: Route = {
      id: routeId,
      method: 'GET',
      path: '/api/endpoint',
      statusCode: 200,
      response: { message: 'Hello World' }
    };
    setRoutes([...routes, newRoute]);
    // Initialize text value for this route
    setRouteTextValues(prev => ({
      ...prev,
      [routeId]: JSON.stringify(newRoute.response, null, 2)
    }));
  };

  const updateRoute = (id: string, field: keyof Route, value: any) => {
    setRoutes(routes.map(route => 
      route.id === id ? { ...route, [field]: value } : route
    ));
    
    // If updating response field, also update text value
    if (field === 'response') {
      setRouteTextValues(prev => ({
        ...prev,
        [id]: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
      }));
    }
  };

  const removeRoute = (id: string) => {
    setRoutes(routes.filter(route => route.id !== id));
    // Clean up text value
    setRouteTextValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const addMessageHandler = () => {
    const handlerId = Date.now().toString();
    const newHandler: WebSocketHandler = {
      id: handlerId,
      type: 'message',
      response: { echo: 'Message received' }
    };
    setMessageHandlers([...messageHandlers, newHandler]);
    // Initialize text value for this handler
    setHandlerTextValues(prev => ({
      ...prev,
      [handlerId]: JSON.stringify(newHandler.response, null, 2)
    }));
  };

  const updateMessageHandler = (id: string, field: keyof WebSocketHandler, value: any) => {
    setMessageHandlers(messageHandlers.map(handler => 
      handler.id === id ? { ...handler, [field]: value } : handler
    ));
    
    // If updating response field, also update text value
    if (field === 'response') {
      setHandlerTextValues(prev => ({
        ...prev,
        [id]: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
      }));
    }
  };

  const removeMessageHandler = (id: string) => {
    setMessageHandlers(messageHandlers.filter(handler => handler.id !== id));
    // Clean up text value
    setHandlerTextValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      onSubmit({
        ...values,
        routes,
        messageHandlers
      });
    }).catch((errorInfo: any) => {
      console.error('Form validation failed:', errorInfo);
      message.error('Please fix the form errors before submitting');
    });
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
            Server Configuration
          </Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Server Name"
                name="name"
                rules={[{ required: true, message: 'Please enter server name' }]}
              >
                <Input placeholder="My Mock Server" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Port"
                name="port"
                rules={[
                  { required: true, message: 'Please enter port' },
                  { type: 'number', min: 1000, max: 65535, message: 'Port must be between 1000-65535' }
                ]}
              >
                <InputNumber 
                  style={{ 
                    width: '100%',
                    background: 'var(--theme-background)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }} 
                  placeholder="3000"
                  className="theme-input-number"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select server type' }]}
              >
                <Select onChange={setServerType} defaultValue="http">
                  <Option value="http">
                    <ApiOutlined /> HTTP Server
                  </Option>
                  <Option value="websocket">
                    <ThunderboltOutlined /> WebSocket Server
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {serverType === 'http' && (
          <>
            {/* API Routes Header with Add Button Outside */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px',
              padding: '0 4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Title level={5} style={{ margin: 0, color: 'var(--theme-primary)' }}>
                  <ApiOutlined style={{ marginRight: '8px', color: 'var(--theme-primary)' }} />
                  API Routes
                </Title>
                <Tag 
                  color="blue"
                  style={{ 
                    background: 'var(--theme-primary)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  {routes.length} routes
                </Tag>
              </div>
              <Space>
                <Button 
                  type="text" 
                  size="small"
                  icon={<QuestionCircleOutlined />}
                  onClick={() => setShowExamples(!showExamples)}
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  {showExamples ? 'Hide Examples' : 'View Examples'}
                </Button>
                <CustomButton 
                  variant="primary"
                  size="small"
                  onClick={addRoute} 
                  icon={<PlusOutlined />}
                >
                  Add Route
                </CustomButton>
              </Space>
            </div>

            {/* JSON Examples (Conditionally Rendered) */}
            {showExamples && (
              <div style={{ 
                background: 'var(--theme-surface)', 
                border: '1px solid var(--theme-border)', 
                borderRadius: '6px', 
                padding: '16px', 
                marginBottom: '16px'
              }}>
              <Text strong style={{ color: 'var(--theme-primary)', display: 'block', marginBottom: '12px' }}>
                💡 JSON Response Examples:
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <Text strong style={{ color: 'var(--theme-text)' }}>Simple Object:</Text>
                  <pre style={{ 
                    margin: '8px 0', 
                    fontSize: '11px', 
                    color: 'var(--theme-text)',
                    background: 'var(--theme-background)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--theme-border)'
                  }}>
{`{
  "message": "Hello World",
  "status": "success"
}`}
                  </pre>
                </div>
                <div>
                  <Text strong style={{ color: 'var(--theme-text)' }}>Array of Objects:</Text>
                  <pre style={{ 
                    margin: '8px 0', 
                    fontSize: '11px', 
                    color: 'var(--theme-text)',
                    background: 'var(--theme-background)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--theme-border)'
                  }}>
{`[
  {"id": 1, "name": "John"},
  {"id": 2, "name": "Jane"}
]`}
                  </pre>
                </div>
                <div>
                  <Text strong style={{ color: 'var(--theme-text)' }}>Nested Object:</Text>
                  <pre style={{ 
                    margin: '8px 0', 
                    fontSize: '11px', 
                    color: 'var(--theme-text)',
                    background: 'var(--theme-background)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--theme-border)'
                  }}>
{`{
  "user": {
    "id": 1,
    "profile": {
      "name": "John",
      "email": "john@example.com"
    }
  }
}`}
                  </pre>
                </div>
                <div>
                  <Text strong style={{ color: 'var(--theme-text)' }}>Array with Mixed Data:</Text>
                  <pre style={{ 
                    margin: '8px 0', 
                    fontSize: '11px', 
                    color: 'var(--theme-text)',
                    background: 'var(--theme-background)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--theme-border)'
                  }}>
{`{
  "items": [
    {"type": "product", "name": "Laptop"},
    {"type": "service", "name": "Support"}
  ],
  "total": 2
}`}
                  </pre>
                </div>
              </div>
              </div>
            )}
            
            {/* Routes Container */}
            <Card 
              size="small" 
              style={{ 
                marginBottom: '16px',
                background: 'var(--theme-background)',
                border: '1px solid var(--theme-border)'
              }}
            >
              {routes.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: 'var(--theme-text-secondary)'
                }}>
                  <ApiOutlined style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--theme-text-secondary)' }} />
                  <div>
                    <Text style={{ color: 'var(--theme-text-secondary)' }}>No routes configured yet</Text>
                    <br />
                    <Text style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>
                      Click "Add Route" to create your first API endpoint
                    </Text>
                  </div>
                </div>
              ) : (
                routes.map((route, index) => (
                  <div 
                    key={route.id} 
                    style={{ 
                      border: '1px solid var(--theme-border)',
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      background: 'var(--theme-surface)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--theme-primary)';
                      e.currentTarget.style.background = 'var(--theme-background)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--theme-border)';
                      e.currentTarget.style.background = 'var(--theme-surface)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Route Header */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid var(--theme-border)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Tag 
                          color={
                            route.method === 'GET' ? 'green' :
                            route.method === 'POST' ? 'blue' :
                            route.method === 'PUT' ? 'orange' :
                            route.method === 'DELETE' ? 'red' : 'purple'
                          }
                          style={{ 
                            fontWeight: 'bold',
                            border: 'none'
                          }}
                        >
                          {route.method}
                        </Tag>
                        <Text strong style={{ fontSize: '14px', color: 'var(--theme-text)' }}>
                          {route.path || '/api/endpoint'}
                        </Text>
                        <Tag 
                          color="default"
                          style={{ 
                            background: 'var(--theme-surface)',
                            color: 'var(--theme-text)',
                            border: '1px solid var(--theme-border)'
                          }}
                        >
                          Status: {route.statusCode}
                        </Tag>
                      </div>
                      <Button 
                        size="small"
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => removeRoute(route.id)}
                        title="Delete route"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      />
                    </div>

                    {/* Route Configuration */}
                    <Row gutter={[16, 16]}>
                      <Col span={6}>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--theme-text-secondary)' }}>
                            Request Method
                          </Text>
                          <Select
                            value={route.method}
                            onChange={(value) => updateRoute(route.id, 'method', value)}
                            style={{ width: '100%' }}
                          >
                            <Option value="GET">
                              <Tag color="green" style={{ marginRight: '8px' }}>GET</Tag>
                              Retrieve data
                            </Option>
                            <Option value="POST">
                              <Tag color="blue" style={{ marginRight: '8px' }}>POST</Tag>
                              Create data
                            </Option>
                            <Option value="PUT">
                              <Tag color="orange" style={{ marginRight: '8px' }}>PUT</Tag>
                              Update data
                            </Option>
                            <Option value="DELETE">
                              <Tag color="red" style={{ marginRight: '8px' }}>DELETE</Tag>
                              Remove data
                            </Option>
                            <Option value="PATCH">
                              <Tag color="purple" style={{ marginRight: '8px' }}>PATCH</Tag>
                              Partial update
                            </Option>
                          </Select>
                        </div>
                      </Col>
                      <Col span={9}>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--theme-text-secondary)' }}>
                            Endpoint Path
                          </Text>
                          <Input
                            value={route.path}
                            onChange={(e) => updateRoute(route.id, 'path', e.target.value)}
                            placeholder="/api/endpoint"
                            prefix={<CodeOutlined style={{ color: 'var(--theme-text-secondary)' }} />}
                            style={{ background: 'var(--theme-background)', border: '1px solid var(--theme-border)' }}
                          />
                        </div>
                      </Col>
                      <Col span={9}>
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--theme-text-secondary)' }}>
                            Status Code
                          </Text>
                          <Select
                            value={route.statusCode}
                            onChange={(value) => updateRoute(route.id, 'statusCode', value)}
                            style={{ width: '100%' }}
                          >
                            <Option value={200}>200 - OK</Option>
                            <Option value={201}>201 - Created</Option>
                            <Option value={400}>400 - Bad Request</Option>
                            <Option value={401}>401 - Unauthorized</Option>
                            <Option value={403}>403 - Forbidden</Option>
                            <Option value={404}>404 - Not Found</Option>
                            <Option value={500}>500 - Internal Server Error</Option>
                          </Select>
                        </div>
                      </Col>
                    </Row>

                    {/* Response Body Section */}
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <Text strong style={{ fontSize: '12px', color: 'var(--theme-text-secondary)' }}>
                          <FileTextOutlined style={{ marginRight: '6px', color: 'var(--theme-text-secondary)' }} />
                          Response Body (JSON)
                        </Text>
                        <Space size="small">
                          <Upload
                            accept=".json"
                            showUploadList={false}
                            beforeUpload={(file) => {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                try {
                                  const content = e.target?.result as string;
                                  const parsed = JSON.parse(content);
                                  updateRoute(route.id, 'response', parsed);
                                  setRouteTextValues(prev => ({
                                    ...prev,
                                    [route.id]: JSON.stringify(parsed, null, 2)
                                  }));
                                  message.success('JSON file loaded successfully');
                                } catch (error: any) {
                                  message.error('Invalid JSON file: ' + error.message);
                                }
                              };
                              reader.readAsText(file);
                              return false;
                            }}
                          >
                            <Tooltip title="Upload JSON file">
                              <Button 
                                size="small" 
                                icon={<UploadOutlined />}
                                type="text"
                              />
                            </Tooltip>
                          </Upload>
                          <Select
                            placeholder="Templates"
                            size="small"
                            style={{ width: 180 }}
                            popupClassName="template-dropdown"
                            onSelect={(templateKey) => {
                              const template = arrayTemplates[templateKey as keyof typeof arrayTemplates];
                              if (template) {
                                updateRoute(route.id, 'response', template.template);
                                setRouteTextValues(prev => ({
                                  ...prev,
                                  [route.id]: JSON.stringify(template.template, null, 2)
                                }));
                                message.success(`${template.name} template inserted`);
                              }
                            }}
                          >
                            {Object.entries(arrayTemplates).map(([key, template]) => (
                              <Option key={key} value={key}>
                                <div style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'flex-start',
                                  maxWidth: '280px',
                                  overflow: 'hidden'
                                }}>
                                  <Text strong style={{ 
                                    color: 'var(--theme-text)',
                                    fontSize: '9px',
                                    lineHeight: '1.0'
                                  }}>
                                    {template.name}
                                  </Text>
                                  <Text style={{ 
                                    fontSize: '6px', 
                                    color: 'var(--theme-text-secondary)',
                                    lineHeight: '1.0',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '260px'
                                  }}>
                                    {template.description}
                                  </Text>
                                </div>
                              </Option>
                            ))}
                          </Select>
                        </Space>
                      </div>
                      <TextArea
                        value={routeTextValues[route.id] || JSON.stringify(route.response, null, 2)}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          setRouteTextValues(prev => ({
                            ...prev,
                            [route.id]: newValue
                          }));
                        }}
                        onBlur={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            updateRoute(route.id, 'response', parsed);
                          } catch (error: any) {
                            console.warn('Invalid JSON in response field:', error.message);
                            message.warning('Invalid JSON format. Please check your syntax.');
                          }
                        }}
                        placeholder='{"message": "Hello World", "status": "success"}'
                        rows={4}
                        style={{ 
                          fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, SF Mono, Monaco, Inconsolata, Roboto Mono, Source Code Pro, monospace',
                          fontSize: '12px',
                          lineHeight: '1.4',
                          background: 'var(--theme-background)',
                          border: '1px solid var(--theme-border)',
                          color: 'var(--theme-text)'
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </Card>
          </>
        )}

        {serverType === 'websocket' && (
          <Card size="small" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0, color: '#722ed1' }}>
                <ThunderboltOutlined style={{ marginRight: '8px' }} />
                Message Handlers
              </Title>
              <Button 
                type="primary" 
                size="small"
                onClick={addMessageHandler} 
                icon={<PlusOutlined />}
              >
                Add Handler
              </Button>
            </div>
            {messageHandlers.map((handler, index) => (
            <Card key={handler.id} size="small" style={{ marginBottom: '8px' }}>
              <Row gutter={8}>
                <Col span={6}>
                  <Input
                    value={handler.type}
                    onChange={(e) => updateMessageHandler(handler.id, 'type', e.target.value)}
                    placeholder="message"
                  />
                </Col>
                <Col span={15}>
                  <TextArea
                    value={handlerTextValues[handler.id] || JSON.stringify(handler.response, null, 2)}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Update the text value state
                      setHandlerTextValues(prev => ({
                        ...prev,
                        [handler.id]: newValue
                      }));
                    }}
                    onBlur={(e) => {
                      // Only parse JSON when user finishes editing (onBlur)
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateMessageHandler(handler.id, 'response', parsed);
                      } catch (error: any) {
                        // If JSON is invalid, keep the text as is but show a warning
                        console.warn('Invalid JSON in handler response field:', error.message);
                        message.warning('Invalid JSON format. Please check your syntax.');
                      }
                    }}
                    placeholder='{"echo": "Message received"}'
                    rows={2}
                    style={{ fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, SF Mono, Monaco, Inconsolata, Roboto Mono, Source Code Pro, monospace' }}
                  />
                </Col>
                <Col span={3}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Button 
                      size="small"
                      danger 
                      icon={<DeleteOutlined />}
                      onClick={() => removeMessageHandler(handler.id)}
                      title="Delete handler"
                      style={{ width: '100%' }}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
            ))}
          </Card>
        )}

        <div style={{ 
          textAlign: 'right', 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid #f0f0f0' 
        }}>
          <Space size="middle">
            <Button onClick={onCancel} size="large">
              Cancel
            </Button>
            <CustomButton 
              variant="primary" 
              htmlType="submit" 
              size="large"
              style={{ minWidth: '120px' }}
            >
              Create Server
            </CustomButton>
          </Space>
        </div>
      </Form>
    </div>
  );
};

// Add CSS styling for InputNumber dark theme and template dropdown
const inputNumberStyles = `
  .theme-input-number .ant-input-number-input {
    background: var(--theme-background) !important;
    border: 1px solid var(--theme-border) !important;
    color: var(--theme-text) !important;
  }
  
  .theme-input-number .ant-input-number-handler-wrap {
    background: var(--theme-surface) !important;
    border-left: 1px solid var(--theme-border) !important;
  }
  
  .theme-input-number .ant-input-number-handler {
    background: var(--theme-surface) !important;
    border-color: var(--theme-border) !important;
    color: var(--theme-text) !important;
  }
  
  .theme-input-number .ant-input-number-handler:hover {
    background: var(--theme-background) !important;
    color: var(--theme-primary) !important;
  }
  
  .theme-input-number .ant-input-number-handler-up {
    border-bottom: 1px solid var(--theme-border) !important;
  }
  
  .theme-input-number .ant-input-number-handler-down {
    border-top: 1px solid var(--theme-border) !important;
  }
  
  .template-dropdown {
    background: var(--theme-background) !important;
    border: 1px solid var(--theme-border) !important;
    max-width: 300px !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = inputNumberStyles;
  document.head.appendChild(styleSheet);
}

// Server Logs Viewer Component
const ServerLogsViewer: React.FC<{ logs: any[] }> = ({ logs }) => {
  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <List
        dataSource={logs}
        renderItem={(log) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag color={log.type === 'request' ? 'blue' : log.type === 'response' ? 'green' : 'default'}>
                  {log.type?.toUpperCase()}
                </Tag>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </Text>
              </div>
              <div style={{ marginTop: '8px' }}>
                <Text>{log.message || `${log.method} ${log.path} - ${log.statusCode}`}</Text>
              </div>
            </div>
          </List.Item>
        )}
        locale={{ emptyText: 'No logs available' }}
      />
    </div>
  );
};

export default MockServerManager;
