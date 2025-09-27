import React, { useState, useEffect } from 'react';
import { notification as antdNotification, Button, Space, Typography, Progress } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  showRetry?: boolean;
  onRetry?: () => void;
  showProgress?: boolean;
  progress?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  }>;
}

interface EnhancedNotificationsProps {
  config: NotificationConfig;
  onClose?: () => void;
}

export const showEnhancedNotification = (config: NotificationConfig) => {
  const key = `notification-${Date.now()}`;
  
  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getColor = () => {
    switch (config.type) {
      case 'success':
        return '#f6ffed';
      case 'error':
        return '#fff2f0';
      case 'warning':
        return '#fffbe6';
      case 'info':
        return '#f0f8ff';
      default:
        return '#f0f8ff';
    }
  };

  const getBorderColor = () => {
    switch (config.type) {
      case 'success':
        return '#b7eb8f';
      case 'error':
        return '#ffccc7';
      case 'warning':
        return '#ffe58f';
      case 'info':
        return '#91d5ff';
      default:
        return '#91d5ff';
    }
  };

  const actions = [];
  
  if (config.showRetry && config.onRetry) {
    actions.push(
      <Button
        key="retry"
        type="primary"
        size="small"
        icon={<ReloadOutlined />}
        onClick={() => {
          config.onRetry?.();
          notification.destroy(key);
        }}
      >
        Retry
      </Button>
    );
  }

  if (config.actions) {
    config.actions.forEach((action, index) => {
      actions.push(
        <Button
          key={`action-${index}`}
          type={action.type || 'default'}
          size="small"
          onClick={() => {
            action.action();
            notification.destroy(key);
          }}
        >
          {action.label}
        </Button>
      );
    });
  }

  antdNotification.open({
    key,
    message: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {getIcon()}
        <Text strong>{config.title}</Text>
      </div>
    ),
    description: (
      <div style={{ marginTop: 8 }}>
        <Text>{config.message}</Text>
        {config.showProgress && (
          <div style={{ marginTop: 8 }}>
            <Progress
              percent={config.progress || 0}
              size="small"
              status={config.progress === 100 ? 'success' : 'active'}
            />
          </div>
        )}
        {actions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Space size="small">
              {actions}
            </Space>
          </div>
        )}
      </div>
    ),
    duration: config.duration || 4.5,
    style: {
      backgroundColor: getColor(),
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 6,
    },
    placement: 'topRight',
  });

  return key;
};

// Specific notification helpers
export const showRequestSuccess = (duration: number, status: number) => {
  showEnhancedNotification({
    type: 'success',
    title: 'Request Successful',
    message: `Request completed in ${duration}ms with status ${status}`,
    duration: 3
  });
};

export const showRequestError = (error: string, onRetry?: () => void) => {
  showEnhancedNotification({
    type: 'error',
    title: 'Request Failed',
    message: error,
    duration: 6,
    showRetry: !!onRetry,
    onRetry,
    actions: [
      {
        label: 'Copy Error',
        action: () => {
          navigator.clipboard.writeText(error);
        },
        type: 'default'
      }
    ]
  });
};

export const showRequestProgress = (progress: number) => {
  const key = showEnhancedNotification({
    type: 'info',
    title: 'Request in Progress',
    message: 'Sending request...',
    duration: 0, // Don't auto-close
    showProgress: true,
    progress
  });
  return key;
};

export const showCollectionSaved = () => {
  showEnhancedNotification({
    type: 'success',
    title: 'Collection Saved',
    message: 'Your collection has been saved successfully',
    duration: 2
  });
};

export const showTestPassed = (testName: string, duration: number) => {
  showEnhancedNotification({
    type: 'success',
    title: 'Test Passed',
    message: `"${testName}" completed successfully in ${duration}ms`,
    duration: 3,
    actions: [
      {
        label: 'View Tests',
        action: () => {
          // Navigate to tests section
        },
        type: 'primary'
      }
    ]
  });
};

export const showTestFailed = (testName: string, error: string) => {
  showEnhancedNotification({
    type: 'error',
    title: 'Test Failed',
    message: `"${testName}" failed: ${error}`,
    duration: 5,
    actions: [
      {
        label: 'View Details',
        action: () => {
          // Show test details
        },
        type: 'primary'
      },
      {
        label: 'Retry Test',
        action: () => {
          // Retry the test
        },
        type: 'default'
      }
    ]
  });
};

export const showLongRunningRequest = (onCancel: () => void) => {
  return showEnhancedNotification({
    type: 'warning',
    title: 'Long Running Request',
    message: 'This request is taking longer than expected. You can cancel it if needed.',
    duration: 0, // Don't auto-close
    actions: [
      {
        label: 'Cancel Request',
        action: onCancel,
        type: 'primary'
      }
    ]
  });
};

export default function EnhancedNotifications() {
  // This component can be used to render persistent notifications
  // For now, we're using the notification API directly
  return null;
}
