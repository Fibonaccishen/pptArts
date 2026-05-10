import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tree, Button, Spin } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { ImportOutlined, SettingOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useCategoryStore } from '../stores/useCategoryStore';
import { useComponentStore } from '../stores/useComponentStore';
import type { CategoryNode } from '../types/category';

function SwitcherIcon({ expanded }: { expanded?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      borderRadius: 5,
      transition: 'all 0.2s ease',
      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
      opacity: 0.45,
      background: expanded ? 'rgba(0,0,0,0.04)' : 'transparent',
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Sidebar() {
  const { tree, selectedKey, isLoading, fetchTree, selectCategory } = useCategoryStore();
  const safeTree = JSON.parse(JSON.stringify(tree)) as typeof tree;
  const fetchList = useComponentStore((s) => s.fetchList);
  const navigate = useNavigate();

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  useEffect(() => {
    if (safeTree.length > 0 && expandedKeys.length === 0) {
      setExpandedKeys(safeTree.map((c) => c.key));
    }
  }, [safeTree]);

  const toggleExpand = (key: React.Key) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const selectLeaf = (childKey: string) => {
    const parts = childKey.split('|');
    selectCategory(childKey);
    fetchList({ category: parts[0], subcategory: parts[1], page: 1 });
    navigate('/');
  };

  const showAll = () => {
    selectCategory('');
    fetchList({ page: 1 });
    navigate('/');
  };

  const isSelected = (key: string) => selectedKey === key;

  const treeData = safeTree.map((cat): DataNode => ({
    key: cat.key,
    title: (
      <span
        onClick={(e) => { e.stopPropagation(); toggleExpand(cat.key); }}
        style={{ fontWeight: 600, fontSize: 13, color: '#555', cursor: 'default' }}
      >
        {cat.title}
      </span>
    ),
    selectable: false,
    children: cat.children?.map((child: CategoryNode): DataNode => ({
      key: child.key,
      title: (
        <span
          onClick={(e) => { e.stopPropagation(); selectLeaf(child.key); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 7,
            fontSize: 13,
            color: isSelected(child.key) ? '#4A7C59' : '#444',
            fontWeight: isSelected(child.key) ? 500 : 400,
            background: isSelected(child.key) ? 'rgba(74,124,89,0.08)' : 'transparent',
            transition: 'all 0.15s ease',
            cursor: 'pointer',
          }}
        >
          {child.title}
          {child.count !== undefined && child.count > 0 && (
            <span style={{
              fontSize: 11,
              color: isSelected(child.key) ? '#4A7C59' : '#B5B5B5',
              fontWeight: 400,
            }}>
              {child.count}
            </span>
          )}
        </span>
      ),
    })),
  }));

  return (
    <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Button type="text" icon={<AppstoreOutlined />} onClick={showAll}
        style={{
          textAlign: 'left',
          fontWeight: selectedKey === '' ? 600 : 400,
          color: selectedKey === '' ? '#4A7C59' : '#555',
          background: selectedKey === '' ? 'rgba(74,124,89,0.06)' : 'transparent',
          borderRadius: 8,
          height: 34,
          marginBottom: 4,
        }}>
        全部组件
      </Button>

      {isLoading ? (
        <Spin style={{ padding: 24 }} />
      ) : (
        <Tree
          treeData={treeData}
          selectedKeys={selectedKey ? [selectedKey] : []}
          expandedKeys={expandedKeys}
          onExpand={(keys) => setExpandedKeys(keys)}
          showIcon={false}
          switcherIcon={(props: any) => <SwitcherIcon expanded={props?.expanded} />}
          style={{ background: 'transparent' }}
          className="sidebar-tree"
        />
      )}

      <div style={{
        borderTop: '1px solid #EBEAE6',
        paddingTop: 8,
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <Button type="text" icon={<ImportOutlined />} block style={{ textAlign: 'left', borderRadius: 8, height: 34 }}
          onClick={() => navigate('/import')}>
          导入组件
        </Button>
        <Button type="text" icon={<SettingOutlined />} block style={{ textAlign: 'left', borderRadius: 8, height: 34 }}
          onClick={() => navigate('/manage')}>
          组件管理
        </Button>
      </div>
    </div>
  );
}
