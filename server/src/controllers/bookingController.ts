import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  cancelBooking,
  createBooking,
  createReview,
  getBookingById,
  listBookings,
} from '../services/bookingService';
import { ApiError } from '../utils/ApiError';

const createSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD.'),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:MM (24h).'),
  duration: z.coerce.number().int().min(1).max(24),
  location: z.string().min(3).max(300),
  eventType: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

/** POST /api/v1/bookings */
export async function createBookingController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues[0]?.message ?? 'Invalid booking details.',
      'INVALID_BOOKING',
    );
  }
  res.status(201).json({
    success: true,
    data: await createBooking(req.user.id, parsed.data),
  });
}

/** GET /api/v1/bookings */
export async function listBookingsController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await listBookings(req.user.id) });
}

/** GET /api/v1/bookings/:id */
export async function getBookingController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await getBookingById(req.user.id, req.params.id) });
}

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

/** POST /api/v1/bookings/:id/review */
export async function createReviewController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues[0]?.message ?? 'Invalid review.',
      'INVALID_REVIEW',
    );
  }
  res.status(201).json({
    success: true,
    data: await createReview(req.user.id, req.params.id, parsed.data),
  });
}

/** PATCH /api/v1/bookings/:id/cancel */
export async function cancelBookingController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await cancelBooking(req.user.id, req.params.id) });
}
