import { env } from '../config/env';
import { signAccessToken } from '../lib/jwt';
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MINUTES,
  generateOtp,
  hashOtp,
  normalizePhone,
  otpEquals,
} from '../lib/otp';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

/** Create an OTP for the phone. Dev returns the code; production must send SMS. */
export async function requestOtp(rawPhone: string): Promise<{ sent: boolean; devCode?: string }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) {
    throw ApiError.badRequest('Enter a valid 10-digit mobile number.', 'INVALID_PHONE');
  }
  const prisma = db();

  // Invalidate older unconsumed codes so only the newest works.
  await prisma.otpCode.updateMany({
    where: { phone, consumed: false },
    data: { consumed: true },
  });

  const code = generateOtp();
  await prisma.otpCode.create({
    data: {
      phone,
      codeHash: hashOtp(code, phone),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  if (env.NODE_ENV !== 'production') {
    // Dev only — never log raw codes in production.
    console.log(`[auth] OTP for ${phone}: ${code}`);
    return { sent: true, devCode: code };
  }
  // TODO (pre-launch): send `code` via the SMS/OTP provider here.
  return { sent: true };
}

export async function verifyOtp(rawPhone: string, code: string) {
  const phone = normalizePhone(rawPhone);
  if (!phone || !/^\d{6}$/.test(code)) {
    throw ApiError.badRequest('Invalid phone number or OTP.', 'INVALID_INPUT');
  }
  const prisma = db();

  const record = await prisma.otpCode.findFirst({
    where: { phone, consumed: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) {
    throw ApiError.badRequest('No active OTP. Request a new one.', 'OTP_NOT_FOUND');
  }
  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
    throw ApiError.badRequest('OTP expired. Request a new one.', 'OTP_EXPIRED');
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });
    throw ApiError.badRequest('Too many wrong attempts. Request a new OTP.', 'OTP_LOCKED');
  }
  if (!otpEquals(hashOtp(code, phone), record.codeHash)) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    throw ApiError.badRequest('Incorrect OTP.', 'OTP_MISMATCH');
  }
  await prisma.otpCode.update({ where: { id: record.id }, data: { consumed: true } });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({ data: { phone } });
  }

  return {
    token: signAccessToken(user.id, user.role),
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
  };
}

export async function getMe(userId: string) {
  const user = await db().user.findUnique({
    where: { id: userId },
    select: { id: true, phone: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw ApiError.notFound('User not found.', 'USER_NOT_FOUND');
  return user;
}
