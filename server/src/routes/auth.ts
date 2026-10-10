import { Router } from 'express';
import {
  firebaseController,
  logoutController,
  meController,
  sendOtpController,
  verifyOtpController,
} from '../controllers/authController';
import { firebaseLoginLimiter, otpSendLimiter, otpVerifyLimiter } from '../middleware/rateLimit';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

export const authRouter = Router();

authRouter.post('/send-otp', otpSendLimiter, asyncHandler(sendOtpController));
authRouter.post('/verify-otp', otpVerifyLimiter, asyncHandler(verifyOtpController));
authRouter.post('/firebase', firebaseLoginLimiter, asyncHandler(firebaseController));
authRouter.get('/me', requireAuth, asyncHandler(meController));
authRouter.post('/logout', asyncHandler(logoutController));
