import { getDb } from './connection.js';

export function initializeDatabase(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      tags TEXT DEFAULT '',
      pptx_path TEXT NOT NULL,
      thumbnail_path TEXT NOT NULL,
      file_type TEXT NOT NULL DEFAULT 'pptx',
      download_count INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_components_category
      ON components(category, subcategory);
    CREATE INDEX IF NOT EXISTS idx_components_name
      ON components(name);
    CREATE INDEX IF NOT EXISTS idx_components_download
      ON components(download_count DESC);
  `);

  // Migration: add download_count for existing databases
  try {
    db.exec(`ALTER TABLE components ADD COLUMN download_count INTEGER NOT NULL DEFAULT 0`);
  } catch { /* column already exists */ }

  console.log('[DB] 数据库表初始化完成');
}
