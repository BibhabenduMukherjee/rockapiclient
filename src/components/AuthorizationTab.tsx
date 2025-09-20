import React, { useState, useEffect } from 'react';
import { Select, Input, Space, Typography, Divider } from 'antd';
import { KeyOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

export type AuthType = 'none' | 'apiKey' | 'bearer' | 'basic' | 'jwt';

export interface AuthConfig {
  type: AuthType;
  apiKey: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
  bearer: {
    token: string;
  };
  basic: {
    username: string;
    password: string;
  };
  jwt: {
    token: string;
  };
}

interface AuthorizationTabProps {
  auth: AuthConfig;
  onChange: (auth: AuthConfig) => void;
}

export default function AuthorizationTab({ auth, onChange }: AuthorizationTabProps) {
  const [authConfig, setAuthConfig] = useState<AuthConfig>(auth);

  useEffect(() => {
    setAuthConfig(auth);
  }, [auth]);

  const updateAuth = (updates: Partial<AuthConfig>) => {
    const newAuth = { ...authConfig, ...updates };
    setAuthConfig(newAuth);
    onChange(newAuth);
  };

  const updateApiKey = (field: keyof AuthConfig['apiKey'], value: string) => {
    updateAuth({
      apiKey: { ...authConfig.apiKey, [field]: value }
    });
  };

  const updateBasic = (field: keyof AuthConfig['basic'], value: string) => {
    updateAuth({
      basic: { ...authConfig.basic, [field]: value }
    });
  };

  const updateBearer = (field: keyof AuthConfig['bearer'], value: string) => {
    updateAuth({
      bearer: { ...authConfig.bearer, [field]: value }
    });
  };

  const updateJwt = (field: keyof AuthConfig['jwt'], value: string) => {
    updateAuth({
      jwt: { ...authConfig.jwt, [field]: value }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Authorization</Text>
        <Select
          value={authConfig.type}
          onChange={(type) => updateAuth({ type })}
          style={{ width: '100%', marginTop: 8 }}
        >
          <Option value="none">
            <Space>
              <LockOutlined />
              No Auth
            </Space>
          </Option>
          <Option value="apiKey">
            <Space>
              <KeyOutlined />
              API Key
            </Space>
          </Option>
          <Option value="bearer">
            <Space>
              <SafetyOutlined />
              Bearer Token
            </Space>
          </Option>
          <Option value="basic">
            <Space>
              <LockOutlined />
              Basic Auth
            </Space>
          </Option>
          <Option value="jwt">
            <Space>
              <SafetyOutlined />
              JWT Token
            </Space>
          </Option>
        </Select>
      </div>

      {authConfig.type === 'apiKey' && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <Text strong>Key</Text>
            <Input
              placeholder="API Key name (e.g., X-API-Key)"
              value={authConfig.apiKey.key}
              onChange={(e) => updateApiKey('key', e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Text strong>Value</Text>
            <Input
              placeholder="API Key value"
              value={authConfig.apiKey.value}
              onChange={(e) => updateApiKey('value', e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <Text strong>Add to</Text>
            <Select
              value={authConfig.apiKey.addTo}
              onChange={(value) => updateApiKey('addTo', value)}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="header">Header</Option>
              <Option value="query">Query Params</Option>
            </Select>
          </div>
        </div>
      )}

      {authConfig.type === 'bearer' && (
        <div>
          <Text strong>Token</Text>
          <Input
            placeholder="Bearer token"
            value={authConfig.bearer.token}
            onChange={(e) => updateBearer('token', e.target.value)}
            style={{ marginTop: 4 }}
          />
        </div>
      )}

      {authConfig.type === 'basic' && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <Text strong>Username</Text>
            <Input
              placeholder="Username"
              value={authConfig.basic.username}
              onChange={(e) => updateBasic('username', e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
          <div>
            <Text strong>Password</Text>
            <Input.Password
              placeholder="Password"
              value={authConfig.basic.password}
              onChange={(e) => updateBasic('password', e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
        </div>
      )}

      {authConfig.type === 'jwt' && (
        <div>
          <Text strong>JWT Token</Text>
          <Input.TextArea
            placeholder="JWT token"
            value={authConfig.jwt.token}
            onChange={(e) => updateJwt('token', e.target.value)}
            rows={4}
            style={{ marginTop: 4 }}
          />
        </div>
      )}

      {authConfig.type === 'none' && (
        <div style={{ 
          textAlign: 'center', 
          padding: 24, 
          color: '#999',
          border: '1px dashed #d9d9d9',
          borderRadius: 4
        }}>
          No authorization required for this request.
        </div>
      )}
    </div>
  );
}
