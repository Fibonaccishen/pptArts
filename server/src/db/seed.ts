import bcrypt from 'bcryptjs';
import { getDb } from './connection.js';

export function seed(): void {
  const db = getDb();

  const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (admin) {
    console.log('[DB] 种子数据已存在，跳过');
    return;
  }

  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);

  console.log('[DB] 种子数据已插入（admin 用户）');
}
