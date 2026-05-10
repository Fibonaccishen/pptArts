import { useState } from 'react';
import { Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSearchStore } from '../stores/useSearchStore';
import ComponentGrid from '../components/ComponentGrid';
import Pagination from '../components/Pagination';
import PreviewModal from '../components/PreviewModal';
import type { Component } from '../types/component';

const { Text } = Typography;

export default function SearchResultsPage() {
  const { query, results, total, page, pageSize, isSearching, search } = useSearchStore();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const openPreview = (_comp: Component, index: number) => {
    setPreviewIndex(index);
    setPreviewVisible(true);
  };

  const onPageChange = (p: number, _ps: number) => {
    search(query, p);
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
          <SearchOutlined />
        </div>
        <div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#2C2C2C' }}>
            搜索 &ldquo;{query}&rdquo;
          </span>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 1 }}>
            共 {total} 个结果
          </Text>
        </div>
      </div>

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
