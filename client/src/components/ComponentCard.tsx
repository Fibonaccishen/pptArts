import { Card, Typography } from 'antd';
import type { Component } from '../types/component';

const { Text } = Typography;

interface Props {
  component: Component;
  onClick: () => void;
}

export default function ComponentCard({ component, onClick }: Props) {
  const hasThumbnail = component.thumbnail_path && component.thumbnail_path.length > 0;

  return (
    <Card
      hoverable
      onClick={onClick}
      cover={
        <div style={{
          aspectRatio: '4/3',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
        }}>
          {hasThumbnail ? (
            <img
              src={`/api/components/${component.id}/thumbnail`}
              alt={component.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          ) : (
            <Text type="secondary">无预览</Text>
          )}
        </div>
      }
      styles={{ body: { padding: '8px 12px' } }}
    >
      <Text ellipsis style={{ fontSize: 13 }}>{component.name}</Text>
    </Card>
  );
}
