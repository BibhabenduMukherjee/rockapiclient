import React, { useState, useEffect } from 'react';
import Tour from 'reactour';
import { Button, Space, Typography } from 'antd';
import { PlayCircleOutlined, CloseOutlined } from '@ant-design/icons';

// Suppress React warnings for reactour props
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React does not recognize')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const { Text, Title } = Typography;

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppTour({ isOpen, onClose }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      selector: '[data-tour="sidebar"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: 'var(--theme-primary)' }}>
            🎯 Welcome to Rock API Client!
          </Title>
          <Text style={{ color: 'var(--theme-text)' }}>
            This is your main navigation sidebar. Here you can manage:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>Collections:</strong> Organize your API requests</li>
            <li><strong>Environments:</strong> Manage variables for different environments</li>
            <li><strong>History:</strong> View your request history</li>
          </ul>
        </div>
      ),
      position: 'right' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="collections-tab"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: 'var(--theme-primary)' }}>
            📁 Collections
          </Title>
          <Text style={{ color: 'var(--theme-text)' }}>
            Collections help you organize your API requests into groups. You can:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Create new collections with the <strong>"New"</strong> button</li>
            <li>Add requests to collections</li>
            <li>Rename or delete collections</li>
            <li>View request counts for each collection</li>
          </ul>
        </div>
      ),
      position: 'right' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="environments-tab"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: 'var(--theme-primary)' }}>
            🌍 Environments
          </Title>
          <Text>
            Environments let you manage variables for different stages (dev, staging, prod):
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Create environments with the <strong>"New"</strong> button</li>
            <li>Add variables like <code>{'{{apiUrl}}'}</code>, <code>{'{{token}}'}</code></li>
            <li>Select active environment from dropdown</li>
            <li>Variables are automatically substituted in requests</li>
          </ul>
        </div>
      ),
      position: 'right' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="history-tab"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: 'var(--theme-primary)' }}>
            📜 History
          </Title>
          <Text>
            Your request history is automatically saved. You can:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Search through your request history</li>
            <li>Click any history item to recreate the request</li>
            <li>Clear all history with the <strong>"Clear All"</strong> button</li>
            <li>See response times and status codes</li>
          </ul>
        </div>
      ),
      position: 'right' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="request-tabs"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
            📑 Request Tabs
          </Title>
          <Text>
            Work with multiple requests simultaneously:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Each tab represents a different API request</li>
            <li>Click the <strong>"New"</strong> button to create new requests</li>
            <li>Close tabs with the <strong>×</strong> button</li>
            <li>Scroll horizontally if you have many tabs</li>
            <li>Color-coded method tags (GET=blue, POST=green, etc.)</li>
          </ul>
        </div>
      ),
      position: 'bottom' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="request-builder"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: '#52c41a' }}>
            🔧 Request Builder
          </Title>
          <Text>
            Build your API requests with these components:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>Method:</strong> Select HTTP method (GET, POST, PUT, DELETE)</li>
            <li><strong>URL:</strong> Enter your API endpoint</li>
            <li><strong>Send:</strong> Execute the request</li>
            <li><strong>Duplicate:</strong> Copy current request</li>
            <li><strong>Diff:</strong> Compare with previous requests</li>
          </ul>
        </div>
      ),
      position: 'bottom' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="request-tabs-content"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: 'var(--theme-primary)' }}>
            📋 Request Configuration
          </Title>
          <Text>
            Configure your request details in these tabs:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>Query Params:</strong> Add URL parameters as JSON</li>
            <li><strong>Headers:</strong> Set HTTP headers</li>
            <li><strong>Authorization:</strong> Configure authentication</li>
            <li><strong>Body:</strong> Add request body (JSON, form data, etc.)</li>
          </ul>
        </div>
      ),
      position: 'top' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="response-section"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: 'var(--theme-primary)' }}>
            📊 Response Section
          </Title>
          <Text>
            View your API responses here:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>Status Bar:</strong> Shows status code, time, and size</li>
            <li><strong>Headers:</strong> View response headers in dropdown</li>
            <li><strong>Body:</strong> View response body in dropdown</li>
            <li><strong>Color Coding:</strong> Green=success, Red=error, etc.</li>
          </ul>
        </div>
      ),
      position: 'top' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="header-actions"]',
      content: (
        <div style={{ padding: '16px' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
            ⚡ Quick Actions
          </Title>
          <Text>
            Access powerful features from the header:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>Command Palette:</strong> Quick access to all features (Ctrl+K)</li>
            <li><strong>Templates:</strong> Pre-built request templates</li>
            <li><strong>Theme:</strong> Customize colors and appearance</li>
            <li><strong>Settings:</strong> Configure application preferences</li>
          </ul>
        </div>
      ),
      position: 'bottom' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    },
    {
      selector: '[data-tour="tour-complete"]',
      content: (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: '0 0 12px 0', color: '#52c41a' }}>
            🎉 Tour Complete!
          </Title>
          <Text>
            You're all set to use Rock API Client! Here are some tips:
          </Text>
          <ul style={{ margin: '8px 0', paddingLeft: '20px', textAlign: 'left' }}>
            <li>Use <strong>Ctrl+K</strong> for quick actions</li>
            <li>Create collections to organize your requests</li>
            <li>Set up environments for different stages</li>
            <li>Use templates for common API patterns</li>
            <li>Check the history to reuse previous requests</li>
          </ul>
          <Text strong style={{ color: '#1890ff' }}>
            Happy API testing! 🚀
          </Text>
        </div>
      ),
      position: 'center' as const,
      style: {
        backgroundColor: 'var(--theme-background)',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--theme-border)'
      }
    }
  ];

  const handleClose = () => {
    setCurrentStep(0);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Tour
      steps={tourSteps}
      isOpen={isOpen}
      onRequestClose={handleClose}
      goToStep={currentStep}
      nextButton={
        <Button type="primary" onClick={handleNext}>
          {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      }
      prevButton={
        currentStep > 0 ? (
          <Button onClick={handlePrev}>Previous</Button>
        ) : null
      }
      closeButton={
        <Button type="text" icon={<CloseOutlined />} onClick={handleClose} />
      }
      showNavigation={true}
      showButtons={true}
      showNumber={true}
      showBadge={true}
      accentColor="#1890ff"
      className="app-tour"
      // Filter out problematic props that cause DOM warnings
      maskClassName="tour-mask"
      highlightedMaskClassName="tour-highlighted-mask"
    />
  );
}

// Tour Button Component
export function TourButton({ onStartTour }: { onStartTour: () => void }) {
  return (
    <Button
      type="text"
      icon={<PlayCircleOutlined />}
      onClick={onStartTour}
      className="tour-button"
      style={{
        borderRadius: '4px',
        marginRight: '16px'
      }}
      title="Take a guided tour of the application"
    >
      Take Tour
    </Button>
  );
}
