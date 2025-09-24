import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Input, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HeadersTabNewProps {
  headers: HeaderItem[];
  onChange: (headers: HeaderItem[]) => void;
}

export default function HeadersTabNew({ headers, onChange }: HeadersTabNewProps) {
  const [headerItems, setHeaderItems] = useState<HeaderItem[]>([]);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize headers when props change
  useEffect(() => {
    if (headers && headers.length > 0) {
      setHeaderItems([...headers]);
    } else {
      // Always ensure there's at least one empty header row
      setHeaderItems([{
        id: `header-${Date.now()}-${Math.random()}`,
        key: '',
        value: '',
        enabled: true
      }]);
    }
  }, [headers]);

  // Debounced notify parent of changes
  const notifyChange = useCallback((newHeaders: HeaderItem[]) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      // Filter out empty headers (no key) but keep at least one empty row
      const filteredHeaders = newHeaders.filter(h => h.key.trim() !== '');
      if (filteredHeaders.length === 0) {
        // Always keep one empty header for editing
        onChange([{
          id: `header-${Date.now()}-${Math.random()}`,
          key: '',
          value: '',
          enabled: true
        }]);
      } else {
        onChange(filteredHeaders);
      }
    }, 500); // 500ms delay
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const updateHeaderItem = (index: number, field: keyof HeaderItem, value: string | boolean) => {
    const newHeaders = [...headerItems];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaderItems(newHeaders);
    // Use debounced notification to prevent re-renders during typing
    notifyChange(newHeaders);
  };

  // Immediate save when user leaves input field
  const handleInputBlur = () => {
    // Clear any pending debounced notifications
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Immediately notify parent of current state
    const filteredHeaders = headerItems.filter(h => h.key.trim() !== '');
    if (filteredHeaders.length === 0) {
      onChange([{
        id: `header-${Date.now()}-${Math.random()}`,
        key: '',
        value: '',
        enabled: true
      }]);
    } else {
      onChange(filteredHeaders);
    }
  };

  const addHeader = () => {
    const newHeader: HeaderItem = {
      id: `header-${Date.now()}-${Math.random()}`,
      key: '',
      value: '',
      enabled: true,
    };
    const newHeaders = [...headerItems, newHeader];
    setHeaderItems(newHeaders);
    // Don't notify parent immediately - let user type first
  };

  const removeHeader = (id: string) => {
    const newHeaders = headerItems.filter(header => header.id !== id);
    
    // Always ensure there's at least one empty header row
    if (newHeaders.length === 0) {
      newHeaders.push({
        id: `header-${Date.now()}-${Math.random()}`,
        key: '',
        value: '',
        enabled: true
      });
    }
    
    setHeaderItems(newHeaders);
    
    // Clear any pending debounced notifications
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Immediately notify parent of removal
    const filteredHeaders = newHeaders.filter(h => h.key.trim() !== '');
    if (filteredHeaders.length === 0) {
      onChange([{
        id: `header-${Date.now()}-${Math.random()}`,
        key: '',
        value: '',
        enabled: true
      }]);
    } else {
      onChange(filteredHeaders);
    }
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
          <div key={header.id} style={{ 
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
              onBlur={handleInputBlur}
              style={{ flex: 1 }}
              disabled={!header.enabled}
            />
            <Input
              placeholder="Header value"
              value={header.value}
              onChange={(e) => updateHeaderItem(index, 'value', e.target.value)}
              onBlur={handleInputBlur}
              style={{ flex: 2 }}
              disabled={!header.enabled}
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeHeader(header.id)}
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
