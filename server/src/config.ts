import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { env } = process;

const DEFAULT_JWT_SECRET = 'pptarts-dev-secret';
const jwtSecret = env.JWT_SECRET || DEFAULT_JWT_SECRET;

// 公网暴露场景下必须修改默认密钥，否则拒绝启动
export function validateConfig(): string[] {
  const errors: string[] = [];
  if (jwtSecret === DEFAULT_JWT_SECRET) {
    errors.push(
      'JWT_SECRET 仍为默认值，存在严重安全风险。请在 .env 中设置强随机密钥。\n' +
      '  生成方式：node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  if (env.PUBLIC_MODE === 'true' && !env.CORS_ORIGIN) {
    errors.push(
      'PUBLIC_MODE=true 时 CORS_ORIGIN 为必填项。请在 .env 中设置 CORS_ORIGIN 为前端访问域名。\n' +
      '  例：CORS_ORIGIN=https://ppt.yourcompany.com',
    );
  }
  return errors;
}

export const config = {
  port: parseInt(env.PORT || '3001', 10),
  jwtSecret,
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
  corsOrigin: env.CORS_ORIGIN || '',
  publicMode: env.PUBLIC_MODE === 'true',
  uploadDir: env.UPLOAD_DIR || './uploads',
  thumbnailDir: env.THUMBNAIL_DIR || './thumbnails',
  dbPath: env.DB_PATH || './data/pptarts.db',
  libreofficePath: env.LIBREOFFICE_PATH || 'soffice',
};
