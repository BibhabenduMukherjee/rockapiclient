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
    <div style={{ 
      marginBottom: '20px',
      padding: '16px',
      background: 'var(--theme-surface)',
      borderRadius: '8px',
      border: '1px solid var(--theme-border)'
    }}>
      <div style={{ position: 'relative' }}>
        <Input
          placeholder="Search history by method, URL, params, headers, or body..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined style={{ color: 'var(--theme-text-secondary)' }} />}
          allowClear
          size="large"
          style={{
            height: '44px',
            background: 'var(--theme-background)',
            border: '2px solid var(--theme-border)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--theme-text)',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--theme-primary)';
            e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--theme-border)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {searchTerm && (
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--theme-primary)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {filteredHistory.length} found
          </div>
        )}
      </div>
      
      {searchTerm && (
        <div style={{ 
          marginTop: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '8px 12px',
          background: 'var(--theme-background)',
          borderRadius: '6px',
          border: '1px solid var(--theme-border)'
        }}>
          <Text 
            style={{ 
              fontSize: 13,
              color: 'var(--theme-text-secondary)',
              fontWeight: '500'
            }}
          >
            Found {filteredHistory.length} of {history.length} requests
          </Text>
          {filteredHistory.length === 0 && (
            <Tag 
              color="orange"
              style={{
                background: '#fa8c16',
                color: 'white',
                border: 'none',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              No matches found
            </Tag>
          )}
          {filteredHistory.length > 0 && (
            <Tag 
              color="green"
              style={{
                background: '#52c41a',
                color: 'white',
                border: 'none',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {((filteredHistory.length / history.length) * 100).toFixed(0)}% match
            </Tag>
          )}
        </div>
      )}
    </div>
  );
}
