import { Router } from 'express';
import {
  vendorLoginController,
  vendorMeController,
  vendorRegisterController,
} from '../controllers/vendorAuthController';
import { otpSendLimiter, otpVerifyLimiter } from '../middleware/rateLimit';
import { requireVendor } from '../middleware/requireVendor';
import { asyncHandler } from '../utils/asyncHandler';

export const vendorAuthRouter = Router();

vendorAuthRouter.post('/register', otpSendLimiter, asyncHandler(vendorRegisterController));
vendorAuthRouter.post('/login', otpVerifyLimiter, asyncHandler(vendorLoginController));
vendorAuthRouter.get('/me', requireVendor, asyncHandler(vendorMeController));
