import type { Request, Response } from 'express';
import { z } from 'zod';
import { getMe, loginWithFirebaseIdToken, requestOtp, verifyOtp } from '../services/authService';
import { ApiError } from '../utils/ApiError';

const sendSchema = z.object({ phone: z.string().min(1) });
const verifySchema = z.object({ phone: z.string().min(1), otp: z.string().min(1) });
const firebaseSchema = z.object({ idToken: z.string().min(1) });

/** POST /api/v1/auth/send-otp */
export async function sendOtpController(req: Request, res: Response): Promise<void> {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('Phone number is required.', 'INVALID_INPUT');
  res.json({ success: true, data: await requestOtp(parsed.data.phone) });
}

/** POST /api/v1/auth/verify-otp */
export async function verifyOtpController(req: Request, res: Response): Promise<void> {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('Phone number and OTP are required.', 'INVALID_INPUT');
  res.json({ success: true, data: await verifyOtp(parsed.data.phone, parsed.data.otp) });
}

/** POST /api/v1/auth/firebase — customer login via Firebase phone auth */
export async function firebaseController(req: Request, res: Response): Promise<void> {
  const parsed = firebaseSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('Login token is required.', 'INVALID_INPUT');
  res.json({ success: true, data: await loginWithFirebaseIdToken(parsed.data.idToken) });
}

/** GET /api/v1/auth/me */
export async function meController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await getMe(req.user.id) });
}

/**
 * POST /api/v1/auth/logout
 * JWTs are stateless, so logout is completed client-side by deleting the
 * stored token. This endpoint exists so clients have a uniform logout call.
 */
export async function logoutController(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: { loggedOut: true } });
}
