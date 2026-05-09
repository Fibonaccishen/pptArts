import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import componentRoutes from './routes/component.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/components', componentRoutes);

  app.use(errorHandler);

  return app;
}
