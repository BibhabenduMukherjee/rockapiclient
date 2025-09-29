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
  Upload
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
  PlayCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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
                  variant="ghost"
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
        title="Create Mock Server"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        width={800}
        footer={null}
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

  const addRoute = () => {
    const newRoute: Route = {
      id: Date.now().toString(),
      method: 'GET',
      path: '/api/endpoint',
      statusCode: 200,
      response: { message: 'Hello World' }
    };
    setRoutes([...routes, newRoute]);
  };

  const updateRoute = (id: string, field: keyof Route, value: any) => {
    setRoutes(routes.map(route => 
      route.id === id ? { ...route, [field]: value } : route
    ));
  };

  const removeRoute = (id: string) => {
    setRoutes(routes.filter(route => route.id !== id));
  };

  const addMessageHandler = () => {
    const newHandler: WebSocketHandler = {
      id: Date.now().toString(),
      type: 'message',
      response: { echo: 'Message received' }
    };
    setMessageHandlers([...messageHandlers, newHandler]);
  };

  const updateMessageHandler = (id: string, field: keyof WebSocketHandler, value: any) => {
    setMessageHandlers(messageHandlers.map(handler => 
      handler.id === id ? { ...handler, [field]: value } : handler
    ));
  };

  const removeMessageHandler = (id: string) => {
    setMessageHandlers(messageHandlers.filter(handler => handler.id !== id));
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
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            <InputNumber style={{ width: '100%' }} placeholder="3000" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: 'Please select server type' }]}
          >
            <Select onChange={setServerType}>
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

      {serverType === 'http' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={5} style={{ margin: 0 }}>API Routes</Title>
            <CustomButton variant="ghost" onClick={addRoute} icon={<PlusOutlined />}>
              Add Route
            </CustomButton>
          </div>
          {routes.map((route, index) => (
            <Card key={route.id} size="small" style={{ marginBottom: '8px' }}>
              <Row gutter={8}>
                <Col span={4}>
                  <Select
                    value={route.method}
                    onChange={(value) => updateRoute(route.id, 'method', value)}
                    style={{ width: '100%' }}
                  >
                    <Option value="GET">GET</Option>
                    <Option value="POST">POST</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="DELETE">DELETE</Option>
                    <Option value="PATCH">PATCH</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Input
                    value={route.path}
                    onChange={(e) => updateRoute(route.id, 'path', e.target.value)}
                    placeholder="/api/endpoint"
                  />
                </Col>
                <Col span={3}>
                  <InputNumber
                    value={route.statusCode}
                    onChange={(value) => updateRoute(route.id, 'statusCode', value)}
                    placeholder="200"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={7}>
                  <TextArea
                    value={JSON.stringify(route.response, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateRoute(route.id, 'response', parsed);
                      } catch (error: any) {
                        // Keep the current value if JSON is invalid
                        console.warn('Invalid JSON in response field:', error.message);
                      }
                    }}
                    placeholder='{"message": "Hello World"}'
                    rows={2}
                  />
                </Col>
                <Col span={1}>
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
                          message.success('JSON file loaded successfully');
                        } catch (error: any) {
                          message.error('Invalid JSON file: ' + error.message);
                        }
                      };
                      reader.readAsText(file);
                      return false; // Prevent upload
                    }}
                  >
                    <Button 
                      size="small" 
                      icon={<UploadOutlined />}
                      title="Upload JSON file"
                    />
                  </Upload>
                </Col>
                <Col span={3}>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => removeRoute(route.id)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      )}

      {serverType === 'websocket' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Title level={5} style={{ margin: 0 }}>Message Handlers</Title>
            <CustomButton variant="ghost" onClick={addMessageHandler} icon={<PlusOutlined />}>
              Add Handler
            </CustomButton>
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
                    value={JSON.stringify(handler.response, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateMessageHandler(handler.id, 'response', parsed);
                      } catch (error: any) {
                        // Keep the current value if JSON is invalid
                        console.warn('Invalid JSON in handler response field:', error.message);
                      }
                    }}
                    placeholder='{"echo": "Message received"}'
                    rows={2}
                  />
                </Col>
                <Col span={3}>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => removeMessageHandler(handler.id)}
                  />
                </Col>
              </Row>
            </Card>
          ))}
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: '24px' }}>
        <Space>
          <CustomButton variant="secondary" onClick={onCancel}>
            Cancel
          </CustomButton>
          <CustomButton variant="primary" htmlType="submit">
            Create Server
          </CustomButton>
        </Space>
      </div>
    </Form>
  );
};

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
