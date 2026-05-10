import '@ant-design/v5-patch-for-react-19';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#4A7C59',
          colorSuccess: '#5A9E6F',
          colorError: '#D9705A',
          colorTextBase: '#2C2C2C',
          colorTextSecondary: '#8C8C8C',
          colorBorder: '#EBEAE6',
          colorBgContainer: '#FFFFFF',
          colorBgLayout: '#F7F6F3',
          borderRadius: 10,
          borderRadiusLG: 14,
          borderRadiusSM: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif",
          fontSize: 14,
          controlHeight: 36,
          lineHeight: 1.6,
        },
        components: {
          Layout: {
            headerBg: '#FFFFFF',
            siderBg: '#FAFAF8',
            bodyBg: '#F7F6F3',
          },
          Input: {
            borderRadius: 20,
            controlHeight: 36,
          },
          Button: {
            borderRadius: 8,
            controlHeight: 36,
            primaryShadow: '0 1px 2px rgba(74,124,89,0.25)',
          },
          Card: {
            borderRadiusLG: 12,
          },
          Modal: {
            borderRadiusLG: 16,
          },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
