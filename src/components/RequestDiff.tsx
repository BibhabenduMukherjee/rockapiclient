import React, { useState } from 'react';
import { Button, Modal, Select, Space, Typography, Divider, Card, Tag } from 'antd';
import { DiffOutlined, EyeOutlined } from '@ant-design/icons';
import { ApiRequest, HistoryItem } from '../types';

const { Text, Title } = Typography;
const { Option } = Select;

interface RequestDiffProps {
  currentRequest: ApiRequest;
  history: HistoryItem[];
  disabled?: boolean;
}

interface DiffSection {
  title: string;
  current: string;
  previous: string;
  hasChanges: boolean;
}

export default function RequestDiff({ currentRequest, history, disabled = false }: RequestDiffProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  const handleOpenDiff = () => {
    setIsModalVisible(true);
    setSelectedHistoryItem(null);
  };

  const handleHistorySelect = (historyId: string) => {
    const item = history.find(h => h.id === historyId);
    setSelectedHistoryItem(item || null);
  };

  const generateDiffSections = (): DiffSection[] => {
    if (!selectedHistoryItem) return [];

    const prev = selectedHistoryItem.request;
    const curr = currentRequest;

    return [
      {
        title: 'Method',
        current: curr.method,
        previous: selectedHistoryItem.method || 'N/A',
        hasChanges: curr.method !== (selectedHistoryItem.method || 'N/A')
      },
      {
        title: 'URL',
        current: curr.url,
        previous: selectedHistoryItem.url || 'N/A',
        hasChanges: curr.url !== (selectedHistoryItem.url || 'N/A')
      },
      {
        title: 'Query Parameters',
        current: JSON.stringify(curr.params || {}, null, 2),
        previous: JSON.stringify(prev.params || {}, null, 2),
        hasChanges: JSON.stringify(curr.params || {}) !== JSON.stringify(prev.params || {})
      },
      {
        title: 'Headers',
        current: JSON.stringify(curr.headers || {}, null, 2),
        previous: JSON.stringify(prev.headers || {}, null, 2),
        hasChanges: JSON.stringify(curr.headers || {}) !== JSON.stringify(prev.headers || {})
      },
      {
        title: 'Body',
        current: curr.body || 'No body',
        previous: prev.body || 'No body',
        hasChanges: (curr.body || '') !== (prev.body || '')
      }
    ];
  };

  const diffSections = generateDiffSections();
  const hasAnyChanges = diffSections.some(section => section.hasChanges);

  const renderDiffContent = (section: DiffSection) => {
    if (!section.hasChanges) {
      return (
        <div style={{ 
          padding: 12, 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f', 
          borderRadius: 4,
          color: '#52c41a'
        }}>
          <Text type="success">No changes</Text>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <Text strong style={{ color: '#1890ff' }}>Current:</Text>
          <pre style={{ 
            background: '#f0f8ff', 
            padding: 8, 
            borderRadius: 4, 
            fontSize: 12,
            marginTop: 4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {section.current}
          </pre>
        </div>
        <div style={{ flex: 1 }}>
          <Text strong style={{ color: '#ff4d4f' }}>Previous:</Text>
          <pre style={{ 
            background: '#fff2f0', 
            padding: 8, 
            borderRadius: 4, 
            fontSize: 12,
            marginTop: 4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {section.previous}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <>
      <Button
        type="text"
        icon={<DiffOutlined />}
        onClick={handleOpenDiff}
        disabled={disabled || history.length === 0}
        title="Compare with history"
        size="small"
      >
        Diff
      </Button>

      <Modal
        title="Request Comparison"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Select a previous request to compare:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Choose from history..."
            value={selectedHistoryItem?.id}
            onChange={handleHistorySelect}
            showSearch
            filterOption={(input, option) => {
              const item = history.find(h => h.id === option?.value);
              return item ? 
                `${item.method} ${item.url}`.toLowerCase().includes(input.toLowerCase()) : false;
            }}
          >
            {history.map(item => (
              <Option key={item.id} value={item.id}>
                <Space>
                  <Tag color={item.method === 'GET' ? 'blue' : item.method === 'POST' ? 'orange' : 'red'}>
                    {item.method}
                  </Tag>
                  <Text ellipsis style={{ maxWidth: 300 }}>
                    {item.url}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </Space>
              </Option>
            ))}
          </Select>
        </div>

        {selectedHistoryItem && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Title level={5} style={{ margin: 0 }}>
                Comparison Results
              </Title>
              {hasAnyChanges ? (
                <Tag color="orange">Changes detected</Tag>
              ) : (
                <Tag color="green">No changes</Tag>
              )}
            </div>

            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {diffSections.map((section, index) => (
                <Card
                  key={index}
                  title={section.title}
                  size="small"
                  style={{ marginBottom: 12 }}
                  extra={
                    section.hasChanges ? (
                      <Tag color="red">Modified</Tag>
                    ) : (
                      <Tag color="green">Unchanged</Tag>
                    )
                  }
                >
                  {renderDiffContent(section)}
                </Card>
              ))}
            </div>
          </div>
        )}

        {!selectedHistoryItem && (
          <div style={{ 
            textAlign: 'center', 
            padding: 40, 
            color: '#999' 
          }}>
            <EyeOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <br />
            <Text type="secondary">Select a request from history to see the comparison</Text>
          </div>
        )}
      </Modal>
    </>
  );
}
