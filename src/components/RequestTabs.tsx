import React from 'react';
import { Tabs, Button, Space, Tag, Typography } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { ApiRequest } from '../types';

const { Text } = Typography;

interface RequestTabsProps {
  requests: ApiRequest[];
  activeRequestKey: string;
  onTabChange: (key: string) => void;
  onCloseTab: (key: string) => void;
  onNewRequest: () => void;
}

export default function RequestTabs({
  requests,
  activeRequestKey,
  onTabChange,
  onCloseTab,
  onNewRequest
}: RequestTabsProps) {
  const tabItems = requests.map(request => ({
    key: request.key,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
        <Tag 
          color={
            request.method === 'GET' ? 'blue' : 
            request.method === 'POST' ? 'green' : 
            request.method === 'PUT' ? 'orange' : 
            request.method === 'DELETE' ? 'red' : 'default'
          }
        >
          {request.method}
        </Tag>
        <Text 
          style={{ 
            color: 'var(--theme-text)',
            fontSize: '12px',
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {request.name}
        </Text>
        <Button
          size="small"
          type="text"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onCloseTab(request.key);
          }}
          style={{ 
            color: 'var(--theme-text-secondary)',
            padding: '0 4px',
            minWidth: '16px',
            height: '16px',
            fontSize: '10px'
          }}
        />
      </div>
    ),
    closable: false // We handle closing with our custom close button
  }));

  return (
    <div style={{ 
      background: 'var(--theme-background)',
      borderBottom: '1px solid var(--theme-border)',
      padding: '0 16px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '48px'
      }}>
        <div style={{ 
          flex: 1,
          overflow: 'hidden',
          marginRight: '8px'
        }}>
          <Tabs
            activeKey={activeRequestKey}
            onChange={onTabChange}
            items={tabItems}
            size="small"
            style={{ 
              margin: 0
            }}
            tabBarStyle={{
              margin: 0,
              borderBottom: 'none',
              overflowX: 'auto',
              overflowY: 'hidden',
              whiteSpace: 'nowrap'
            }}
            tabBarGutter={0}
          />
        </div>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={onNewRequest}
          style={{
            color: 'var(--theme-text)',
            border: '1px dashed var(--theme-border)',
            borderRadius: '4px',
            flexShrink: 0
          }}
          title="New Request"
        >
          New
        </Button>
      </div>
    </div>
  );
}
