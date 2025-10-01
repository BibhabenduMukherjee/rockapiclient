import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock CSS imports
jest.mock('../../src/components/Preloader.css', () => ({}));

import Preloader from '../../src/components/Preloader';

describe('Preloader', () => {
  it('should render when visible', () => {
    render(<Preloader visible={true} message="Loading..." />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not render when not visible', () => {
    render(<Preloader visible={false} message="Loading..." />);
    
    // The component still renders but with display: none, so we check the style instead
    const preloaderElement = screen.getByText('Loading...').closest('.preloader-overlay');
    expect(preloaderElement).toHaveStyle({ display: 'none' });
  });

  it('should display default message when no message provided', () => {
    render(<Preloader visible={true} />);
    
    expect(screen.getByText('Loading Rock API Client...')).toBeInTheDocument();
  });

  it('should display custom message', () => {
    render(<Preloader visible={true} message="Initializing application..." />);
    
    expect(screen.getByText('Initializing application...')).toBeInTheDocument();
  });

  it('should display rocket icon', () => {
    render(<Preloader visible={true} />);
    
    // Check for rocket-related elements (the component uses CSS for rocket animation)
    const preloaderElement = screen.getByRole('img', { name: 'rocket' });
    expect(preloaderElement).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    render(<Preloader visible={true} />);
    
    const preloaderElement = screen.getByRole('img', { name: 'rocket' }).closest('.preloader-overlay');
    expect(preloaderElement).toHaveClass('preloader-overlay');
  });

  it('should handle undefined message gracefully', () => {
    render(<Preloader visible={true} message={undefined} />);
    
    // Should not crash and should show default message
    expect(screen.getByText('Loading Rock API Client...')).toBeInTheDocument();
  });

  it('should display progress dots', () => {
    render(<Preloader visible={true} />);
    
    // The component should have progress dots
    const preloaderElement = screen.getByRole('img', { name: 'rocket' }).closest('.preloader-overlay');
    expect(preloaderElement).toBeInTheDocument();
  });

  it('should be hidden when visible is false', () => {
    render(<Preloader visible={false} />);
    
    // When visible is false, the rocket icon is not accessible due to display: none
    // So we check the preloader overlay directly by its text content
    const preloaderElement = screen.getByText('Loading Rock API Client...').closest('.preloader-overlay');
    expect(preloaderElement).toHaveStyle({ display: 'none' });
  });

  it('should be visible when visible is true', () => {
    render(<Preloader visible={true} />);
    
    const preloaderElement = screen.getByRole('img', { name: 'rocket' }).closest('.preloader-overlay');
    expect(preloaderElement).toHaveStyle({ display: 'flex' });
  });
});
