import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { useComponentStore } from '../stores/useComponentStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import ComponentGrid from '../components/ComponentGrid';
import Pagination from '../components/Pagination';
import PreviewModal from '../components/PreviewModal';
import type { Component } from '../types/component';

const { Title } = Typography;

export default function BrowsePage() {
  const { items, total, page, pageSize, isLoading, fetchList } = useComponentStore();
  const { selectedKey, tree } = useCategoryStore();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    fetchList({ page, pageSize });
  }, [page, pageSize]);

  const getCategoryTitle = () => {
    if (!selectedKey) return '全部组件';
    const parts = selectedKey.split('|');
    if (parts.length === 2) {
      const parent = tree.find((c) => c.key === parts[0]);
      const child = parent?.children?.find((c) => c.key === selectedKey);
      return child ? `${parent!.title} > ${child.title}` : '全部组件';
    }
    return tree.find((c) => c.key === selectedKey)?.title || '全部组件';
  };

  const openPreview = (comp: Component, index: number) => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  const goPrev = () => {
    if (previewIndex > 0) setPreviewIndex(previewIndex - 1);
  };

  const goNext = () => {
    if (previewIndex < items.length - 1) setPreviewIndex(previewIndex + 1);
  };

  const onPageChange = (p: number, ps: number) => {
    fetchList({ category: selectedKey?.split('|')[0], subcategory: selectedKey?.split('|')[1], page: p, pageSize: ps });
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>{getCategoryTitle()}</Title>
      <ComponentGrid
        items={items}
        loading={isLoading}
        onCardClick={openPreview}
      />
      <Pagination current={page} total={total} pageSize={pageSize} onChange={onPageChange} />
      <PreviewModal
        component={items[previewIndex] || null}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        onPrev={previewIndex > 0 ? goPrev : null}
        onNext={previewIndex < items.length - 1 ? goNext : null}
        hasPrev={previewIndex > 0}
        hasNext={previewIndex < items.length - 1}
      />
    </div>
  );
}
