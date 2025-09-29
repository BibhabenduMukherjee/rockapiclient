import React from 'react';
import { Button, ButtonProps } from 'antd';

interface CustomButtonProps extends Omit<ButtonProps, 'type' | 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  children,
  className = '',
  style = {},
  ...props
}) => {
  const getButtonStyles = () => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '8px',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: '1px solid transparent',
      ...style
    };

    // Size variants
    switch (size) {
      case 'small':
        Object.assign(baseStyles, {
          height: '32px',
          padding: '0 12px',
          fontSize: '12px',
          minWidth: '80px'
        });
        break;
      case 'large':
        Object.assign(baseStyles, {
          height: '48px',
          padding: '0 24px',
          fontSize: '16px',
          minWidth: '120px'
        });
        break;
      default: // medium
        Object.assign(baseStyles, {
          height: '40px',
          padding: '0 16px',
          fontSize: '14px',
          minWidth: '100px'
        });
    }

    // Full width
    if (fullWidth) {
      baseStyles.width = '100%';
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        Object.assign(baseStyles, {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderColor: '#667eea',
          color: 'white',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
        });
        break;
      case 'secondary':
        Object.assign(baseStyles, {
          background: 'var(--theme-background-secondary, #f5f5f5)',
          borderColor: 'var(--theme-border, #d9d9d9)',
          color: 'var(--theme-text, #333)'
        });
        break;
      case 'success':
        Object.assign(baseStyles, {
          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          borderColor: '#52c41a',
          color: 'white',
          boxShadow: '0 2px 8px rgba(82, 196, 26, 0.3)'
        });
        break;
      case 'warning':
        Object.assign(baseStyles, {
          background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
          borderColor: '#faad14',
          color: 'white',
          boxShadow: '0 2px 8px rgba(250, 173, 20, 0.3)'
        });
        break;
      case 'danger':
        Object.assign(baseStyles, {
          background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
          borderColor: '#ff4d4f',
          color: 'white',
          boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)'
        });
        break;
      case 'ghost':
        Object.assign(baseStyles, {
          background: 'transparent',
          borderColor: 'var(--theme-border, #d9d9d9)',
          color: 'var(--theme-text, #333)'
        });
        break;
    }

    return baseStyles;
  };

  const getHoverStyles = () => {
    const hoverStyles: React.CSSProperties = {};
    
    switch (variant) {
      case 'primary':
        Object.assign(hoverStyles, {
          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          borderColor: '#5a6fd8',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
        });
        break;
      case 'secondary':
        Object.assign(hoverStyles, {
          background: 'var(--theme-background-hover, #e6f7ff)',
          borderColor: 'var(--theme-primary, #1890ff)',
          color: 'var(--theme-primary, #1890ff)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)'
        });
        break;
      case 'success':
        Object.assign(hoverStyles, {
          background: 'linear-gradient(135deg, #48b018 0%, #2f7a0b 100%)',
          borderColor: '#48b018',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.4)'
        });
        break;
      case 'warning':
        Object.assign(hoverStyles, {
          background: 'linear-gradient(135deg, #e6a000 0%, #bf7a00 100%)',
          borderColor: '#e6a000',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(250, 173, 20, 0.4)'
        });
        break;
      case 'danger':
        Object.assign(hoverStyles, {
          background: 'linear-gradient(135deg, #e63946 0%, #a8071a 100%)',
          borderColor: '#e63946',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.4)'
        });
        break;
      case 'ghost':
        Object.assign(hoverStyles, {
          background: 'var(--theme-background-hover, rgba(24, 144, 255, 0.1))',
          borderColor: 'var(--theme-primary, #1890ff)',
          color: 'var(--theme-primary, #1890ff)',
          transform: 'translateY(-1px)'
        });
        break;
    }
    
    return hoverStyles;
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const buttonStyles = {
    ...getButtonStyles(),
    ...(isHovered ? getHoverStyles() : {}),
    ...(isActive ? { transform: 'translateY(0)' } : {})
  };

  return (
    <Button
      {...props}
      className={`custom-button custom-button-${variant} ${className}`}
      style={{
        ...buttonStyles,
        // Force white text for gradient buttons
        color: variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'danger' ? 'white !important' : buttonStyles.color,
        // Override Ant Design's default text color
        ['--ant-btn-color' as any]: variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'danger' ? 'white' : 'inherit',
        ['--ant-btn-text-color' as any]: variant === 'primary' || variant === 'success' || variant === 'warning' || variant === 'danger' ? 'white' : 'inherit'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center', color: 'white' }}>{icon}</span>}
      {children && <span style={{ whiteSpace: 'nowrap', color: 'white' }}>{children}</span>}
    </Button>
  );
};

export default CustomButton;
