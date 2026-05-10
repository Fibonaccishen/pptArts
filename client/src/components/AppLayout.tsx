import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography, Button, theme, message, Modal } from 'antd';
import { LogoutOutlined, SyncOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/useAuthStore';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { token: themeToken } = theme.useToken();
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
        background: themeToken.colorBgContainer,
        borderRight: `1px solid ${themeToken.colorBorderSecondary}`,
        overflow: 'auto',
      }}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
        }}>
          <Text strong style={{ fontSize: 18 }}>PPTArts</Text>
        </div>
        <Sidebar />
      </Sider>
      <Layout>
        <Header style={{
          background: themeToken.colorBgContainer,
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
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
