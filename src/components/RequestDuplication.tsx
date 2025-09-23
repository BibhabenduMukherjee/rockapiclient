import React, { useState } from 'react';
import { Button, Modal, Input, Form, message, Space, Typography } from 'antd';
import { CopyOutlined, PlusOutlined } from '@ant-design/icons';
import { ApiRequest } from '../types';

const { Text } = Typography;

interface RequestDuplicationProps {
  request: ApiRequest;
  onDuplicate: (newRequest: ApiRequest) => void;
  disabled?: boolean;
}

export default function RequestDuplication({ request, onDuplicate, disabled = false }: RequestDuplicationProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleDuplicate = () => {
    setIsModalVisible(true);
    // Pre-fill form with current request name + "Copy"
    form.setFieldsValue({
      name: `${request.name} Copy`,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Create new request with modified name
      const duplicatedRequest: ApiRequest = {
        ...request,
        name: values.name,
        // Reset any request-specific state
        id: undefined, // Let the collection system generate new ID
      };

      onDuplicate(duplicatedRequest);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Request duplicated successfully');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Button
        type="text"
        icon={<CopyOutlined />}
        onClick={handleDuplicate}
        disabled={disabled}
        title="Duplicate this request"
        size="small"
      >
        Duplicate
      </Button>

      <Modal
        title="Duplicate Request"
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Duplicate"
        cancelText="Cancel"
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="New Request Name"
            rules={[
              { required: true, message: 'Please enter a name for the duplicated request' },
              { min: 1, message: 'Name must not be empty' },
              { max: 100, message: 'Name must be less than 100 characters' }
            ]}
          >
            <Input placeholder="Enter name for duplicated request" />
          </Form.Item>
          
          <div style={{ 
            padding: 12, 
            background: '#f5f5f5', 
            borderRadius: 4, 
            marginTop: 8 
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Original:</strong> {request.name}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              <strong>Method:</strong> {request.method} | <strong>URL:</strong> {request.url}
            </Text>
          </div>
        </Form>
      </Modal>
    </>
  );
}
