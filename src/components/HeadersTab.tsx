import React, { useState, useEffect } from 'react';
import { Button, Input, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface HeaderItem {
  key: string;
  value: string;
  enabled: boolean;
}

interface HeadersTabProps {
  headers: HeaderItem[];
  onChange: (headers: HeaderItem[]) => void;
}

export default function HeadersTab({ headers, onChange }: HeadersTabProps) {
  const [headerItems, setHeaderItems] = useState<HeaderItem[]>(headers);

  useEffect(() => {
    setHeaderItems(headers);
  }, [headers]);

  const updateHeaderItem = (index: number, field: keyof HeaderItem, value: string | boolean) => {
    const newHeaders = [...headerItems];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaderItems(newHeaders);
    onChange(newHeaders);
  };

  const addHeader = () => {
    const newHeader: HeaderItem = {
      key: '',
      value: '',
      enabled: true,
    };
    const newHeaders = [...headerItems, newHeader];
    setHeaderItems(newHeaders);
    onChange(newHeaders);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headerItems.filter((_, i) => i !== index);
    setHeaderItems(newHeaders);
    onChange(newHeaders);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Request Headers</Text>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addHeader} size="small">
          Add Header
        </Button>
      </div>
      
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {headerItems.map((header, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 8, 
            padding: 8, 
            border: '1px solid #f0f0f0', 
            borderRadius: 4,
            backgroundColor: header.enabled ? '#fff' : '#f5f5f5'
          }}>
            <Input
              placeholder="Header name (e.g., Authorization)"
              value={header.key}
              onChange={(e) => updateHeaderItem(index, 'key', e.target.value)}
              style={{ flex: 1 }}
              disabled={!header.enabled}
            />
            <Input
              placeholder="Header value"
              value={header.value}
              onChange={(e) => updateHeaderItem(index, 'value', e.target.value)}
              style={{ flex: 2 }}
              disabled={!header.enabled}
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeHeader(index)}
              danger
              size="small"
            />
          </div>
        ))}
        
        {headerItems.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 24, 
            color: '#999',
            border: '1px dashed #d9d9d9',
            borderRadius: 4
          }}>
            No headers added. Click "Add Header" to add request headers.
          </div>
        )}
      </div>
    </div>
  );
}
