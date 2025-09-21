import React, { useState, useMemo } from 'react';
import { Input, Space, Typography, Tag, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { HistoryItem } from '../types';

const { Text } = Typography;

interface HistorySearchProps {
  history: HistoryItem[];
  onSearch: (filteredHistory: HistoryItem[]) => void;
}

export default function HistorySearch({ history, onSearch }: HistorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter history based on search term
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) {
      return history;
    }

    const term = searchTerm.toLowerCase();
    return history.filter(item => {
      // Search in method, URL, and request data
      const methodMatch = item.method.toLowerCase().includes(term);
      const urlMatch = item.url.toLowerCase().includes(term);
      const paramsMatch = JSON.stringify(item.request.params || {}).toLowerCase().includes(term);
      const headersMatch = JSON.stringify(item.request.headers || {}).toLowerCase().includes(term);
      const bodyMatch = (item.request.body || '').toLowerCase().includes(term);
      
      return methodMatch || urlMatch || paramsMatch || headersMatch || bodyMatch;
    });
  }, [history, searchTerm]);

  // Notify parent component of filtered results
  React.useEffect(() => {
    onSearch(filteredHistory);
  }, [filteredHistory, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder="Search history by method, URL, params, headers, or body..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined />}
          allowClear
          style={{ flex: 1 }}
        />
        {searchTerm && (
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClear}
            title="Clear search"
          />
        )}
      </Space.Compact>
      
      {searchTerm && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Found {filteredHistory.length} of {history.length} requests
          </Text>
          {filteredHistory.length === 0 && (
            <Tag color="orange">No matches found</Tag>
          )}
        </div>
      )}
    </div>
  );
}
