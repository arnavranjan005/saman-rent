import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized();

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Session expired. Please log in again.', 'TOKEN_INVALID');
    }

    const prisma = getPrisma();
    if (!prisma) throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });
    if (!user) throw ApiError.unauthorized('Account no longer exists.', 'USER_GONE');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
