import React from 'react';
import { Spin } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import './Preloader.css';

interface PreloaderProps {
  visible: boolean;
  message?: string;
}

export default function Preloader({ visible, message = 'Loading Rock API Client...' }: PreloaderProps) {
  // Safety check for message
  const displayMessage = message || 'Loading Rock API Client...';

  return (
    <div 
      className="preloader-overlay" 
      style={{ 
        display: visible ? 'flex' : 'none',
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden'
      }}
    >
      <div className="preloader-container">
        {/* Animated Rocket Icon */}
        <div className="rocket-container">
          <RocketOutlined className="rocket-icon" />
          <div className="rocket-trail"></div>
        </div>
        
        {/* Loading Spinner */}
        <div className="spinner-container">
          <Spin size="large" />
        </div>
        
        {/* Loading Message */}
        <div className="loading-message">
          <h3>{displayMessage}</h3>
          <p>Preparing your API testing environment...</p>
        </div>
        
        {/* Progress Dots */}
        <div className="progress-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
}
