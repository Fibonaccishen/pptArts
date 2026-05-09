import type { Request, Response, NextFunction } from 'express';
import * as componentService from '../services/component.service.js';
import { generateThumbnail } from '../services/thumbnail.service.js';
import path from 'path';
import fs from 'fs';

export function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, subcategory, search, page, pageSize } = req.query;
    const result = componentService.list({
      category: category as string,
      subcategory: subcategory as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const comp = componentService.getById(parseInt(req.params.id, 10));
    res.json(comp);
  } catch (err) {
    next(err);
  }
}

export function download(req: Request, res: Response, next: NextFunction) {
  try {
    const { pptxPath, name } = componentService.getByIdForDownload(parseInt(req.params.id, 10));
    const absPath = path.resolve(pptxPath);
    if (!fs.existsSync(absPath)) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: '文件不存在' } });
      return;
    }
    const encodedName = encodeURIComponent(name + '.pptx');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
    res.sendFile(absPath);
  } catch (err) {
    next(err);
  }
}

export function getThumbnail(req: Request, res: Response, next: NextFunction) {
  try {
    const comp = componentService.getById(parseInt(req.params.id, 10));
    const absPath = path.resolve(comp.thumbnail_path);
    if (!fs.existsSync(absPath)) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: '缩略图不存在' } });
      return;
    }
    res.sendFile(absPath);
  } catch (err) {
    next(err);
  }
}

export async function importComponents(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '请选择 PPTX 文件' } });
      return;
    }

    const { name, category, subcategory, tags } = req.body;
    if (!category || !subcategory) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '请选择分类' } });
      return;
    }

    const results: Array<{ id: number; name: string; success: boolean; error?: string }> = [];

    const items: Array<{ name: string; category: string; subcategory: string; tags: string; pptxPath: string; thumbnailPath: string }> = [];

    for (const file of files) {
      const componentName = name || path.basename(file.originalname, '.pptx');
      try {
        const thumbnailName = await generateThumbnail(file.path);
        items.push({
          name: componentName,
          category,
          subcategory,
          tags: tags || '',
          pptxPath: file.path,
          thumbnailPath: path.join('thumbnails', thumbnailName),
        });
        results.push({ id: 0, name: componentName, success: true });
      } catch (err: any) {
        results.push({ id: 0, name: componentName, success: false, error: err.message });
      }
    }

    if (items.length > 0) {
      const inserted = componentService.importWithPaths(items);
      for (let i = 0; i < inserted.length; i++) {
        results[i].id = inserted[i].id;
      }
    }

    res.status(201).json({ results });
  } catch (err) {
    next(err);
  }
}

export function update(req: Request, res: Response, next: NextFunction) {
  try {
    const comp = componentService.update(parseInt(req.params.id, 10), req.body);
    res.json(comp);
  } catch (err) {
    next(err);
  }
}

export function remove(req: Request, res: Response, next: NextFunction) {
  try {
    componentService.remove(parseInt(req.params.id, 10));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export function batchRemove(req: Request, res: Response, next: NextFunction) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '请选择要删除的组件' } });
      return;
    }
    const deleted = componentService.batchRemove(ids);
    res.json({ deleted });
  } catch (err) {
    next(err);
  }
}
