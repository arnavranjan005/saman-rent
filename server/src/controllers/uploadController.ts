import type { Request, Response } from 'express';
import { z } from 'zod';
import { createUploadSignature, destroyUpload } from '../lib/cloudinary';
import { ApiError } from '../utils/ApiError';

/** POST /api/v1/uploads/signature */
export async function signatureController(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: createUploadSignature() });
}

const destroySchema = z.object({ publicId: z.string().min(1) });

/** DELETE /api/v1/uploads — body: { publicId } */
export async function destroyController(req: Request, res: Response): Promise<void> {
  const parsed = destroySchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest('publicId is required.', 'INVALID_INPUT');
  await destroyUpload(parsed.data.publicId);
  res.json({ success: true, data: { deleted: true } });
}
