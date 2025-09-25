import React, { useState } from 'react';
import { List, Button, Tag, Input, Modal, Popconfirm, Empty } from 'antd';
import { StarFilled, StarOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { ApiRequest } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';

interface BookmarksPanelProps {
  onSelectRequest: (request: ApiRequest) => void;
  className?: string;
}

export default function BookmarksPanel({ onSelectRequest, className }: BookmarksPanelProps) {
  const { bookmarks, removeBookmark, updateBookmarkTags, clearAllBookmarks } = useBookmarks();
  const [searchText, setSearchText] = useState('');
  const [editingBookmark, setEditingBookmark] = useState<ApiRequest | null>(null);
  const [editingTags, setEditingTags] = useState<string>('');

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const searchLower = searchText.toLowerCase();
    return (
      bookmark.name.toLowerCase().includes(searchLower) ||
      bookmark.url.toLowerCase().includes(searchLower) ||
      bookmark.method.toLowerCase().includes(searchLower) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const handleEditTags = (bookmark: ApiRequest) => {
    setEditingBookmark(bookmark);
    setEditingTags(bookmark.tags?.join(', ') || '');
  };

  const handleSaveTags = () => {
    if (editingBookmark) {
      const tags = editingTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      updateBookmarkTags(editingBookmark, tags);
      setEditingBookmark(null);
      setEditingTags('');
    }
  };

  const handleRemoveBookmark = (bookmark: ApiRequest) => {
    removeBookmark(bookmark);
  };

  const handleClearAll = () => {
    clearAllBookmarks();
  };

  return (
    <div className={className}>
      <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: 'var(--theme-text)' }}>Bookmarks</h3>
          {bookmarks.length > 0 && (
            <Popconfirm
              title="Clear all bookmarks?"
              onConfirm={handleClearAll}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Clear All
              </Button>
            </Popconfirm>
          )}
        </div>
        
        <Input
          placeholder="Search bookmarks..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
        />
      </div>

      {filteredBookmarks.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Empty 
            description={bookmarks.length === 0 ? "No bookmarks yet" : "No matching bookmarks"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <List
          size="small"
          dataSource={filteredBookmarks}
          renderItem={(bookmark) => (
            <List.Item
              style={{ 
                padding: '8px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5'
              }}
              onClick={() => onSelectRequest(bookmark)}
              actions={[
                <Button
                  key="edit"
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTags(bookmark);
                  }}
                />,
                <Button
                  key="remove"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBookmark(bookmark);
                  }}
                />
              ]}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag color={
                      bookmark.method === 'GET' ? 'blue' :
                      bookmark.method === 'POST' ? 'green' :
                      bookmark.method === 'PUT' ? 'orange' :
                      bookmark.method === 'DELETE' ? 'red' : 'default'
                    }>
                      {bookmark.method}
                    </Tag>
                    <span style={{ 
                      fontWeight: 500, 
                      color: 'var(--theme-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 200
                    }}>
                      {bookmark.name}
                    </span>
                  </div>
                }
                description={
                  <div>
                    <div style={{ 
                      fontSize: 12, 
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {bookmark.url}
                    </div>
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        {bookmark.tags.map((tag, index) => (
                          <Tag key={index} size="small" color="purple">
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {/* Edit Tags Modal */}
      <Modal
        title="Edit Tags"
        open={!!editingBookmark}
        onOk={handleSaveTags}
        onCancel={() => {
          setEditingBookmark(null);
          setEditingTags('');
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <strong>Request:</strong> {editingBookmark?.method} {editingBookmark?.name}
        </div>
        <Input
          placeholder="Enter tags separated by commas"
          value={editingTags}
          onChange={(e) => setEditingTags(e.target.value)}
        />
        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
          Example: api, testing, production
        </div>
      </Modal>
    </div>
  );
}
