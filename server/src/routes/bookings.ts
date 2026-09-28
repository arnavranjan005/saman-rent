import { Router } from 'express';
import {
  cancelBookingController,
  createBookingController,
  getBookingController,
  listBookingsController,
} from '../controllers/bookingController';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);
bookingsRouter.post('/', asyncHandler(createBookingController));
bookingsRouter.get('/', asyncHandler(listBookingsController));
bookingsRouter.get('/:id', asyncHandler(getBookingController));
bookingsRouter.patch('/:id/cancel', asyncHandler(cancelBookingController));
