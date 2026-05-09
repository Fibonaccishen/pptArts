import { Router } from 'express';
import { list } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/', authenticate, list);
export default router;
