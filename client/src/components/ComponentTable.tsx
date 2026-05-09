import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Space, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { Component } from '../types/component';
import { useCategoryStore } from '../stores/useCategoryStore';
import * as componentsApi from '../api/components';

interface Props {
  items: Component[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onRefresh: () => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function ComponentTable({
  items, loading, total, page, pageSize, onRefresh, onPageChange,
}: Props) {
  const { tree } = useCategoryStore();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Component | null>(null);
  const [editForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const safeTree = JSON.parse(JSON.stringify(tree)) as typeof tree;
  const categoryOptions = safeTree.map((c) => ({ value: c.key, label: c.title }));

  const openEdit = (comp: Component) => {
    setEditingComp(comp);
    editForm.setFieldsValue({
      name: comp.name,
      category: comp.category,
      subcategory: comp.subcategory,
      tags: comp.tags,
    });
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingComp) return;
    try {
      const values = await editForm.validateFields();
      setSaving(true);
      await componentsApi.updateComponent(editingComp.id, values);
      message.success('修改成功');
      setEditModalOpen(false);
      onRefresh();
    } catch (err: any) {
      if (err.errorFields) return;
      message.error('修改失败');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await componentsApi.deleteComponent(id);
      message.success('删除成功');
      onRefresh();
    } catch {
      message.error('删除失败');
    }
  };

  const batchDelete = async () => {
    Modal.confirm({
      title: `确定删除选中的 ${selectedRowKeys.length} 个组件？`,
      content: '此操作不可恢复，将同时删除 PPTX 源文件和缩略图。',
      onOk: async () => {
        try {
          const result = await componentsApi.batchDelete(selectedRowKeys as number[]);
          message.success(`成功删除 ${result.deleted} 个组件`);
          setSelectedRowKeys([]);
          onRefresh();
        } catch {
          message.error('批量删除失败');
        }
      },
    });
  };

  const editedCategory = Form.useWatch('category', editForm);
  const subcategoryOptions = editedCategory
    ? safeTree.find((c) => c.key === editedCategory)?.children?.map((sc) => ({
        value: sc.key.split('|')[1],
        label: sc.title,
      })) || []
    : [];

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'id',
      width: 90,
      render: (_: number, record: Component) =>
        record.thumbnail_path ? (
          <img
            src={`/api/components/${record.id}/thumbnail`}
            alt=""
            style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span style={{ color: '#ccc' }}>无</span>
        ),
    },
    { title: '组件名称', dataIndex: 'name', ellipsis: true },
    { title: '一级分类', dataIndex: 'category', width: 120 },
    { title: '二级分类', dataIndex: 'subcategory', width: 140 },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 200,
      render: (tags: string) =>
        tags
          ? tags.split(',').filter(Boolean).map((t) => (
              <Tag key={t}>{t.trim()}</Tag>
            ))
          : '-',
    },
    {
      title: '操作',
      width: 160,
      render: (_: unknown, record: Component) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => deleteItem(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button danger onClick={batchDelete}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
        <Button icon={<ReloadOutlined />} onClick={onRefresh}>刷新</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        pagination={{
          current: page,
          total,
          pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          pageSizeOptions: ['20', '50', '100'],
          showTotal: (t) => `共 ${t} 个组件`,
        }}
        size="middle"
      />

      <Modal
        title="编辑组件"
        open={editModalOpen}
        onOk={saveEdit}
        onCancel={() => setEditModalOpen(false)}
        confirmLoading={saving}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label="组件名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="一级分类" rules={[{ required: true }]}>
            <Select
              options={categoryOptions}
              onChange={() => editForm.setFieldValue('subcategory', undefined)}
            />
          </Form.Item>
          <Form.Item name="subcategory" label="二级分类" rules={[{ required: true }]}>
            <Select options={subcategoryOptions} />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input placeholder="例如：蓝色, 简约" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
