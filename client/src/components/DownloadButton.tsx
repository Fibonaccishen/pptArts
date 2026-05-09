import { useState } from 'react';
import { Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { Component } from '../types/component';
import * as componentsApi from '../api/components';

interface Props {
  component: Component;
}

export default function DownloadButton({ component }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const buffer = await componentsApi.downloadPptx(component.id);
      const filename = `${component.name}.pptx`;

      if (window.electronAPI?.saveFile) {
        const savedPath = await window.electronAPI.saveFile(buffer, filename);
        if (savedPath) {
          message.success('下载成功');
        }
      } else {
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        });
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
      下载 PPTX
    </Button>
  );
}
