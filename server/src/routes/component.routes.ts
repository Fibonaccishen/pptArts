import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import { uploadFile } from '../middleware/upload.js';
import * as ctrl from '../controllers/component.controller.js';

const router = Router();

// 缩略图签名 URL（无需 Authorization header，token 自带认证和有效期）
router.get('/thumbnail/:token', ctrl.getThumbnailByToken);

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/download', ctrl.download);
// 保留旧版缩略图路由（认证后访问，兼容管理后台等场景）
router.get('/:id/thumbnail', ctrl.getThumbnail);

// 写操作限流：每 IP 15 分钟最多 30 次导入 / 50 次删除
const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: '操作过于频繁，请稍后再试' } },
});
const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: '导入过于频繁，请稍后再试' } },
});

router.post('/import', importLimiter, uploadFile.array('files', 20), ctrl.importComponents);
router.put('/:id', mutationLimiter, ctrl.update);
router.delete('/:id', mutationLimiter, ctrl.remove);
router.post('/batch-delete', mutationLimiter, ctrl.batchRemove);
router.post('/cleanup', mutationLimiter, ctrl.cleanup);

export default router;
