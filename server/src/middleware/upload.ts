import multer from 'multer';
import { v4 as uuid } from 'uuid';
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

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pptx') {
    cb(new Error('仅支持 PPTX 格式文件'));
    return;
  }
  cb(null, true);
};

export const uploadPptx = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
