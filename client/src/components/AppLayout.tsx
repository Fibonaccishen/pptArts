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
    window.electronAPI!.onUpdateStatus(({ status }) => {
      if (status === 'available') {
        message.info('发现新版本，正在下载...');
      } else if (status === 'downloaded') {
        Modal.confirm({
          title: '新版本已下载',
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
        message.info(`发现新版本 ${result.version}，正在下载...`);
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
