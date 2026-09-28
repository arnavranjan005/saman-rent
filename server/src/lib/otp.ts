import { createHash, randomInt, timingSafeEqual } from 'crypto';

export const OTP_TTL_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;

/** Cryptographically random 6-digit code. */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/** SHA-256 hash so raw codes are never stored. Never log raw codes in production. */
export function hashOtp(code: string, phone: string): string {
  return createHash('sha256').update(`${phone}:${code}`).digest('hex');
}

export function otpEquals(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/**
 * Accept `98765 43210`, `+91-9876543210`, `919876543210`, etc.
 * Returns normalized `+91XXXXXXXXXX` or null when invalid.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}
