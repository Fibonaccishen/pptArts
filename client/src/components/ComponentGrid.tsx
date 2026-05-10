import { Empty, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { Component } from '../types/component';
import ComponentCard from './ComponentCard';

const CARD_WIDTH = 200;

interface Props {
  items: Component[];
  loading: boolean;
  onCardClick: (comp: Component, index: number) => void;
  emptyText?: string;
}

export default function ComponentGrid({ items, loading, onCardClick, emptyText }: Props) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty
        image={<InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description={emptyText || '暂无组件，请导入'}
        style={{ padding: 64 }}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 16,
    }}>
      {items.map((comp, index) => (
        <div key={comp.id} style={{ width: CARD_WIDTH }}>
          <ComponentCard
            component={comp}
            onClick={() => onCardClick(comp, index)}
          />
        </div>
      ))}
    </div>
  );
}
