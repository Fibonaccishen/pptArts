import { Row, Col, Empty, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { Component } from '../types/component';
import ComponentCard from './ComponentCard';

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
    <Row gutter={[16, 16]}>
      {items.map((comp, index) => (
        <Col xs={12} sm={8} md={6} lg={6} xl={6} xxl={5} key={comp.id}>
          <ComponentCard
            component={comp}
            onClick={() => onCardClick(comp, index)}
          />
        </Col>
      ))}
    </Row>
  );
}
