import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import componentRoutes from './routes/component.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config.js';

export function createApp() {
  const app = express();

  // 信任 Tailscale Funnel 等反向代理的 X-Forwarded-For 头
  app.set('trust proxy', 1);

  // 安全响应头（X-Content-Type-Options, X-Frame-Options 等）
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS — 公网模式下仅允许指定域名
  const corsOrigin = config.publicMode && config.corsOrigin
    ? config.corsOrigin
    : true; // 本地模式保持兼容
  app.use(cors({ origin: corsOrigin, credentials: true }));

  app.use(express.json());

  // 请求审计日志
  app.use(morgan('short'));

  const updatesDir = path.resolve('./updates');
  if (!fs.existsSync(updatesDir)) {
    fs.mkdirSync(updatesDir, { recursive: true });
  }
  app.use('/updates', express.static(updatesDir, { maxAge: 0 }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/components', componentRoutes);

  // 托管前端静态文件（网页版入口）
  const distDir = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}
