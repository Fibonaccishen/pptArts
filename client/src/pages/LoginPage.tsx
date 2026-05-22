import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, App } from 'antd';
import { UserOutlined, LockOutlined, RocketOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/useAuthStore';

const { Title, Text } = Typography;

const isElectron = !!(window as any).electronAPI;
const DEFAULT_LOCAL = 'http://localhost:3001';

function loadServerUrl(): string {
  const stored = localStorage.getItem('pptarts-server-url');
  if (stored) return stored;
  // Electron 默认连本机，浏览器默认走相对路径
  return isElectron ? DEFAULT_LOCAL : '';
}

function saveServerUrl(url: string) {
  if (url) {
    localStorage.setItem('pptarts-server-url', url);
  } else {
    localStorage.removeItem('pptarts-server-url');
  }
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState(loadServerUrl);
  const { message } = App.useApp();
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      saveServerUrl(serverUrl.trim());
      await login(values.username, values.password);
      navigate('/', { replace: true });
    } catch (err: any) {
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #F0EDE5 0%, #F7F6F3 40%, #EDF0E8 100%)',
    }}>
      <div className="login-card" style={{
        width: '100%',
        maxWidth: 400,
        margin: '0 16px',
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '48px 40px 40px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06)',
        border: '1px solid #EBEAE6',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #5A9E6F 0%, #4A7C59 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(74,124,89,0.25)',
          }}>
            <RocketOutlined style={{ fontSize: 26, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 0, fontWeight: 600, color: '#2C2C2C' }}>
            PPTArts
          </Title>
          <Text style={{ color: '#999', fontSize: 14 }}>企业 PPT 组件库</Text>
        </div>

        <Form name="login" onFinish={onFinish} size="large" initialValues={{ serverUrl: loadServerUrl() }}>
          <Form.Item name="serverUrl"
            help={isElectron ? '默认连接本机 localhost，远程使用请改为隧道地址' : '网页版自动识别，无需填写'}
          >
            <Input
              prefix={<GlobalOutlined style={{ color: '#B5B5B5' }} />}
              placeholder="服务器地址（如 https://ppt.company.com）"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              allowClear
            />
          </Form.Item>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined style={{ color: '#B5B5B5' }} />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined style={{ color: '#B5B5B5' }} />} placeholder="密码" />
          </Form.Item>
          <Form.Item style={{ marginTop: 28 }}>
            <Button type="primary" htmlType="submit" loading={loading} block size="large"
              style={{ height: 44, borderRadius: 10, fontWeight: 500 }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
