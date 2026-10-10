import type { Request, Response } from 'express';
import { z } from 'zod';
import { getAdminMe, loginAdmin } from '../services/adminAuthService';
import { ApiError } from '../utils/ApiError';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** POST /api/v1/admin/auth/login */
export async function adminLoginController(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('Email and password are required.', 'INVALID_INPUT');
  res.json({ success: true, data: await loginAdmin(parsed.data.email, parsed.data.password) });
}

/** GET /api/v1/admin/auth/me */
export async function adminMeController(req: Request, res: Response): Promise<void> {
  if (!req.admin) throw ApiError.unauthorized('Admin login required.', 'ADMIN_UNAUTHORIZED');
  res.json({ success: true, data: await getAdminMe(req.admin.id) });
}
