import type { Request, Response, NextFunction } from 'express';
import { getCategoryTree } from '../services/category.service.js';

export function list(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(getCategoryTree());
  } catch (err) {
    next(err);
  }
}
