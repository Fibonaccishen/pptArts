import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createApp } from './app.js';
import { initializeDatabase } from './db/schema.js';
import { seed } from './db/seed.js';
import { cleanupOrphanFiles } from './services/component.service.js';
import { config, validateConfig } from './config.js';
import fs from 'fs';

function ensureDirectories() {
  fs.mkdirSync(config.uploadDir, { recursive: true });
  fs.mkdirSync(config.thumbnailDir, { recursive: true });
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}

function main() {
  // 安全校验
  const errors = validateConfig();
  if (errors.length > 0) {
    if (config.publicMode) {
      console.error('[PPTArts] 安全配置错误，拒绝启动：');
      errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    } else {
      console.warn('[PPTArts] 安全提示（内网穿透前必须修复）：');
      errors.forEach((e) => console.warn(`  - ${e}`));
    }
  }

  ensureDirectories();
  initializeDatabase();
  seed();
  cleanupOrphanFiles();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[PPTArts Server] 运行在 http://localhost:${config.port}`);
  });
}

main();
