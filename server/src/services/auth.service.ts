import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/connection.js';
import { config } from '../config.js';
import type { LoginResponse, User } from '../types/index.js';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw Object.assign(new Error('账号或密码错误'), { statusCode: 401, code: 'UNAUTHORIZED' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  );

  return {
    token,
    user: { id: user.id, username: user.username },
  };
}

export function verifyToken(token: string): { userId: number; username: string } {
  return jwt.verify(token, config.jwtSecret) as { userId: number; username: string };
}
