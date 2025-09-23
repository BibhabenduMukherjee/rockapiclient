import React, { useState } from 'react';
import { Modal, Select, Slider, InputNumber, Button, Space, Typography, Card, ColorPicker, Divider, Row, Col } from 'antd';
import { BgColorsOutlined, UndoOutlined, SaveOutlined } from '@ant-design/icons';
import { useTheme, Theme } from '../hooks/useTheme';

const { Text, Title } = Typography;
const { Option } = Select;

interface ThemeSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeSettings({ visible, onClose }: ThemeSettingsProps) {
  const { settings, themes, currentTheme, setTheme, setCustomTheme, updateSettings, resetToDefault } = useTheme();
  const [customColors, setCustomColors] = useState(currentTheme.colors);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    setIsCustomizing(false);
  };

  const handleColorChange = (colorKey: string, color: string) => {
    const newColors = { ...customColors, [colorKey]: color };
    setCustomColors(newColors);
  };

  const handleSaveCustomTheme = () => {
    const customTheme: Theme = {
      ...currentTheme,
      colors: customColors
    };
    setCustomTheme(customTheme);
    setIsCustomizing(false);
  };

  const handleResetCustom = () => {
    setCustomColors(currentTheme.colors);
  };

  const handleSettingsChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <Modal
      title={
        <Space>
          <BgColorsOutlined />
          Theme & Appearance
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{ top: 50 }}
    >
      <div style={{ maxHeight: 600, overflowY: 'auto' }}>
        {/* Theme Selection */}
        <Card title="Theme" size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Select Theme:</Text>
              <Select
                value={settings.currentTheme}
                onChange={handleThemeChange}
                style={{ width: '100%', marginTop: 8 }}
              >
                {themes.map(theme => (
                  <Option key={theme.name} value={theme.name}>
                    <Space>
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 2,
                          backgroundColor: theme.colors.primary,
                          border: `1px solid ${theme.colors.border}`
                        }}
                      />
                      {theme.displayName}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
            
            <Button
              type="dashed"
              onClick={() => setIsCustomizing(!isCustomizing)}
              style={{ width: '100%' }}
            >
              {isCustomizing ? 'Hide Customization' : 'Customize Colors'}
            </Button>
          </Space>
        </Card>

        {/* Custom Color Customization */}
        {isCustomizing && (
          <Card title="Customize Colors" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              {Object.entries(currentTheme.colors).map(([key, value]) => (
                <Col span={12} key={key}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ColorPicker
                      value={customColors[key as keyof typeof customColors]}
                      onChange={(color) => handleColorChange(key, color.toHexString())}
                      size="small"
                    />
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {customColors[key as keyof typeof customColors]}
                      </Text>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            
            <Divider />
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveCustomTheme}
              >
                Save Custom Theme
              </Button>
              <Button
                icon={<UndoOutlined />}
                onClick={handleResetCustom}
              >
                Reset
              </Button>
            </Space>
          </Card>
        )}

        {/* Layout Settings */}
        <Card title="Layout" size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Font Size: {settings.fontSize}px</Text>
              <Slider
                min={12}
                max={20}
                value={settings.fontSize}
                onChange={(value) => handleSettingsChange('fontSize', value)}
                style={{ marginTop: 8 }}
              />
            </div>
            
            <div>
              <Text strong>Sidebar Width: {settings.sidebarWidth}px</Text>
              <Slider
                min={250}
                max={400}
                value={settings.sidebarWidth}
                onChange={(value) => handleSettingsChange('sidebarWidth', value)}
                style={{ marginTop: 8 }}
              />
            </div>
            
            <div>
              <Text strong>Border Radius: {settings.borderRadius}px</Text>
              <Slider
                min={0}
                max={12}
                value={settings.borderRadius}
                onChange={(value) => handleSettingsChange('borderRadius', value)}
                style={{ marginTop: 8 }}
              />
            </div>
            
            <div>
              <Text strong>Spacing: {settings.spacing}px</Text>
              <Slider
                min={8}
                max={24}
                value={settings.spacing}
                onChange={(value) => handleSettingsChange('spacing', value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        </Card>

        {/* Preview */}
        <Card title="Preview" size="small">
          <div
            style={{
              padding: settings.spacing,
              backgroundColor: currentTheme.colors.background,
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: settings.borderRadius,
              fontSize: settings.fontSize,
              fontFamily: currentTheme.fonts.family
            }}
          >
            <div style={{ color: currentTheme.colors.text }}>
              <Text strong style={{ color: currentTheme.colors.primary }}>
                Sample Request
              </Text>
            </div>
            <div style={{ marginTop: 8, color: currentTheme.colors.textSecondary }}>
              GET https://api.example.com/users
            </div>
            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  padding: '2px 8px',
                  backgroundColor: currentTheme.colors.success,
                  color: 'white',
                  borderRadius: settings.borderRadius / 2,
                  fontSize: settings.fontSize - 2
                }}
              >
                200 OK
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Divider />
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={resetToDefault}>
            Reset to Default
          </Button>
          <Button type="primary" onClick={onClose}>
            Done
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
