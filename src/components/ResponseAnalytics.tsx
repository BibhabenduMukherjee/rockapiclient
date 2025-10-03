import React, { useState } from 'react';
import { Card, Collapse, Button, Space } from 'antd';
import { BarChartOutlined, DownOutlined } from '@ant-design/icons';
import ResponseTimeChart from './ResponseTimeChart';

interface ResponseAnalyticsProps {
  responseTimeData: Array<{ timestamp: number; duration: number; status: number; url: string }>;
  className?: string;
}

export default function ResponseAnalytics({ responseTimeData, className }: ResponseAnalyticsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (responseTimeData.length === 0) {
    return null;
  }

  return (
    <div className={className} style={{ marginTop: 16 }}>
      <Collapse
        size="small"
        activeKey={isExpanded ? ['analytics'] : []}
        onChange={(keys) => setIsExpanded(keys.includes('analytics'))}
        items={[
          {
            key: 'analytics',
            label: (
              <Space>
                <BarChartOutlined />
                <span style={{ fontWeight: 500 }}>Response Analytics</span>
                <span style={{ color: '#666', fontSize: '12px' }}>
                  ({responseTimeData.length} requests)
                </span>
              </Space>
            ),
            children: (
              <div style={{ padding: '4px 0' }}>
                <ResponseTimeChart data={responseTimeData} />
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
