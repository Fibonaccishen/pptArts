import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Form, Select, Input, Upload, Button, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useCategoryStore } from '../stores/useCategoryStore';
import * as componentsApi from '../api/components';

const { Title } = Typography;
const { Dragger } = Upload;

export default function ImportPage() {
  const { tree } = useCategoryStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState<string | undefined>();

  const categoryOptions = tree.map((c) => ({ value: c.key, label: c.title }));

  const subcategory = Form.useWatch('subcategory', form);
  const selectedCategory = form.getFieldValue('category') || category;

  const subcategoryOptions = selectedCategory
    ? tree.find((c) => c.key === selectedCategory)?.children?.map((sc) => ({
        value: sc.key.split('|')[1],
        label: sc.title,
      })) || []
    : [];

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning('请选择 PPTX 文件');
      return;
    }
    try {
      const values = await form.validateFields();
      setImporting(true);
      setProgress(0);

      const formData = new FormData();
      fileList.forEach((f) => formData.append('files', f));
      formData.append('name', values.name || '');
      formData.append('category', values.category);
      formData.append('subcategory', values.subcategory);
      if (values.tags) formData.append('tags', values.tags);

      const result = await componentsApi.importComponents(formData);
      const successCount = result.results.filter((r) => r.success).length;
      const failCount = result.results.filter((r) => !r.success).length;

      if (successCount > 0) {
        message.success(`成功导入 ${successCount} 个组件${failCount > 0 ? `，${failCount} 个失败` : ''}`);
      } else {
        message.error('导入失败，请检查文件格式');
      }
      navigate('/');
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error?.message || '导入失败');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <Title level={4} style={{ marginBottom: 24 }}>导入组件</Title>

      <Dragger
        multiple
        accept=".pptx"
        beforeUpload={(file) => {
          setFileList((prev) => [...prev, file]);
          return false;
        }}
        onRemove={(file) => {
          setFileList((prev) => prev.filter((f) => f.name !== file.name));
        }}
        fileList={fileList.map((f, i) => ({
          uid: String(i),
          name: f.name,
          status: 'done' as const,
        }))}
        style={{ marginBottom: 24 }}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p>点击或拖拽 PPTX 文件到此区域</p>
        <p style={{ color: '#999' }}>支持一次选择多个文件，单文件不超过 50MB</p>
      </Dragger>

      <Form form={form} layout="vertical">
        <Form.Item name="category" label="一级分类" rules={[{ required: true, message: '请选择一级分类' }]}>
          <Select
            options={categoryOptions}
            placeholder="选择一级分类"
            onChange={(val) => {
              setCategory(val);
              form.setFieldValue('subcategory', undefined);
            }}
          />
        </Form.Item>
        <Form.Item name="subcategory" label="二级分类" rules={[{ required: true, message: '请选择二级分类' }]}>
          <Select options={subcategoryOptions} placeholder="选择二级分类" disabled={!selectedCategory} />
        </Form.Item>
        <Form.Item name="name" label="组件名称（默认取文件名）">
          <Input placeholder="批量应用于所有导入文件" />
        </Form.Item>
        <Form.Item name="tags" label="标签（逗号分隔，可选）">
          <Input placeholder="例如：蓝色, 简约, 箭头" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleImport} loading={importing} block size="large">
            开始导入 ({fileList.length} 个文件)
          </Button>
        </Form.Item>
        {importing && <Progress percent={progress} status="active" />}
      </Form>
    </div>
  );
}
