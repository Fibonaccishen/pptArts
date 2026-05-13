import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login } from '../controllers/auth.controller.js';

// 登录接口单独限流：每 IP 15 分钟最多 10 次
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: '登录尝试过于频繁，请 15 分钟后再试' } },
});

const router = Router();
router.post('/login', loginLimiter, login);
export default router;
