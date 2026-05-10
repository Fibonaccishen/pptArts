import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Form, Select, Input, Upload, Button, Tag, message, Space } from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import { useCategoryStore } from '../stores/useCategoryStore';
import * as componentsApi from '../api/components';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { CheckableTag } = Tag;

const PRESET_TAGS = [
  '蓝色', '绿色', '红色', '橙色', '紫色', '灰色',
  '简约', '商务', '科技', '手绘', '扁平', '渐变', '3D',
  '箭头', '图标', '流程图', '时间轴', '数据', '卡片', '文字框',
];

export default function ImportPage() {
  const { tree } = useCategoryStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [tagList, setTagList] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const watchedCategory = Form.useWatch('category', form);

  const safeTree = JSON.parse(JSON.stringify(tree)) as typeof tree;

  const categoryOptions = safeTree.map((c) => ({ value: c.key, label: c.title }));
  const selectedNode = safeTree.find((c) => c.key === watchedCategory);
  const subcategoryOptions = selectedNode?.children?.map((sc) => ({
    value: sc.key.split('|')[1],
    label: sc.title,
  })) || [];

  const togglePreset = (tag: string, checked: boolean) => {
    if (checked) {
      setTagList((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    } else {
      setTagList((prev) => prev.filter((t) => t !== tag));
    }
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    if (tagList.includes(trimmed)) {
      message.warning('标签已存在');
      return;
    }
    setTagList((prev) => [...prev, trimmed]);
    setCustomTag('');
  };

  const removeTag = (tag: string) => {
    setTagList((prev) => prev.filter((t) => t !== tag));
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning('请选择 PPTX 文件');
      return;
    }
    try {
      const values = await form.validateFields();
      setImporting(true);

      const formData = new FormData();
      fileList.forEach((f) => formData.append('files', f));
      formData.append('name', values.name || '');
      formData.append('category', values.category);
      formData.append('subcategory', values.subcategory);
      if (tagList.length > 0) {
        formData.append('tags', tagList.join(','));
      }

      const result = await componentsApi.importComponents(formData);
      const successCount = result.results.filter((r) => r.success).length;
      const failCount = result.results.filter((r) => !r.success).length;

      if (failCount > 0) {
        const errors = result.results
          .filter((r) => !r.success)
          .map((r) => `${r.name}: ${r.error}`)
          .join('；');
        message.error(`导入失败：${errors}`);
      }
      if (successCount > 0) {
        message.success(`成功导入 ${successCount} 个组件${failCount > 0 ? `，${failCount} 个失败` : ''}`);
      }
      navigate('/');
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error?.message || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
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
          <Select options={categoryOptions} placeholder="选择一级分类" />
        </Form.Item>
        <Form.Item name="subcategory" label="二级分类" rules={[{ required: true, message: '请选择二级分类' }]}>
          <Select options={subcategoryOptions} placeholder="选择二级分类" disabled={!watchedCategory} />
        </Form.Item>
        <Form.Item name="name" label="组件名称（默认取文件名）">
          <Input placeholder="批量应用于所有导入文件" />
        </Form.Item>

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>标签</Text>

          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>常用标签（点击勾选）</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_TAGS.map((tag) => (
                <CheckableTag
                  key={tag}
                  checked={tagList.includes(tag)}
                  onChange={(checked) => togglePreset(tag, checked)}
                  style={{
                    borderRadius: 6,
                    padding: '2px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {tag}
                </CheckableTag>
              ))}
            </div>
          </div>

          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>自定义标签</Text>
            <Space.Compact style={{ width: '100%', maxWidth: 320 }}>
              <Input
                size="small"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onPressEnter={addCustomTag}
                placeholder="输入标签名后点击添加"
                style={{ borderRadius: '6px 0 0 6px' }}
              />
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={addCustomTag}
                style={{ borderRadius: '0 6px 6px 0' }}
              >
                添加
              </Button>
            </Space.Compact>
          </div>

          {tagList.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                将添加 {tagList.length} 个标签：
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tagList.map((tag) => (
                  <Tag key={tag} closable onClose={() => removeTag(tag)} color="#4A7C59">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        <Form.Item>
          <Button type="primary" onClick={handleImport} loading={importing} block size="large">
            开始导入 ({fileList.length} 个文件)
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
