import React from 'react';
import { Modal, Row, Col, Card, Typography, Button } from 'antd';
import { SmileOutlined, HeartOutlined, BulbOutlined, FireOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface MoodSelectorProps {
  visible: boolean;
  onSelectMood: (mood: string) => void;
  onClose: () => void;
}

const moods = [
  {
    id: 'mood-ocean',
    name: 'Ocean Breeze',
    emoji: '🌊',
    icon: <SmileOutlined style={{ fontSize: '24px' }} />,
    description: 'Cool and refreshing',
    colors: ['#0077be', '#00a8cc', '#f0f9ff']
  },
  {
    id: 'mood-calm',
    name: 'Zen Garden',
    emoji: '🌿',
    icon: <HeartOutlined style={{ fontSize: '24px' }} />,
    description: 'Peaceful and serene',
    colors: ['#4a6741', '#6b8e6b', '#f1f8e9']
  },
  {
    id: 'mood-lavender',
    name: 'Lavender Fields',
    emoji: '💜',
    icon: <BulbOutlined style={{ fontSize: '24px' }} />,
    description: 'Elegant and sophisticated',
    colors: ['#8b5cf6', '#a855f7', '#faf5ff']
  },
  {
    id: 'mood-sunset',
    name: 'Sunset Glow',
    emoji: '🌅',
    icon: <FireOutlined style={{ fontSize: '24px' }} />,
    description: 'Warm and inspiring',
    colors: ['#f59e0b', '#ea580c', '#fffbeb']
  }
];

export default function MoodSelector({ visible, onSelectMood, onClose }: MoodSelectorProps) {
  const handleMoodSelect = (moodId: string) => {
    onSelectMood(moodId);
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={2} style={{ margin: 0, color: 'var(--theme-text)' }}>
            What's your mood today? 😊
          </Title>
          <Text style={{ color: 'var(--theme-textSecondary)', fontSize: '16px' }}>
            Choose a theme that matches your current vibe
          </Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Button 
            icon={<CloseOutlined />}
            onClick={onClose}
            size="large"
            style={{ 
              minWidth: '120px',
              borderRadius: '8px'
            }}
          >
            Maybe Later
          </Button>
        </div>
      }
      width={600}
      centered
      closable={true}
      maskClosable={true}
    >
      <div style={{ padding: '20px 0' }}>
        <Row gutter={[16, 16]}>
          {moods.map((mood) => (
            <Col span={12} key={mood.id}>
              <Card
                hoverable
                onClick={() => handleMoodSelect(mood.id)}
                style={{
                  height: '140px',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  background: `linear-gradient(135deg, ${mood.colors[2]} 0%, ${mood.colors[1]}20 100%)`
                }}
                bodyStyle={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '16px'
                }}
              >
                <div style={{ 
                  fontSize: '32px', 
                  marginBottom: '8px',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                  {mood.emoji}
                </div>
                <Title level={4} style={{ 
                  margin: '0 0 4px 0', 
                  color: mood.colors[0],
                  textAlign: 'center'
                }}>
                  {mood.name}
                </Title>
                <Text style={{ 
                  color: 'var(--theme-textSecondary)', 
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  {mood.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          padding: '16px',
          background: 'var(--theme-surface)',
          borderRadius: '8px',
          border: '1px solid var(--theme-border)'
        }}>
          <Text style={{ color: 'var(--theme-textSecondary)', fontSize: '14px' }}>
            💡 You can always change your mood later in Theme Settings
          </Text>
        </div>
      </div>
    </Modal>
  );
}
