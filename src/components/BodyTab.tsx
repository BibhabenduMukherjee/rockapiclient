import React, { useState, useEffect } from 'react';
import { Radio, Input, Select, Button, Space, Typography, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export type BodyType = 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

export type RawBodyType = 'text' | 'json' | 'javascript' | 'html' | 'xml';

export interface FormDataItem {
  key: string;
  value: string | File;
  type: 'text' | 'file';
  enabled: boolean;
}

interface BodyTabProps {
  bodyType: BodyType;
  rawBodyType: RawBodyType;
  rawBody: string;
  formData: FormDataItem[];
  urlEncoded: FormDataItem[];
  onChange: (config: {
    bodyType: BodyType;
    rawBodyType: RawBodyType;
    rawBody: string;
    formData: FormDataItem[];
    urlEncoded: FormDataItem[];
  }) => void;
}

export default function BodyTab({ 
  bodyType, 
  rawBodyType, 
  rawBody, 
  formData, 
  urlEncoded, 
  onChange 
}: BodyTabProps) {
  const [config, setConfig] = useState({
    bodyType,
    rawBodyType,
    rawBody,
    formData,
    urlEncoded,
  });

  useEffect(() => {
    setConfig({ bodyType, rawBodyType, rawBody, formData, urlEncoded });
  }, [bodyType, rawBodyType, rawBody, formData, urlEncoded]);

  const updateConfig = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const updateFormData = (index: number, field: keyof FormDataItem, value: string | boolean) => {
    const newFormData = [...config.formData];
    newFormData[index] = { ...newFormData[index], [field]: value };
    updateConfig({ formData: newFormData });
  };

  const addFormDataItem = () => {
    const newItem: FormDataItem = {
      key: '',
      value: '',
      type: 'text',
      enabled: true,
    };
    updateConfig({ formData: [...config.formData, newItem] });
  };

  const removeFormDataItem = (index: number) => {
    const newFormData = config.formData.filter((_, i) => i !== index);
    updateConfig({ formData: newFormData });
  };

  const updateUrlEncoded = (index: number, field: keyof FormDataItem, value: string | boolean) => {
    const newUrlEncoded = [...config.urlEncoded];
    newUrlEncoded[index] = { ...newUrlEncoded[index], [field]: value };
    updateConfig({ urlEncoded: newUrlEncoded });
  };

  const addUrlEncodedItem = () => {
    const newItem: FormDataItem = {
      key: '',
      value: '',
      type: 'text',
      enabled: true,
    };
    updateConfig({ urlEncoded: [...config.urlEncoded, newItem] });
  };

  const removeUrlEncodedItem = (index: number) => {
    const newUrlEncoded = config.urlEncoded.filter((_, i) => i !== index);
    updateConfig({ urlEncoded: newUrlEncoded });
  };

  const renderFormData = () => (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Form Data</Text>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addFormDataItem} size="small">
          Add Field
        </Button>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {config.formData.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 8, 
            padding: 8, 
            border: '1px solid #f0f0f0', 
            borderRadius: 4,
            backgroundColor: item.enabled ? '#fff' : '#f5f5f5'
          }}>
            <Input
              placeholder="Key"
              value={item.key}
              onChange={(e) => updateFormData(index, 'key', e.target.value)}
              style={{ flex: 1 }}
              disabled={!item.enabled}
            />
            <Select
              value={item.type}
              onChange={(value) => updateFormData(index, 'type', value)}
              style={{ width: 100 }}
              disabled={!item.enabled}
            >
              <Option value="text">Text</Option>
              <Option value="file">File</Option>
            </Select>
            {item.type === 'text' ? (
              <Input
                placeholder="Value"
                value={item.value}
                onChange={(e) => updateFormData(index, 'value', e.target.value)}
                style={{ flex: 2 }}
                disabled={!item.enabled}
              />
            ) : (
              <div style={{ flex: 2, display: 'flex', alignItems: 'center' }}>
                <input
                  type="file"
                  id={`file-${index}`}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      updateFormData(index, 'value', file);
                    }
                  }}
                  disabled={!item.enabled}
                />
                <Button 
                  onClick={() => document.getElementById(`file-${index}`)?.click()}
                  disabled={!item.enabled}
                  style={{ flex: 1 }}
                >
                  {item.value instanceof File ? item.value.name : (item.value || 'Choose File')}
                </Button>
              </div>
            )}
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeFormDataItem(index)}
              danger
              size="small"
            />
          </div>
        ))}
        {config.formData.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 24, 
            color: '#999',
            border: '1px dashed #d9d9d9',
            borderRadius: 4
          }}>
            No form data added. Click "Add Field" to add form data.
          </div>
        )}
      </div>
    </div>
  );

  const renderUrlEncoded = () => (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>URL Encoded</Text>
        <Button type="dashed" icon={<PlusOutlined />} onClick={addUrlEncodedItem} size="small">
          Add Field
        </Button>
      </div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {config.urlEncoded.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            gap: 8, 
            marginBottom: 8, 
            padding: 8, 
            border: '1px solid #f0f0f0', 
            borderRadius: 4,
            backgroundColor: item.enabled ? '#fff' : '#f5f5f5'
          }}>
            <Input
              placeholder="Key"
              value={item.key}
              onChange={(e) => updateUrlEncoded(index, 'key', e.target.value)}
              style={{ flex: 1 }}
              disabled={!item.enabled}
            />
            <Input
              placeholder="Value"
              value={item.value}
              onChange={(e) => updateUrlEncoded(index, 'value', e.target.value)}
              style={{ flex: 2 }}
              disabled={!item.enabled}
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => removeUrlEncodedItem(index)}
              danger
              size="small"
            />
          </div>
        ))}
        {config.urlEncoded.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 24, 
            color: '#999',
            border: '1px dashed #d9d9d9',
            borderRadius: 4
          }}>
            No URL encoded data added. Click "Add Field" to add data.
          </div>
        )}
      </div>
    </div>
  );

  const renderRaw = () => (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Raw Body</Text>
        <Select
          value={config.rawBodyType}
          onChange={(value) => updateConfig({ rawBodyType: value })}
          style={{ width: 120 }}
        >
          <Option value="text">Text</Option>
          <Option value="json">JSON</Option>
          <Option value="javascript">JavaScript</Option>
          <Option value="html">HTML</Option>
          <Option value="xml">XML</Option>
        </Select>
      </div>
      <TextArea
        value={config.rawBody}
        onChange={(e) => updateConfig({ rawBody: e.target.value })}
        placeholder={`Enter ${config.rawBodyType} content...`}
        rows={12}
        style={{ fontFamily: config.rawBodyType === 'json' ? 'JetBrains Mono, Fira Code, Cascadia Code, SF Mono, Monaco, Inconsolata, Roboto Mono, Source Code Pro, monospace' : 'inherit' }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Body Type</Text>
        <Radio.Group
          value={config.bodyType}
          onChange={(e) => updateConfig({ bodyType: e.target.value })}
          style={{ marginTop: 8, display: 'block' }}
        >
          <Space direction="vertical">
            <Radio value="none">None</Radio>
            <Radio value="form-data">Form Data</Radio>
            <Radio value="x-www-form-urlencoded">URL Encoded</Radio>
            <Radio value="raw">Raw</Radio>
          </Space>
        </Radio.Group>
      </div>

      {config.bodyType === 'form-data' && renderFormData()}
      {config.bodyType === 'x-www-form-urlencoded' && renderUrlEncoded()}
      {config.bodyType === 'raw' && renderRaw()}
      {config.bodyType === 'none' && (
        <div style={{ 
          textAlign: 'center', 
          padding: 24, 
          color: '#999',
          border: '1px dashed #d9d9d9',
          borderRadius: 4
        }}>
          No body will be sent with this request.
        </div>
      )}
    </div>
  );
}
