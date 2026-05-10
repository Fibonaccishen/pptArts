import { useEffect, useState, useMemo } from 'react';
import { Typography } from 'antd';
import { FolderOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useComponentStore } from '../stores/useComponentStore';
import { useCategoryStore } from '../stores/useCategoryStore';
import ComponentGrid from '../components/ComponentGrid';
import Pagination from '../components/Pagination';
import PreviewModal from '../components/PreviewModal';
import type { Component } from '../types/component';

const { Text } = Typography;

export default function BrowsePage() {
  const { items, total, page, pageSize, isLoading, fetchList } = useComponentStore();
  const { selectedKey, tree } = useCategoryStore();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    fetchList({ page, pageSize });
  }, [page, pageSize]);

  const categoryInfo = useMemo(() => {
    if (!selectedKey) return { icon: <AppstoreOutlined />, parts: ['全部组件'] };
    const keyParts = selectedKey.split('|');
    if (keyParts.length === 2) {
      const parent = tree.find((c) => c.key === keyParts[0]);
      const child = parent?.children?.find((c) => c.key === selectedKey);
      if (parent && child) {
        return { icon: <FolderOutlined />, parts: [parent.title, child.title] };
      }
    }
    const cat = tree.find((c) => c.key === selectedKey);
    return cat ? { icon: <FolderOutlined />, parts: [cat.title] } : { icon: <AppstoreOutlined />, parts: ['全部组件'] };
  }, [selectedKey, tree]);

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 24,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #E8EDE6 0%, #F0F2EF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#4A7C59',
          fontSize: 16,
        }}>
          {categoryInfo.icon}
        </div>
        <div>
          {categoryInfo.parts.length > 1 ? (
            <span style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2C' }}>
              {categoryInfo.parts[0]}
              <span style={{ color: '#C5C5C5', margin: '0 6px', fontWeight: 400 }}>&rsaquo;</span>
              {categoryInfo.parts[1]}
            </span>
          ) : (
            <span style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2C' }}>
              {categoryInfo.parts[0]}
            </span>
          )}
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 1 }}>
            {total} 个组件
          </Text>
        </div>
      </div>

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
