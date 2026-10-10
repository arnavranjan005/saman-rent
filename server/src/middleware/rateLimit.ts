import rateLimit from 'express-rate-limit';

function limited(message: string) {
  return {
    success: false,
    error: { code: 'RATE_LIMITED', message },
  };
}

/** 5 OTP sends per 10 min per IP — blocks SMS-abuse while staying dev-friendly. */
export const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limited('Too many OTP requests. Try again in a few minutes.'),
});

/** 20 verify attempts per 10 min per IP (per-code attempt caps also apply). */
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limited('Too many attempts. Try again in a few minutes.'),
});

/** Separate bucket for Firebase logins so SMS-OTP and Firebase attempts don't share a quota. */
export const firebaseLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limited('Too many attempts. Try again in a few minutes.'),
});

/** Separate bucket for admin password logins. */
export const adminLoginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limited('Too many attempts. Try again in a few minutes.'),
});

/** Wishlist toggles: generous for humans, blocks scripts hammering add/remove. */
export const wishlistMutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limited('Too many wishlist updates. Slow down a little.'),
});
