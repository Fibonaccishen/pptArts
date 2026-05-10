import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tree, Button, Spin } from 'antd';
import { ImportOutlined, SettingOutlined, AppstoreOutlined, FolderOutlined } from '@ant-design/icons';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useComponentStore } from '../stores/useComponentStore';
import type { CategoryNode } from '../types/category';

export default function Sidebar() {
  const { tree, selectedKey, isLoading, fetchTree, selectCategory } = useCategoryStore();
  const safeTree = JSON.parse(JSON.stringify(tree)) as typeof tree;
  const fetchList = useComponentStore((s) => s.fetchList);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const onSelect = (keys: React.Key[]) => {
    if (keys.length === 0) return;
    const key = keys[0] as string;
    selectCategory(key);

    const parts = key.split('|');
    if (parts.length === 2) {
      fetchList({ category: parts[0], subcategory: parts[1], page: 1 });
      navigate('/');
    } else {
      fetchList({ category: parts[0], page: 1 });
      navigate('/');
    }
  };

  const showAll = () => {
    selectCategory('');
    fetchList({ page: 1 });
    navigate('/');
  };

  const treeData = safeTree.map((cat): any => ({
    key: cat.key,
    title: cat.title,
    icon: <FolderOutlined style={{ color: '#B5B5B5', fontSize: 13 }} />,
    children: cat.children?.map((child: CategoryNode) => ({
      key: child.key,
      title: (
        <span>
          {child.title}
          {child.count !== undefined && child.count > 0 && (
            <span style={{ color: '#B5B5B5', marginLeft: 4 }}>({child.count})</span>
          )}
        </span>
      ),
    })),
  }));

  return (
    <div style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Button type="text" icon={<AppstoreOutlined />} onClick={showAll}
        style={{ textAlign: 'left', fontWeight: selectedKey === '' ? 700 : 400 }}>
        全部组件
      </Button>

      {isLoading ? (
        <Spin style={{ padding: 24 }} />
      ) : (
        <Tree
          treeData={treeData}
          selectedKeys={selectedKey ? [selectedKey] : []}
          onSelect={onSelect as any}
          defaultExpandAll
          style={{ background: 'transparent' }}
        />
      )}

      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 8 }}>
        <Button type="text" icon={<ImportOutlined />} block style={{ textAlign: 'left' }}
          onClick={() => navigate('/import')}>
          导入组件
        </Button>
        <Button type="text" icon={<SettingOutlined />} block style={{ textAlign: 'left' }}
          onClick={() => navigate('/manage')}>
          组件管理
        </Button>
      </div>
    </div>
  );
}
