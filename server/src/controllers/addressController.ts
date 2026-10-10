import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from '../services/addressService';
import { ApiError } from '../utils/ApiError';

const addressSchema = z.object({
  label: z.string().min(1).max(30),
  line: z.string().min(1).max(200),
  city: z.string().max(80).optional(),
  state: z.string().max(80).optional(),
  postalCode: z.string().max(20).optional(),
  latitude: z.number(),
  longitude: z.number(),
  isDefault: z.boolean().optional(),
});

const addressPatchSchema = addressSchema.partial();

/** GET /api/v1/addresses */
export async function listAddressesController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await listAddresses(req.user.id) });
}

/** POST /api/v1/addresses */
export async function createAddressController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const parsed = addressSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest('Enter a label, address and live location.', 'INVALID_INPUT');
  }
  res.status(201).json({ success: true, data: await createAddress(req.user.id, parsed.data) });
}

/** PATCH /api/v1/addresses/:id */
export async function updateAddressController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  const parsed = addressPatchSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('Invalid address fields.', 'INVALID_INPUT');
  res.json({ success: true, data: await updateAddress(req.user.id, req.params.id, parsed.data) });
}

/** DELETE /api/v1/addresses/:id */
export async function deleteAddressController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await deleteAddress(req.user.id, req.params.id) });
}
