import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: '请输入用户名和密码' },
      });
      return;
    }
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
