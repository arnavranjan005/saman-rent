import { Router } from 'express';
import {
  addServiceImageController,
  createVendorServiceController,
  disableVendorServiceController,
  listVendorBookingsController,
  listVendorServicesController,
  removeServiceImageController,
  setVendorBookingStatusController,
  updateVendorServiceController,
  vendorStatsController,
} from '../controllers/vendorController';
import { requireVendor } from '../middleware/requireVendor';
import { asyncHandler } from '../utils/asyncHandler';

export const vendorRouter = Router();

vendorRouter.use(requireVendor);
vendorRouter.get('/stats', asyncHandler(vendorStatsController));
vendorRouter.get('/services', asyncHandler(listVendorServicesController));
vendorRouter.post('/services', asyncHandler(createVendorServiceController));
vendorRouter.patch('/services/:id', asyncHandler(updateVendorServiceController));
vendorRouter.delete('/services/:id', asyncHandler(disableVendorServiceController));
vendorRouter.post('/services/:id/images', asyncHandler(addServiceImageController));
vendorRouter.delete('/services/:id/images/:imageId', asyncHandler(removeServiceImageController));
vendorRouter.get('/bookings', asyncHandler(listVendorBookingsController));
vendorRouter.patch('/bookings/:id/status', asyncHandler(setVendorBookingStatusController));
