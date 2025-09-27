import React, { useState } from 'react';
import { Button, Dropdown, Flex, MenuProps, Modal, Tree, Input, Spin, Select } from 'antd';
import { FolderOutlined, PlusOutlined, EllipsisOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Collection, ApiRequest, TreeNode } from '../types';

interface SidebarProps {
  collections: Collection[];
  loading: boolean;
  onSelectRequest: (request: ApiRequest) => void;
  onAddRequest: (collectionKey: string, request: Omit<ApiRequest, 'key'>) => void;
  onRenameNode: (node: TreeNode, newName: string) => void;
  onDeleteNode: (node: TreeNode) => void;
}
const { Option } = Select;
export default function SidebarCollection({ collections, loading, onSelectRequest, onAddRequest, onRenameNode, onDeleteNode }: SidebarProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reqMethod, setReqMethod] = useState<ApiRequest['method']>('GET');
  const [muduleIsVisible, SetModuleIsVisible] = useState(false)
  const [modalConfig, setModalConfig] = useState<{ type: string; node: any; reqMethod : string,value: string }>({ type: '', node: null, reqMethod : 'GET' ,value: '' });

  const showModal = (type: string, node: any) => {
    setModalConfig({ type, node, reqMethod : reqMethod || 'GET' ,value: node?.title || '' });
    
    setIsModalVisible(true);
  };
  
  const handleModalOk = () => {
    if (!modalConfig.value) {
      return; // Prevent empty names
    }
    if (modalConfig.type === 'rename') {
      onRenameNode(modalConfig.node, modalConfig.value);
    } else if (modalConfig.type === 'addRequest') {
      onAddRequest(modalConfig.node.key, { title: modalConfig.value, method: reqMethod, url: modalConfig.node.url || '' });
    }
    setIsModalVisible(false);
  };

  const renderTreeNodes = (data: Collection[]) =>
    data.map((collection) => {

      const collectionMenuItems: MenuProps['items'] = [
        {
          key: 'add',
          icon: <PlusOutlined />,
          label: 'Add Request',
          onClick: () => showModal('addRequest', collection),
        },
        {
          key: 'rename',
          icon: <EditOutlined />,
          label: 'Rename',
          onClick: () => showModal('rename', { ...collection, type: 'collection' }),
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Delete',
          danger: true,
          onClick: () => onDeleteNode({ ...collection, type: 'collection' }),
        },
      ];

      return {
        key: collection.key,
        icon: <FolderOutlined />,
        title: (
          <Flex justify="space-between" align="center" style={{ width: '100%' }}>
            <span>{collection.title}</span>
            <Dropdown menu={{ items: collectionMenuItems }} trigger={['click']}>
              <Button type="text" size="small" icon={<EllipsisOutlined style={{ color: '#fe1a1aff' }} />} onClick={e => e.stopPropagation()} />
            </Dropdown>
          </Flex>
        ),
        children: collection.requests.map((request) => {
          // FIX: Use the modern antd v5 menu items API
          const requestMenuItems: MenuProps['items'] = [
            {
              key: 'rename',
              icon: <EditOutlined />,
              label: 'Rename',
              onClick: () => showModal('rename', { ...request, collectionKey: collection.key, type: 'request' }),
            },
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: 'Delete',
              danger: true,
              onClick: () => onDeleteNode({ ...request, collectionKey: collection.key, type: 'request' }),
            },
          ];
          return {
            // @ts-ignore
            ...request,
            // Ensure collectionKey is present on the node for selection persistence
            collectionKey: collection.key,
            key: request.key,
            isLeaf: true,
            // @ts-ignore
            title: ( // This JSX title will now correctly overwrite the string title from `...request`
              <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                <span  style={{ flex: 1,  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span style={{ color: request.method === 'POST' ? '#ff9f43' : '#45aaf2', marginRight: 8, fontWeight: 'bold' }}>{request.method}</span>
                  {request.title}
                </span>
                <Dropdown menu={{ items: requestMenuItems }} trigger={['click']}>
                  <Button type="text" size="small" icon={<EllipsisOutlined style={{ color: '#fe1a1aff' }} />} onClick={e => e.stopPropagation()} />
                </Dropdown>
              </Flex>
            ),

          };


        }),
      };
    });

  if (loading) {
    return <Flex align="center" justify="center" style={{ height: '100%' }}><Spin tip="Loading Collections..." /></Flex>;
  }

  return (
    <>
      <Tree
        showIcon
        showLine
        defaultExpandAll
        onSelect={(_, { node }) => {
          if (node.isLeaf) onSelectRequest(
            // @ts-ignore
            node as ApiRequest)
        }}
        treeData={renderTreeNodes(collections)}
        blockNode
        className="cool-tree"
      />

      <Modal
        title={`${modalConfig.type === 'rename' ? 'Rename' : 'Add New Request'}`}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={modalConfig.value}
          onChange={e => setModalConfig(prev => ({ ...prev, value: e.target.value }))}
          onPressEnter={handleModalOk}
        />

         <Select value={reqMethod} onChange={setReqMethod} style={{ width: 120 }}>
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>

      </Modal>
    </>
  );
}
