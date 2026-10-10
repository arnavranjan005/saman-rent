import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

/** Admin sessions: JWT { sub: userId, role: 'ADMIN' }. */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Admin login required.', 'ADMIN_UNAUTHORIZED');

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Session expired. Please log in again.', 'TOKEN_INVALID');
    }
    if (payload.role !== 'ADMIN') {
      throw ApiError.forbidden('Admin access only.', 'NOT_AN_ADMIN');
    }

    const prisma = getPrisma();
    if (!prisma) throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
    const admin = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!admin || admin.role !== 'ADMIN') {
      throw ApiError.unauthorized('Admin account no longer exists.', 'ADMIN_GONE');
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}
