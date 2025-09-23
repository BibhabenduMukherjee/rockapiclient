import React, { useState } from 'react';
import { Modal, Button, List, Typography, Space, Tag, Card, Divider } from 'antd';
import { PlusOutlined, ApiOutlined, UserOutlined, ShoppingOutlined, MessageOutlined, CloudOutlined } from '@ant-design/icons';
import { ApiRequest } from '../types';

const { Text, Title } = Typography;

export interface RequestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  request: Partial<ApiRequest>;
  tags: string[];
}

interface RequestTemplatesProps {
  visible: boolean;
  onClose: () => void;
  onApplyTemplate: (template: RequestTemplate) => void;
}

const templates: RequestTemplate[] = [
  // REST API Templates
  {
    id: 'rest-get-user',
    name: 'Get User Profile',
    description: 'Retrieve user profile information',
    category: 'REST API',
    icon: <UserOutlined />,
    request: {
      method: 'GET',
      url: 'https://api.example.com/users/{{userId}}',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer {{token}}'
      }
    },
    tags: ['user', 'profile', 'get']
  },
  {
    id: 'rest-create-user',
    name: 'Create User',
    description: 'Create a new user account',
    category: 'REST API',
    icon: <UserOutlined />,
    request: {
      method: 'POST',
      url: 'https://api.example.com/users',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{token}}'
      },
      body: JSON.stringify({
        name: '{{userName}}',
        email: '{{userEmail}}',
        password: '{{userPassword}}'
      }, null, 2)
    },
    tags: ['user', 'create', 'post']
  },
  {
    id: 'rest-update-user',
    name: 'Update User',
    description: 'Update user information',
    category: 'REST API',
    icon: <UserOutlined />,
    request: {
      method: 'PUT',
      url: 'https://api.example.com/users/{{userId}}',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{token}}'
      },
      body: JSON.stringify({
        name: '{{userName}}',
        email: '{{userEmail}}'
      }, null, 2)
    },
    tags: ['user', 'update', 'put']
  },
  {
    id: 'rest-delete-user',
    name: 'Delete User',
    description: 'Delete a user account',
    category: 'REST API',
    icon: <UserOutlined />,
    request: {
      method: 'DELETE',
      url: 'https://api.example.com/users/{{userId}}',
      headers: {
        'Authorization': 'Bearer {{token}}'
      }
    },
    tags: ['user', 'delete']
  },

  // E-commerce Templates
  {
    id: 'ecommerce-get-products',
    name: 'Get Products',
    description: 'Retrieve product catalog',
    category: 'E-commerce',
    icon: <ShoppingOutlined />,
    request: {
      method: 'GET',
      url: 'https://api.shop.com/products',
      params: {
        page: '1',
        limit: '20',
        category: '{{category}}'
      },
      headers: {
        'Accept': 'application/json'
      }
    },
    tags: ['products', 'catalog', 'ecommerce']
  },
  {
    id: 'ecommerce-create-order',
    name: 'Create Order',
    description: 'Create a new order',
    category: 'E-commerce',
    icon: <ShoppingOutlined />,
    request: {
      method: 'POST',
      url: 'https://api.shop.com/orders',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{token}}'
      },
      body: JSON.stringify({
        items: [
          {
            productId: '{{productId}}',
            quantity: 1,
            price: '{{price}}'
          }
        ],
        shippingAddress: {
          street: '{{street}}',
          city: '{{city}}',
          zipCode: '{{zipCode}}'
        }
      }, null, 2)
    },
    tags: ['order', 'ecommerce', 'post']
  },

  // Social Media Templates
  {
    id: 'social-get-posts',
    name: 'Get Posts',
    description: 'Retrieve social media posts',
    category: 'Social Media',
    icon: <MessageOutlined />,
    request: {
      method: 'GET',
      url: 'https://api.social.com/posts',
      params: {
        user_id: '{{userId}}',
        limit: '10'
      },
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer {{token}}'
      }
    },
    tags: ['posts', 'social', 'feed']
  },
  {
    id: 'social-create-post',
    name: 'Create Post',
    description: 'Create a new social media post',
    category: 'Social Media',
    icon: <MessageOutlined />,
    request: {
      method: 'POST',
      url: 'https://api.social.com/posts',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{token}}'
      },
      body: JSON.stringify({
        content: '{{postContent}}',
        visibility: 'public',
        tags: ['{{tag1}}', '{{tag2}}']
      }, null, 2)
    },
    tags: ['posts', 'social', 'create']
  },

  // Cloud Services Templates
  {
    id: 'cloud-upload-file',
    name: 'Upload File',
    description: 'Upload file to cloud storage',
    category: 'Cloud Services',
    icon: <CloudOutlined />,
    request: {
      method: 'POST',
      url: 'https://api.cloud.com/files/upload',
      headers: {
        'Authorization': 'Bearer {{token}}',
        'X-File-Name': '{{fileName}}',
        'X-File-Type': '{{fileType}}'
      },
      body: '{{fileContent}}'
    },
    tags: ['upload', 'file', 'cloud']
  },
  {
    id: 'cloud-get-storage',
    name: 'Get Storage Info',
    description: 'Get cloud storage information',
    category: 'Cloud Services',
    icon: <CloudOutlined />,
    request: {
      method: 'GET',
      url: 'https://api.cloud.com/storage/info',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer {{token}}'
      }
    },
    tags: ['storage', 'info', 'cloud']
  },

  // Authentication Templates
  {
    id: 'auth-login',
    name: 'User Login',
    description: 'Authenticate user credentials',
    category: 'Authentication',
    icon: <ApiOutlined />,
    request: {
      method: 'POST',
      url: 'https://api.example.com/auth/login',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: '{{username}}',
        password: '{{password}}'
      }, null, 2)
    },
    tags: ['auth', 'login', 'credentials']
  },
  {
    id: 'auth-refresh-token',
    name: 'Refresh Token',
    description: 'Refresh authentication token',
    category: 'Authentication',
    icon: <ApiOutlined />,
    request: {
      method: 'POST',
      url: 'https://api.example.com/auth/refresh',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{refreshToken}}'
      }
    },
    tags: ['auth', 'refresh', 'token']
  }
];

export default function RequestTemplates({ visible, onClose, onApplyTemplate }: RequestTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <Modal
      title="Request Templates"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 50 }}
    >
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {categories.map(category => (
            <Button
              key={category}
              type={selectedCategory === category ? 'primary' : 'default'}
              size="small"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </Space>
      </div>

      <div style={{ maxHeight: 500, overflowY: 'auto' }}>
        <List
          dataSource={filteredTemplates}
          renderItem={(template) => (
            <List.Item>
              <Card
                size="small"
                style={{ width: '100%' }}
                actions={[
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      onApplyTemplate(template);
                      onClose();
                    }}
                  >
                    Use Template
                  </Button>
                ]}
              >
                <Card.Meta
                  avatar={template.icon}
                  title={
                    <Space>
                      <Text strong>{template.name}</Text>
                      <Tag color="blue">{template.category}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{template.description}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Space wrap>
                          {template.tags.map(tag => (
                            <Tag key={tag} size="small">{tag}</Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>

      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">
          Templates use {'{{variable}}'} syntax for dynamic values. Replace with actual values before sending.
        </Text>
      </div>
    </Modal>
  );
}
