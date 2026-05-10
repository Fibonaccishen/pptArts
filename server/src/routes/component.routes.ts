import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadFile } from '../middleware/upload.js';
import * as ctrl from '../controllers/component.controller.js';

const router = Router();

// Thumbnail is public: <img> tags can't send auth headers
router.get('/:id/thumbnail', ctrl.getThumbnail);

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/download', ctrl.download);
router.post('/import', uploadFile.array('files', 200), ctrl.importComponents);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/batch-delete', ctrl.batchRemove);
router.post('/cleanup', ctrl.cleanup);

export default router;
