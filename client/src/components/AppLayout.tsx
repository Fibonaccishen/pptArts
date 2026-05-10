import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography, Button, Modal, App } from 'antd';
import { LogoutOutlined, SyncOutlined, RocketOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/useAuthStore';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { message } = App.useApp();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const isElectron = !!window.electronAPI;

  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI!.onUpdateStatus(async ({ status, version }) => {
      if (status === 'available') {
        Modal.confirm({
          title: '发现新版本',
          content: `PPTArts ${version} 已发布，是否下载更新？`,
          okText: '立即下载',
          cancelText: '暂不更新',
          onOk: () => {
            window.electronAPI!.downloadUpdate();
            message.loading({ content: '正在下载更新...', key: 'update' });
          },
        });
      } else if (status === 'downloaded') {
        message.destroy('update');
        Modal.confirm({
          title: '更新已下载',
          content: '是否立即重启安装更新？',
          okText: '立即重启',
          cancelText: '稍后',
          onOk: () => window.electronAPI!.quitAndInstall(),
        });
      }
    });
  }, [isElectron]);

  const handleCheckUpdate = async () => {
    if (!isElectron) return;
    setCheckingUpdate(true);
    try {
      const result = await window.electronAPI!.checkForUpdates();
      if (result.updateAvailable) {
        // update-available event will fire from main process
      } else {
        message.success('已是最新版本');
      }
    } catch {
      message.error('检查更新失败');
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{
        background: '#FAFAF8',
        borderRight: '1px solid #EBEAE6',
        overflow: 'auto',
      }}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '0 24px',
          borderBottom: '1px solid #EBEAE6',
          lineHeight: '64px',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #5A9E6F 0%, #4A7C59 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(74,124,89,0.2)',
          }}>
            <RocketOutlined style={{ fontSize: 16, color: '#fff' }} />
          </div>
          <Text strong style={{ fontSize: 17 }}>PPTArts</Text>
        </div>
        <Sidebar />
      </Sider>
      <Layout>
        <Header style={{
          background: '#FFFFFF',
          height: 64,
          lineHeight: '64px',
          borderBottom: '1px solid #EBEAE6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <SearchBar />
          <div style={{ flex: 1 }} />
          {isElectron && (
            <Button icon={<SyncOutlined spin={checkingUpdate} />} onClick={handleCheckUpdate} type="text">
              检查更新
            </Button>
          )}
          <Text type="secondary">{user?.username}</Text>
          <Button icon={<LogoutOutlined />} onClick={logout} type="text">
            退出
          </Button>
        </Header>
        <Content style={{ padding: 24, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
