import { Router } from 'express';
import { destroyController, signatureController } from '../controllers/uploadController';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadsRouter = Router();

uploadsRouter.use(requireAuth);
uploadsRouter.post('/signature', asyncHandler(signatureController));
uploadsRouter.delete('/', asyncHandler(destroyController));
