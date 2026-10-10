import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  listBookings,
  listServices,
  listVendors,
  setServiceStatus,
  setVendorStatus,
} from '../services/adminService';
import { ApiError } from '../utils/ApiError';

function adminId(req: Request): string {
  if (!req.admin) throw ApiError.unauthorized('Admin login required.', 'ADMIN_UNAUTHORIZED');
  return req.admin.id;
}

const vendorsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DISABLED']).optional(),
  search: z.string().max(160).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/** GET /api/v1/admin/vendors */
export async function listVendorsController(req: Request, res: Response): Promise<void> {
  adminId(req);
  const parsed = vendorsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw ApiError.badRequest('Invalid query.', 'INVALID_QUERY');
  res.json({ success: true, data: await listVendors(parsed.data) });
}

const vendorStatusSchema = z.object({
  status: z.enum(['APPROVED', 'DISABLED']),
});

/** PATCH /api/v1/admin/vendors/:id/status */
export async function setVendorStatusController(req: Request, res: Response): Promise<void> {
  adminId(req);
  const parsed = vendorStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Status must be APPROVED or DISABLED.', 'INVALID_STATUS');
  }
  res.json({ success: true, data: await setVendorStatus(req.params.id, parsed.data.status) });
}

const servicesQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'DISABLED']).optional(),
  vendorId: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/** GET /api/v1/admin/services */
export async function listServicesController(req: Request, res: Response): Promise<void> {
  adminId(req);
  const parsed = servicesQuerySchema.safeParse(req.query);
  if (!parsed.success) throw ApiError.badRequest('Invalid query.', 'INVALID_QUERY');
  res.json({ success: true, data: await listServices(parsed.data) });
}

const serviceStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'DISABLED']),
});

/** PATCH /api/v1/admin/services/:id/status */
export async function setServiceStatusController(req: Request, res: Response): Promise<void> {
  adminId(req);
  const parsed = serviceStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Status must be ACTIVE or DISABLED.', 'INVALID_STATUS');
  }
  res.json({ success: true, data: await setServiceStatus(req.params.id, parsed.data.status) });
}

const bookingsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional(),
  vendorId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/** GET /api/v1/admin/bookings */
export async function listBookingsController(req: Request, res: Response): Promise<void> {
  adminId(req);
  const parsed = bookingsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw ApiError.badRequest('Invalid query.', 'INVALID_QUERY');
  res.json({ success: true, data: await listBookings(parsed.data) });
}
