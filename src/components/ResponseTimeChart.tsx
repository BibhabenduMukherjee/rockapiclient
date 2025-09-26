import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ClockCircleOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons';

interface ResponseTimeData {
  timestamp: number;
  duration: number;
  status: number;
  url: string;
}

interface ResponseTimeChartProps {
  data: ResponseTimeData[];
  className?: string;
}

export default function ResponseTimeChart({ data, className }: ResponseTimeChartProps) {
  // Calculate statistics
  const durations = data.map(d => d.duration);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  const errorCount = data.filter(d => d.status >= 400).length;
  const successRate = data.length > 0 ? ((data.length - errorCount) / data.length) * 100 : 100;

  // Simple chart using CSS
  const maxTime = Math.max(maxDuration, 1000); // Minimum scale of 1 second
  const chartHeight = 100;

  return (
    <Card 
      title="Response Time Analytics" 
      size="small" 
      className={className}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Average Time"
            value={avgDuration}
            precision={0}
            suffix="ms"
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Min Time"
            value={minDuration}
            precision={0}
            suffix="ms"
            prefix={<ThunderboltOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Max Time"
            value={maxDuration}
            precision={0}
            suffix="ms"
            prefix={<WarningOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Success Rate"
            value={successRate}
            precision={1}
            suffix="%"
            valueStyle={{ color: successRate >= 95 ? '#52c41a' : successRate >= 80 ? '#fa8c16' : '#ff4d4f' }}
          />
        </Col>
      </Row>
      
      {data.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            Response Time Trend (Last {data.length} requests)
          </div>
          <div 
            style={{ 
              height: chartHeight, 
              border: '1px solid #f0f0f0', 
              borderRadius: 4,
              padding: 8,
              background: '#fafafa',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {data.slice(-20).map((point, index) => {
              const height = (point.duration / maxTime) * (chartHeight - 16);
              const width = (100 / Math.min(data.length, 20));
              const isError = point.status >= 400;
              
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: `${index * width}%`,
                    width: `${width * 0.8}%`,
                    height: height,
                    backgroundColor: isError ? '#ff4d4f' : point.duration > avgDuration * 1.5 ? '#fa8c16' : '#1890ff',
                    borderRadius: 2,
                    transition: 'all 0.3s ease'
                  }}
                  title={`${point.url} - ${point.duration}ms (${point.status})`}
                />
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
