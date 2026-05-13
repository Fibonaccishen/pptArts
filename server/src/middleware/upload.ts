import multer from 'multer';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(config.uploadDir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const ALLOWED_EXTENSIONS = ['.pptx', '.png', '.svg'];

// 文件魔数校验（magic bytes），防止扩展名绕过
const MAGIC_BYTES: Record<string, number[]> = {
  '.png': [0x89, 0x50, 0x4e, 0x47],
  '.svg': [0x3c], // SVG 以 '<' 开头（可能是 <?xml 或 <svg）
  '.pptx': [0x50, 0x4b, 0x03, 0x04], // ZIP 格式
};

function checkMagicBytes(filePath: string, ext: string): boolean {
  const magic = MAGIC_BYTES[ext];
  if (!magic) return true; // 无规则则放行
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(magic.length);
    fs.readSync(fd, buf, 0, magic.length, 0);
    fs.closeSync(fd);
    return magic.every((byte, i) => buf[i] === byte);
  } catch {
    return false;
  }
}

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error('仅支持 PPTX / PNG / SVG 格式文件'));
    return;
  }
  cb(null, true);
};

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024, files: 20 },
});

// 导出魔数校验供 controller 在文件写入后调用
export { checkMagicBytes };

export const uploadPptx = uploadFile;
