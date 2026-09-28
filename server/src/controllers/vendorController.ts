import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  addServiceImage,
  createVendorService,
  disableVendorService,
  getVendorStats,
  listVendorBookings,
  listVendorServices,
  removeServiceImage,
  setVendorBookingStatus,
  updateVendorService,
} from '../services/vendorService';
import { ApiError } from '../utils/ApiError';

function vendorId(req: Request): string {
  if (!req.vendor) throw ApiError.unauthorized('Vendor login required.', 'VENDOR_UNAUTHORIZED');
  return req.vendor.id;
}

/** GET /api/v1/vendor/stats */
export async function vendorStatsController(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await getVendorStats(vendorId(req)) });
}

/** GET /api/v1/vendor/services */
export async function listVendorServicesController(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await listVendorServices(vendorId(req)) });
}

const serviceSchema = z.object({
  name: z.string().min(3).max(120),
  categoryId: z.string().min(1),
  price: z.coerce.number().int().min(1),
  location: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  color: z.string().max(16).optional(),
  tag: z.string().max(40).optional(),
});

/** POST /api/v1/vendor/services */
export async function createVendorServiceController(req: Request, res: Response): Promise<void> {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues[0]?.message ?? 'Invalid service details.',
      'INVALID_SERVICE',
    );
  }
  res.status(201).json({
    success: true,
    data: await createVendorService(vendorId(req), parsed.data),
  });
}

const servicePatchSchema = serviceSchema.partial().extend({
  status: z.enum(['DRAFT', 'DISABLED']).optional(),
});

/** PATCH /api/v1/vendor/services/:id */
export async function updateVendorServiceController(req: Request, res: Response): Promise<void> {
  const parsed = servicePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues[0]?.message ?? 'Invalid service details.',
      'INVALID_SERVICE',
    );
  }
  res.json({
    success: true,
    data: await updateVendorService(vendorId(req), req.params.id, parsed.data),
  });
}

/** DELETE /api/v1/vendor/services/:id */
export async function disableVendorServiceController(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await disableVendorService(vendorId(req), req.params.id) });
}

const imageSchema = z.object({
  url: z.string().url().max(500),
  publicId: z.string().max(200).optional(),
});

/** POST /api/v1/vendor/services/:id/images */
export async function addServiceImageController(req: Request, res: Response): Promise<void> {
  const parsed = imageSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('Image url is required.', 'INVALID_IMAGE');
  res.status(201).json({
    success: true,
    data: await addServiceImage(vendorId(req), req.params.id, parsed.data),
  });
}

/** DELETE /api/v1/vendor/services/:id/images/:imageId */
export async function removeServiceImageController(req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: await removeServiceImage(vendorId(req), req.params.id, req.params.imageId),
  });
}

const bookingsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional(),
});

/** GET /api/v1/vendor/bookings */
export async function listVendorBookingsController(req: Request, res: Response): Promise<void> {
  const parsed = bookingsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw ApiError.badRequest('Invalid status filter.', 'INVALID_QUERY');
  res.json({ success: true, data: await listVendorBookings(vendorId(req), parsed.data.status) });
}

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'REJECTED', 'COMPLETED']),
});

/** PATCH /api/v1/vendor/bookings/:id/status */
export async function setVendorBookingStatusController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Status must be CONFIRMED, REJECTED or COMPLETED.', 'INVALID_STATUS');
  }
  res.json({
    success: true,
    data: await setVendorBookingStatus(vendorId(req), req.params.id, parsed.data.status),
  });
}
