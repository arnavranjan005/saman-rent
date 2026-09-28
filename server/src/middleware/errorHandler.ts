import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

// Centralized error handling — every error becomes the same envelope:
// { success: false, error: { code, message } }
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }
  if (env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
