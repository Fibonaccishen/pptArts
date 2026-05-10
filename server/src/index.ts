import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createApp } from './app.js';
import { initializeDatabase } from './db/schema.js';
import { seed } from './db/seed.js';
import { cleanupOrphanFiles } from './services/component.service.js';
import { config } from './config.js';
import fs from 'fs';

function ensureDirectories() {
  fs.mkdirSync(config.uploadDir, { recursive: true });
  fs.mkdirSync(config.thumbnailDir, { recursive: true });
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}

function main() {
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
