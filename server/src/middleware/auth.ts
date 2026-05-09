import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: '未提供有效的认证令牌' },
    });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: '令牌无效或已过期' },
    });
  }
}
