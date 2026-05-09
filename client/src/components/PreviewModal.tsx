import { Modal, Button, Tag, Typography, Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { Component } from '../types/component';
import DownloadButton from './DownloadButton';

const { Text } = Typography;

interface Props {
  component: Component | null;
  visible: boolean;
  onClose: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function PreviewModal({
  component, visible, onClose, onPrev, onNext, hasPrev, hasNext,
}: Props) {
  if (!component) return null;

  const hasThumbnail = component.thumbnail_path && component.thumbnail_path.length > 0;
  const tags = component.tags
    ? component.tags.split(',').filter(Boolean).map((t) => t.trim())
    : [];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      destroyOnHidden
      title={component.name}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: '#f5f5f5',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          position: 'relative',
        }}>
          {hasThumbnail ? (
            <img
              src={`/api/components/${component.id}/thumbnail`}
              alt={component.name}
              style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }}
            />
          ) : (
            <Text type="secondary">无预览</Text>
          )}
          {hasPrev && onPrev && (
            <Button
              icon={<LeftOutlined />}
              shape="circle"
              onClick={onPrev}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
          )}
          {hasNext && onNext && (
            <Button
              icon={<RightOutlined />}
              shape="circle"
              onClick={onNext}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
          )}
        </div>

        <Space direction="vertical" size={8}>
          <div>
            <Text type="secondary">分类：</Text>
            <Text>{component.category} &gt; {component.subcategory}</Text>
          </div>
          {tags.length > 0 && (
            <div>
              <Text type="secondary">标签：</Text>
              {tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </Space>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DownloadButton component={component} />
        </div>
      </div>
    </Modal>
  );
}
