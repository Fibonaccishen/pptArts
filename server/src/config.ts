import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { env } = process;

export const config = {
  port: parseInt(env.PORT || '3001', 10),
  jwtSecret: env.JWT_SECRET || 'pptarts-dev-secret',
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
  uploadDir: env.UPLOAD_DIR || './uploads',
  thumbnailDir: env.THUMBNAIL_DIR || './thumbnails',
  dbPath: env.DB_PATH || './data/pptarts.db',
  libreofficePath: env.LIBREOFFICE_PATH || 'soffice',
};
