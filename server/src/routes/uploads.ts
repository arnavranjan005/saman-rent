import { Router } from 'express';
import { destroyController, signatureController } from '../controllers/uploadController';
import { requireCustomerOrVendor } from '../middleware/requireVendor';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadsRouter = Router();

uploadsRouter.use(requireCustomerOrVendor);
uploadsRouter.post('/signature', asyncHandler(signatureController));
uploadsRouter.delete('/', asyncHandler(destroyController));
