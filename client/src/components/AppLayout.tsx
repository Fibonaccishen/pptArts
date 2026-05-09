import { Outlet } from 'react-router-dom';
import { Layout, Typography, Button, theme } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/useAuthStore';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { token: themeToken } = theme.useToken();

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
