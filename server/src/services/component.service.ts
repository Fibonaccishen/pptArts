import { getDb } from '../db/connection.js';
import fs from 'fs';
import path from 'path';
import type { Component, ComponentListParams, PaginatedResponse, ImportComponentDto, UpdateComponentDto } from '../types/index.js';

export function list(params: ComponentListParams): PaginatedResponse<Component> {
  const db = getDb();
  const conditions: string[] = [];
  const values: any[] = [];

  if (params.category && params.subcategory) {
    conditions.push('category = ? AND subcategory = ?');
    values.push(params.category, params.subcategory);
  } else if (params.category) {
    conditions.push('category = ?');
    values.push(params.category);
  }

  if (params.search) {
    const keywords = params.search.trim().split(/\s+/);
    for (const kw of keywords) {
      conditions.push('(name LIKE ? OR tags LIKE ?)');
      values.push(`%${kw}%`, `%${kw}%`);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const orderCol = params.sort === 'download_count' ? 'download_count DESC' : 'name COLLATE NOCASE ASC';
  const countRow = db.prepare(`SELECT COUNT(*) as total FROM components ${where}`).get(...values) as { total: number };
  const total = countRow.total;

  const data = db.prepare(
    `SELECT * FROM components ${where} ORDER BY ${orderCol} LIMIT ? OFFSET ?`,
  ).all(...values, pageSize, offset) as Component[];

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getById(id: number): Component {
  const db = getDb();
  const comp = db.prepare('SELECT * FROM components WHERE id = ?').get(id) as Component | undefined;
  if (!comp) throw Object.assign(new Error('组件不存在'), { statusCode: 404, code: 'NOT_FOUND' });
  return comp;
}

export function getByIdForDownload(id: number): { pptxPath: string; name: string; file_type: string } {
  const comp = getById(id);
  return { pptxPath: comp.pptx_path, name: comp.name, file_type: comp.file_type };
}

export function incrementDownloadCount(id: number): void {
  const db = getDb();
  db.prepare('UPDATE components SET download_count = download_count + 1 WHERE id = ?').run(id);
}

export function importMany(items: ImportComponentDto[]): Component[] {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO components (name, category, subcategory, tags, pptx_path, thumbnail_path, file_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result: Component[] = [];
  const txn = db.transaction(() => {
    for (const item of items) {
      const info = insert.run(
        item.name,
        item.category,
        item.subcategory,
        item.tags || '',
        '',  // pptx_path to be filled by caller
        '',  // thumbnail_path to be filled by caller
        item.file_type || 'pptx',
      );
      result.push({
        id: Number(info.lastInsertRowid),
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        tags: item.tags || '',
        pptx_path: '',
        thumbnail_path: '',
        file_type: item.file_type || 'pptx',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  });
  txn();
  return result;
}

export function importWithPaths(
  items: Array<ImportComponentDto & { pptxPath: string; thumbnailPath: string }>,
): Component[] {
  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO components (name, category, subcategory, tags, pptx_path, thumbnail_path, file_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result: Component[] = [];
  const txn = db.transaction(() => {
    for (const item of items) {
      const info = insert.run(
        item.name, item.category, item.subcategory, item.tags || '',
        item.pptxPath, item.thumbnailPath, item.file_type || 'pptx',
      );
      result.push({
        id: Number(info.lastInsertRowid),
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        tags: item.tags || '',
        pptx_path: item.pptxPath,
        thumbnail_path: item.thumbnailPath,
        file_type: item.file_type || 'pptx',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  });
  txn();
  return result;
}

export function update(id: number, dto: UpdateComponentDto): Component {
  const db = getDb();
  const existing = getById(id);

  const fields: string[] = [];
  const values: any[] = [];

  if (dto.name !== undefined) { fields.push('name = ?'); values.push(dto.name); }
  if (dto.category !== undefined) { fields.push('category = ?'); values.push(dto.category); }
  if (dto.subcategory !== undefined) { fields.push('subcategory = ?'); values.push(dto.subcategory); }
  if (dto.tags !== undefined) { fields.push('tags = ?'); values.push(dto.tags); }

  if (fields.length === 0) return existing;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE components SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getById(id);
}

export function remove(id: number): void {
  const comp = getById(id);
  deleteFile(comp.pptx_path);
  deleteFile(comp.thumbnail_path);
  getDb().prepare('DELETE FROM components WHERE id = ?').run(id);
}

export function batchRemove(ids: number[]): number {
  const db = getDb();
  let deleted = 0;
  const txn = db.transaction(() => {
    for (const id of ids) {
      try {
        remove(id);
        deleted++;
      } catch {
        // skip not found
      }
    }
  });
  txn();
  return deleted;
}

function deleteFile(relativePath: string) {
  if (!relativePath) return;
  try {
    const abs = path.resolve(relativePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {
    // ignore file deletion errors
  }
}
