import { Router } from 'express';
import { adminLoginController, adminMeController } from '../controllers/adminAuthController';
import { adminLoginLimiter } from '../middleware/rateLimit';
import { requireAdmin } from '../middleware/requireAdmin';
import { asyncHandler } from '../utils/asyncHandler';

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', adminLoginLimiter, asyncHandler(adminLoginController));
adminAuthRouter.get('/me', requireAdmin, asyncHandler(adminMeController));
