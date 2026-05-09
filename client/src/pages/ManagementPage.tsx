import { useEffect } from 'react';
import { Typography } from 'antd';
import { useComponentStore } from '../stores/useComponentStore';
import ComponentTable from '../components/ComponentTable';

const { Title } = Typography;

export default function ManagementPage() {
  const { items, total, page, pageSize, isLoading, fetchList } = useComponentStore();

  useEffect(() => {
    fetchList({ page: 1, pageSize: 50 });
  }, []);

  const onPageChange = (p: number, ps: number) => {
    fetchList({ page: p, pageSize: ps });
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>组件管理</Title>
      <ComponentTable
        items={items}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={pageSize}
        onRefresh={() => fetchList({ page, pageSize })}
        onPageChange={onPageChange}
      />
    </div>
  );
}
