import { Router } from 'express';
import {
  listBookingsController,
  listServicesController,
  listVendorsController,
  setServiceStatusController,
  setVendorStatusController,
} from '../controllers/adminController';
import { requireAdmin } from '../middleware/requireAdmin';
import { asyncHandler } from '../utils/asyncHandler';

export const adminRouter = Router();

adminRouter.use(requireAdmin);
adminRouter.get('/vendors', asyncHandler(listVendorsController));
adminRouter.patch('/vendors/:id/status', asyncHandler(setVendorStatusController));
adminRouter.get('/services', asyncHandler(listServicesController));
adminRouter.patch('/services/:id/status', asyncHandler(setServiceStatusController));
adminRouter.get('/bookings', asyncHandler(listBookingsController));
