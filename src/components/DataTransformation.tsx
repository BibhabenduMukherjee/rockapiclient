import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Switch, 
  Input, 
  Select, 
  Space, 
  Collapse, 
  Typography, 
  Row, 
  Col, 
  Tag, 
  message,
  Modal,
  Form,
  InputNumber,
  Divider
} from 'antd';
import { 
  SettingOutlined, 
  PlayCircleOutlined, 
  UndoOutlined, 
  CopyOutlined,
  DownloadOutlined,
  FilterOutlined,
  FormatPainterOutlined,
  ExportOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { 
  TransformationRule, 
  applyTransformations, 
  TRANSFORMATION_TEMPLATES,
  formatJson,
  minifyJson,
  filterJsonKeys,
  extractFields,
  replaceText,
  jsonToCsv,
  jsonToXml
} from '../utils/dataTransformation';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

interface DataTransformationProps {
  responseData: string;
  onTransformedData: (data: string) => void;
  className?: string;
}

export default function DataTransformation({ 
  responseData, 
  onTransformedData, 
  className 
}: DataTransformationProps) {
  const [rules, setRules] = useState<TransformationRule[]>([]);
  const [transformedData, setTransformedData] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<TransformationRule | null>(null);
  const [form] = Form.useForm();

  // Initialize with templates
  useEffect(() => {
    setRules([...TRANSFORMATION_TEMPLATES]);
  }, []);

  // Apply transformations when rules or data change
  useEffect(() => {
    if (responseData && rules.length > 0) {
      const result = applyTransformations(responseData, rules);
      setTransformedData(result.transformedData);
      onTransformedData(result.transformedData);
      
      if (result.errors.length > 0) {
        message.error(`Transformation errors: ${result.errors.join(', ')}`);
      }
    } else {
      setTransformedData(responseData);
      onTransformedData(responseData);
    }
  }, [responseData, rules, onTransformedData]);

  const handleRuleToggle = (ruleId: string, enabled: boolean) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled } : rule
    ));
  };

  const handleAddRule = () => {
    setEditingRule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditRule = (rule: TransformationRule) => {
    setEditingRule(rule);
    form.setFieldsValue(rule);
    setIsModalVisible(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    message.success('Rule deleted');
  };

  const handleSaveRule = (values: any) => {
    const newRule: TransformationRule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      name: values.name,
      type: values.type,
      enabled: values.enabled || false,
      config: values.config || {}
    };

    if (editingRule) {
      setRules(prev => prev.map(rule => 
        rule.id === editingRule.id ? newRule : rule
      ));
    } else {
      setRules(prev => [...prev, newRule]);
    }

    setIsModalVisible(false);
    setEditingRule(null);
    form.resetFields();
    message.success('Rule saved');
  };

  const handleReset = () => {
    setTransformedData(responseData);
    onTransformedData(responseData);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transformedData);
    message.success('Transformed data copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([transformedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformed-data.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'format': return <FormatPainterOutlined />;
      case 'filter': return <FilterOutlined />;
      case 'extract': return <ExportOutlined />;
      default: return <SettingOutlined />;
    }
  };

  const getRuleDescription = (rule: TransformationRule) => {
    switch (rule.type) {
      case 'format':
        return rule.config.action === 'beautify' ? 'Beautify JSON' : 'Minify JSON';
      case 'filter':
        return `Filter keys: ${rule.config.includeKeys?.join(', ') || 'all'}`;
      case 'extract':
        return `Extract: ${rule.config.fields?.join(', ') || 'none'}`;
      case 'replace':
        return `Replace: ${rule.config.search} → ${rule.config.replace}`;
      default:
        return 'Custom transformation';
    }
  };

  return (
    <div className={className}>
      <Collapse
        size="small"
        items={[
          {
            key: 'data-transformation',
            label: (
              <Space>
                <ToolOutlined />
                <Text strong style={{ fontSize: '13px' }}>
                  Data Transformation
                </Text>
                <Tag color="blue" size="small">
                  {rules.filter(r => r.enabled).length} active
                </Tag>
              </Space>
            ),
            children: (
              <div>
                {/* Quick Actions */}
                <div style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <Button 
                      size="small" 
                      icon={<PlayCircleOutlined />}
                      onClick={() => {
                        const result = applyTransformations(responseData, rules);
                        setTransformedData(result.transformedData);
                        onTransformedData(result.transformedData);
                      }}
                    >
                      Apply
                    </Button>
                    <Button 
                      size="small" 
                      icon={<UndoOutlined />}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                    <Button 
                      size="small" 
                      icon={<CopyOutlined />}
                      onClick={handleCopy}
                    >
                      Copy
                    </Button>
                    <Button 
                      size="small" 
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                    >
                      Download
                    </Button>
                    <Button 
                      size="small" 
                      type="dashed"
                      onClick={handleAddRule}
                    >
                      + Add Rule
                    </Button>
                  </Space>
                </div>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Title level={5} style={{ margin: '0 0 12px 0' }}>Transformation Rules</Title>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        {rules.map(rule => (
                          <Card 
                            key={rule.id} 
                            size="small"
                            style={{ 
                              border: rule.enabled ? '1px solid #1890ff' : '1px solid #d9d9d9',
                              backgroundColor: rule.enabled ? '#f6ffed' : 'transparent'
                            }}
                          >
                            <Row justify="space-between" align="middle">
                              <Col flex="auto">
                                <Space>
                                  {getRuleIcon(rule.type)}
                                  <div>
                                    <Text strong style={{ fontSize: '12px' }}>{rule.name}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                      {getRuleDescription(rule)}
                                    </Text>
                                  </div>
                                </Space>
                              </Col>
                              <Col>
                                <Space size="small">
                                  <Switch 
                                    size="small"
                                    checked={rule.enabled}
                                    onChange={(checked) => handleRuleToggle(rule.id, checked)}
                                  />
                                  <Button 
                                    size="small" 
                                    type="text"
                                    onClick={() => handleEditRule(rule)}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    size="small" 
                                    type="text" 
                                    danger
                                    onClick={() => handleDeleteRule(rule.id)}
                                  >
                                    Delete
                                  </Button>
                                </Space>
                              </Col>
                            </Row>
                          </Card>
                        ))}
                      </Space>
                    </div>
                  </Col>
                  
                  <Col span={12}>
                    <Title level={5} style={{ margin: '0 0 12px 0' }}>Transformed Data</Title>
                    <TextArea
                      value={transformedData}
                      readOnly
                      placeholder="Transformed data will appear here..."
                      style={{ 
                        height: '300px',
                        fontFamily: 'monospace',
                        fontSize: '12px'
                      }}
                    />
                  </Col>
                </Row>
              </div>
            )
          }
        ]}
      />

      {/* Rule Editor Modal */}
      <Modal
        title={editingRule ? 'Edit Rule' : 'Add Transformation Rule'}
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRule(null);
          form.resetFields();
        }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRule}
        >
          <Form.Item
            name="name"
            label="Rule Name"
            rules={[{ required: true, message: 'Please enter rule name' }]}
          >
            <Input placeholder="Enter rule name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Transformation Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select transformation type">
              <Option value="format">Format (Beautify/Minify)</Option>
              <Option value="filter">Filter Keys</Option>
              <Option value="extract">Extract Fields</Option>
              <Option value="replace">Replace Text</Option>
              <Option value="custom">Custom Function</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="enabled"
            label="Enabled"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider>Configuration</Divider>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              
              if (type === 'format') {
                return (
                  <>
                    <Form.Item
                      name={['config', 'action']}
                      label="Action"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Option value="beautify">Beautify JSON</Option>
                        <Option value="minify">Minify JSON</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name={['config', 'indent']}
                      label="Indent Size"
                    >
                      <InputNumber min={1} max={8} defaultValue={2} />
                    </Form.Item>
                  </>
                );
              }
              
              if (type === 'filter') {
                return (
                  <>
                    <Form.Item
                      name={['config', 'includeKeys']}
                      label="Include Keys (comma-separated)"
                    >
                      <Input placeholder="id,name,email" />
                    </Form.Item>
                    <Form.Item
                      name={['config', 'excludeKeys']}
                      label="Exclude Keys (comma-separated)"
                    >
                      <Input placeholder="password,token,secret" />
                    </Form.Item>
                  </>
                );
              }
              
              if (type === 'extract') {
                return (
                  <Form.Item
                    name={['config', 'fields']}
                    label="Fields to Extract (comma-separated)"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="id,name,user.email" />
                  </Form.Item>
                );
              }
              
              if (type === 'replace') {
                return (
                  <>
                    <Form.Item
                      name={['config', 'search']}
                      label="Search Pattern"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter search pattern" />
                    </Form.Item>
                    <Form.Item
                      name={['config', 'replace']}
                      label="Replace With"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Enter replacement text" />
                    </Form.Item>
                    <Form.Item
                      name={['config', 'useRegex']}
                      label="Use Regular Expression"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </>
                );
              }
              
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
