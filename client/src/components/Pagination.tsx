import { Pagination as AntPagination } from 'antd';

interface Props {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
}

export default function Pagination({ current, total, pageSize, onChange }: Props) {
  if (total <= pageSize) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
      <AntPagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger
        pageSizeOptions={['20', '40', '60']}
        showTotal={(t) => `共 ${t} 个组件`}
      />
    </div>
  );
}
