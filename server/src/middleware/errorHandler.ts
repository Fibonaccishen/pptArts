import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = statusCode === 500 ? '服务器内部错误' : (err.message || '服务器内部错误');

  console.error(`[Error] ${statusCode} ${code}: ${err.message || 'unknown'}`);

  res.status(statusCode).json({ error: { code, message } });
}
