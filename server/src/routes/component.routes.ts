import { Router } from 'express';
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
router.post('/import', uploadFile.array('files', 20), ctrl.importComponents);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/batch-delete', ctrl.batchRemove);
router.post('/cleanup', ctrl.cleanup);

export default router;
