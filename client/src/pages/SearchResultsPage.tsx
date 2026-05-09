import { useState } from 'react';
import { Typography } from 'antd';
import { useSearchStore } from '../stores/useSearchStore';
import ComponentGrid from '../components/ComponentGrid';
import Pagination from '../components/Pagination';
import PreviewModal from '../components/PreviewModal';
import type { Component } from '../types/component';

const { Title, Text } = Typography;

export default function SearchResultsPage() {
  const { query, results, total, page, pageSize, isSearching, search } = useSearchStore();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openPreview = (comp: Component, index: number) => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  const onPageChange = (p: number, ps: number) => {
    search(query, p);
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 8 }}>
        搜索 &ldquo;{query}&rdquo; 的结果，共 {total} 个
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        按匹配度排序
      </Text>
      <ComponentGrid
        items={results}
        loading={isSearching}
        onCardClick={openPreview}
        emptyText="未找到相关组件"
      />
      <Pagination current={page} total={total} pageSize={pageSize} onChange={onPageChange} />
      <PreviewModal
        component={results[previewIndex] || null}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        onPrev={previewIndex > 0 ? () => setPreviewIndex(previewIndex - 1) : null}
        onNext={previewIndex < results.length - 1 ? () => setPreviewIndex(previewIndex + 1) : null}
        hasPrev={previewIndex > 0}
        hasNext={previewIndex < results.length - 1}
      />
    </div>
  );
}
