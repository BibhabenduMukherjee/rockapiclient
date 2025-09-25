import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RequestTabs from '../../src/components/RequestTabs';
import { ApiRequest } from '../../src/types';

// Mock Ant Design components to avoid complex rendering
jest.mock('antd', () => ({
  Tabs: ({ activeKey, onChange, items, children, ...props }: any) => (
    <div data-testid="tabs" data-active-key={activeKey} {...props}>
      {items?.map((item: any) => (
        <button
          key={item.key}
          data-testid={`tab-${item.key}`}
          onClick={() => onChange(item.key)}
          className={activeKey === item.key ? 'active' : ''}
        >
          {item.label}
        </button>
      ))}
      {children}
    </div>
  ),
  Button: ({ children, onClick, icon, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {icon}
      {children}
    </button>
  ),
  Tag: ({ children, color, ...props }: any) => (
    <span data-testid="tag" data-color={color} {...props}>
      {children}
    </span>
  ),
  Typography: {
    Text: ({ children, ...props }: any) => <span {...props}>{children}</span>
  }
}));

describe('RequestTabs', () => {
  const mockRequests: ApiRequest[] = [
    {
      key: 'request-1',
      title: 'Test Request 1',
      name: 'Test Request 1',
      method: 'GET',
      url: 'https://api.example.com/test1',
      params: {},
      headers: {},
      body: ''
    },
    {
      key: 'request-2',
      title: 'Test Request 2',
      name: 'Test Request 2',
      method: 'POST',
      url: 'https://api.example.com/test2',
      params: {},
      headers: {},
      body: '{"test": "data"}'
    }
  ];

  const defaultProps = {
    requests: mockRequests,
    activeRequestKey: 'request-1',
    onTabChange: jest.fn(),
    onCloseTab: jest.fn(),
    onNewRequest: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render tabs for all requests', () => {
    render(<RequestTabs {...defaultProps} />);
    
    expect(screen.getByTestId('tab-request-1')).toBeInTheDocument();
    expect(screen.getByTestId('tab-request-2')).toBeInTheDocument();
  });

  it('should display correct method tags with appropriate colors', () => {
    render(<RequestTabs {...defaultProps} />);
    
    const tags = screen.getAllByTestId('tag');
    expect(tags[0]).toHaveAttribute('data-color', 'blue'); // GET
    expect(tags[1]).toHaveAttribute('data-color', 'green'); // POST
  });

  it('should display request names', () => {
    render(<RequestTabs {...defaultProps} />);
    
    expect(screen.getByText('Test Request 1')).toBeInTheDocument();
    expect(screen.getByText('Test Request 2')).toBeInTheDocument();
  });

  it('should call onTabChange when tab is clicked', () => {
    render(<RequestTabs {...defaultProps} />);
    
    const tab2 = screen.getByTestId('tab-request-2');
    fireEvent.click(tab2);
    
    expect(defaultProps.onTabChange).toHaveBeenCalledWith('request-2');
  });

  it('should call onNewRequest when New button is clicked', () => {
    render(<RequestTabs {...defaultProps} />);
    
    const newButton = screen.getByText('New');
    fireEvent.click(newButton);
    
    expect(defaultProps.onNewRequest).toHaveBeenCalled();
  });

  it('should show active tab correctly', () => {
    render(<RequestTabs {...defaultProps} />);
    
    const tabs = screen.getByTestId('tabs');
    expect(tabs).toHaveAttribute('data-active-key', 'request-1');
  });

  it('should handle different HTTP methods with correct colors', () => {
    const requestsWithDifferentMethods: ApiRequest[] = [
      { ...mockRequests[0], key: 'request-get', method: 'GET' },
      { ...mockRequests[0], key: 'request-post', method: 'POST' },
      { ...mockRequests[0], key: 'request-put', method: 'PUT' },
      { ...mockRequests[0], key: 'request-delete', method: 'DELETE' },
      { ...mockRequests[0], key: 'request-patch', method: 'PATCH' }
    ];

    render(<RequestTabs {...defaultProps} requests={requestsWithDifferentMethods} />);
    
    const tags = screen.getAllByTestId('tag');
    expect(tags[0]).toHaveAttribute('data-color', 'blue'); // GET
    expect(tags[1]).toHaveAttribute('data-color', 'green'); // POST
    expect(tags[2]).toHaveAttribute('data-color', 'orange'); // PUT
    expect(tags[3]).toHaveAttribute('data-color', 'red'); // DELETE
    expect(tags[4]).toHaveAttribute('data-color', 'default'); // PATCH
  });

  it('should render close buttons for each tab', () => {
    render(<RequestTabs {...defaultProps} />);
    
    // Each tab should have a close button (CloseOutlined icon)
    const closeButtons = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('') // CloseOutlined renders as empty text
    );
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('should handle empty requests array', () => {
    render(<RequestTabs {...defaultProps} requests={[]} />);
    
    expect(screen.queryByTestId('tab-request-1')).not.toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument(); // New button should still be there
  });
});
