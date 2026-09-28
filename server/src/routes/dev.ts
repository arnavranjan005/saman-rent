import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * DEV-ONLY test hook for E2E (acts as the vendor accept/reject step
 * until Phase 9 vendor APIs exist). Returns 404 in production.
 * TODO(Phase 11): delete this router entirely.
 */
export const devRouter = Router();

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'REJECTED', 'COMPLETED']),
});

const ALLOWED_FROM: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['COMPLETED'],
};

devRouter.patch(
  '/bookings/:id/status',
  asyncHandler(async (req, res) => {
    if (env.NODE_ENV === 'production') {
      throw ApiError.notFound('Route not found');
    }
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Status must be CONFIRMED, REJECTED or COMPLETED.', 'INVALID_STATUS');
    }
    const prisma = getPrisma();
    if (!prisma) throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) throw ApiError.notFound('Booking not found.', 'BOOKING_NOT_FOUND');

    const allowed = ALLOWED_FROM[booking.status] ?? [];
    if (!allowed.includes(parsed.data.status)) {
      throw ApiError.badRequest(
        `Cannot move booking from ${booking.status} to ${parsed.data.status}.`,
        'INVALID_TRANSITION',
      );
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: parsed.data.status },
    });
    res.json({ success: true, data: { id: updated.id, status: updated.status } });
  }),
);
