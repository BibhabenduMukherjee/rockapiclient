import React, { useState } from 'react';
import { List, Button, Tag, Input, Modal, Popconfirm, Empty } from 'antd';
import { StarFilled, StarOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { ApiRequest } from '../types';

interface BookmarkedRequest extends ApiRequest {
  bookmarkedAt: number;
  tags?: string[];
}

interface BookmarksPanelProps {
  onSelectRequest: (request: ApiRequest) => void;
  className?: string;
  bookmarks: BookmarkedRequest[];
  removeBookmark: (request: ApiRequest) => void;
  updateBookmarkTags: (request: ApiRequest, tags: string[]) => void;
  clearAllBookmarks: () => void;
}

export default function BookmarksPanel({ 
  onSelectRequest, 
  className, 
  bookmarks, 
  removeBookmark, 
  updateBookmarkTags, 
  clearAllBookmarks 
}: BookmarksPanelProps) {
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
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid var(--theme-border)',
        background: 'var(--theme-surface)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <h3 style={{ 
            margin: 0, 
            color: 'var(--theme-text)',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Bookmarks
          </h3>
          {bookmarks.length > 0 && (
            <Popconfirm
              title="Clear all bookmarks?"
              onConfirm={handleClearAll}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />}
                style={{
                  background: 'var(--theme-background)',
                  border: '1px solid var(--theme-border)',
                  color: 'var(--theme-text)'
                }}
              >
                Clear All
              </Button>
            </Popconfirm>
          )}
        </div>
        
        <div style={{ position: 'relative' }}>
          <Input
            placeholder="Search bookmarks..."
            prefix={<SearchOutlined style={{ color: 'var(--theme-text-secondary)' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            style={{
              height: '44px',
              background: 'var(--theme-background)',
              border: '2px solid var(--theme-border)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--theme-text)',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--theme-primary)';
              e.target.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--theme-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchText && (
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--theme-primary)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {filteredBookmarks.length} found
            </div>
          )}
        </div>
      </div>

      {filteredBookmarks.length === 0 ? (
        <div style={{ 
          padding: '40px 24px', 
          textAlign: 'center',
          background: 'var(--theme-background)'
        }}>
          <Empty 
            description={
              <span style={{ color: 'var(--theme-text-secondary)' }}>
                {bookmarks.length === 0 ? "No bookmarks yet" : "No matching bookmarks"}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <div style={{ 
          background: 'var(--theme-background)',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }}>
          <List
            size="small"
            dataSource={filteredBookmarks}
            renderItem={(bookmark) => (
              <List.Item
                style={{ 
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--theme-border)',
                  background: 'var(--theme-background)',
                  transition: 'all 0.2s ease',
                  margin: '0 8px',
                  borderRadius: '6px',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--theme-surface)';
                  e.currentTarget.style.borderColor = 'var(--theme-primary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--theme-background)';
                  e.currentTarget.style.borderColor = 'var(--theme-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => onSelectRequest(bookmark)}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    style={{
                      color: 'var(--theme-text-secondary)',
                      border: 'none',
                      background: 'transparent'
                    }}
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
                    style={{
                      color: 'var(--theme-text-secondary)',
                      border: 'none',
                      background: 'transparent'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBookmark(bookmark);
                    }}
                  />
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Tag 
                        color={
                          bookmark.method === 'GET' ? 'blue' :
                          bookmark.method === 'POST' ? 'green' :
                          bookmark.method === 'PUT' ? 'orange' :
                          bookmark.method === 'DELETE' ? 'red' : 'default'
                        }
                        style={{
                          fontWeight: '600',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {bookmark.method}
                      </Tag>
                      <span style={{ 
                        fontWeight: 600, 
                        color: 'var(--theme-text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                        fontSize: '14px'
                      }}>
                        {bookmark.name}
                      </span>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ 
                        fontSize: 13, 
                        color: 'var(--theme-text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'monospace',
                        background: 'var(--theme-surface)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--theme-border)'
                      }}>
                        {bookmark.url}
                      </div>
                      {bookmark.tags && bookmark.tags.length > 0 && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {bookmark.tags.map((tag, index) => (
                            <Tag 
                              key={index} 
                              size="small" 
                              color="purple"
                              style={{
                                background: 'var(--theme-primary)',
                                color: 'white',
                                border: 'none',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '3px'
                              }}
                            >
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
        </div>
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
