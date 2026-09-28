import type { Request, Response } from 'express';
import { z } from 'zod';
import { getVendorMe, loginVendor, registerVendor } from '../services/vendorAuthService';
import { ApiError } from '../utils/ApiError';

const registerSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(10).max(16).optional(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** POST /api/v1/vendor/auth/register */
export async function vendorRegisterController(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      parsed.error.issues[0]?.message ?? 'Invalid registration details.',
      'INVALID_INPUT',
    );
  }
  res.status(201).json({ success: true, data: await registerVendor(parsed.data) });
}

/** POST /api/v1/vendor/auth/login */
export async function vendorLoginController(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('Email and password are required.', 'INVALID_INPUT');
  res.json({ success: true, data: await loginVendor(parsed.data.email, parsed.data.password) });
}

/** GET /api/v1/vendor/auth/me */
export async function vendorMeController(req: Request, res: Response): Promise<void> {
  if (!req.vendor) throw ApiError.unauthorized('Vendor login required.', 'VENDOR_UNAUTHORIZED');
  res.json({ success: true, data: await getVendorMe(req.vendor.id) });
}
