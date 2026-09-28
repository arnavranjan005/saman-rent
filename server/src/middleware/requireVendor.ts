import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { requireAuth } from './requireAuth';

/** Vendor sessions: JWT { sub: vendorId, role: 'VENDOR' }. */
export async function requireVendor(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Vendor login required.', 'VENDOR_UNAUTHORIZED');

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Session expired. Please log in again.', 'TOKEN_INVALID');
    }
    if (payload.role !== 'VENDOR') {
      throw ApiError.forbidden('Vendor access only.', 'NOT_A_VENDOR');
    }

    const prisma = getPrisma();
    if (!prisma) throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
    const vendor = await prisma.vendor.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, status: true },
    });
    if (!vendor) throw ApiError.unauthorized('Vendor account no longer exists.', 'VENDOR_GONE');
    if (vendor.status === 'DISABLED') {
      throw ApiError.forbidden('This vendor account is disabled.', 'VENDOR_DISABLED');
    }

    req.vendor = vendor;
    next();
  } catch (err) {
    next(err);
  }
}

/** Accept either a customer or a vendor token (uploads signature endpoint). */
export async function requireCustomerOrVendor(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(ApiError.unauthorized());
    return;
  }
  // Try vendor first, fall back to customer auth.
  await requireVendor(req, res, (err?: unknown) => {
    if (!err) {
      next();
      return;
    }
    requireAuth(req, res, next);
  });
}
