import { useState } from 'react';
import { Button, App } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { Component } from '../types/component';
import * as componentsApi from '../api/components';

const MIME_TYPES: Record<string, string> = {
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png: 'image/png',
  svg: 'image/svg+xml',
};

interface Props {
  component: Component;
}

export default function DownloadButton({ component }: Props) {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const fileType = component.file_type || 'pptx';
  const fileTypeLabel = fileType.toUpperCase();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const buffer = await componentsApi.downloadPptx(component.id);
      const filename = `${component.name}.${fileType}`;

      if (window.electronAPI?.saveFile) {
        const savedPath = await window.electronAPI.saveFile(buffer, filename, fileType);
        if (savedPath) {
          message.success('下载成功');
        }
      } else {
        const mime = MIME_TYPES[fileType] || 'application/octet-stream';
        const blob = new Blob([buffer], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        message.success('下载成功');
      }
    } catch (err: any) {
      message.error('下载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={handleDownload}
      loading={loading}
    >
      下载 {fileTypeLabel}
    </Button>
  );
}
