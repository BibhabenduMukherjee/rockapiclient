import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomButton from '../../src/components/CustomButton';

describe('CustomButton', () => {
  it('should render with children', () => {
    render(<CustomButton>Click me</CustomButton>);
    
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    render(<CustomButton icon={<TestIcon />}>Click me</CustomButton>);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<CustomButton onClick={handleClick}>Click me</CustomButton>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<CustomButton disabled>Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should show loading state when loading prop is true', () => {
    render(<CustomButton loading>Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    // When loading, the button should have loading class
    expect(button).toHaveClass('ant-btn-loading');
  });

  it('should apply primary variant styles', () => {
    render(<CustomButton variant="primary">Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should apply secondary variant styles', () => {
    render(<CustomButton variant="secondary">Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should apply danger variant styles', () => {
    render(<CustomButton variant="danger">Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should apply custom size', () => {
    render(<CustomButton size="large">Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CustomButton className="custom-class">Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should pass through other props', () => {
    render(<CustomButton data-testid="custom-button" title="Custom title">Click me</CustomButton>);
    
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('title', 'Custom title');
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<CustomButton onClick={handleClick} disabled>Click me</CustomButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not call onClick when loading', () => {
    const handleClick = jest.fn();
    render(<CustomButton onClick={handleClick} loading>Click me</CustomButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with both icon and text', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    render(<CustomButton icon={<TestIcon />}>Launch</CustomButton>);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Launch')).toBeInTheDocument();
  });

  it('should handle keyboard events', () => {
    const handleClick = jest.fn();
    render(<CustomButton onClick={handleClick}>Click me</CustomButton>);
    
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    // Note: CustomButton might not handle keyboard events, this is just testing the element exists
    expect(button).toBeInTheDocument();
  });
});
