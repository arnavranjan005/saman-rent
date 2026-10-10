import bcrypt from 'bcryptjs';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';
import { normalizePhone } from '../src/lib/otp';

export const app = createApp();
export const prisma = new PrismaClient();

let counter = 0;
const tag = () => `t${Date.now()}${counter++}`;

/**
 * Throwaway customer via the NODE_ENV=test OTP backdoor (code 000000).
 * No send-otp call, so the suite never trips the SMS rate limiter.
 */
export async function customerAuth(raw?: string) {
  // Globally unique per call: 9 + 6 time digits + 3 counter digits.
  const uniq = `${Date.now().toString().slice(-6)}${String(counter++).padStart(3, '0')}`;
  const phone = normalizePhone(raw ?? `9${uniq}`);
  if (!phone) throw new Error(`bad test phone: ${raw}`);
  const verify = await request(app).post('/api/v1/auth/verify-otp').send({ phone, otp: '000000' });
  if (verify.status !== 200) {
    throw new Error(`verify-otp failed: ${verify.status} ${JSON.stringify(verify.body)}`);
  }
  return { header: { Authorization: `Bearer ${verify.body.data.token}` }, phone };
}

/** Register a throwaway vendor, return auth header + record. */
export async function vendorAuth() {
  const t = tag();
  const res = await request(app)
    .post('/api/v1/vendor/auth/register')
    .send({ name: `Test ${t}`, email: `${t}@test.samanrent`, password: 'password123' });
  if (res.status !== 201) throw new Error(`vendor register failed: ${res.status}`);
  return {
    header: { Authorization: `Bearer ${res.body.data.token}` },
    vendor: res.body.data.vendor,
  };
}

/** First ACTIVE service id for booking tests. */
export async function activeServiceId() {
  const svc = await prisma.service.findFirst({
    where: { status: 'ACTIVE', vendor: { status: 'APPROVED' } },
  });
  if (!svc) throw new Error('No ACTIVE service to test against — run the seed first.');
  return svc.id;
}

export async function cleanupCustomer(phone: string) {
  await prisma.user.deleteMany({ where: { phone } });
}

export async function cleanupVendor(email: string) {
  const vendors = await prisma.vendor.findMany({ where: { email }, select: { id: true } });
  const ids = vendors.map((v) => v.id);
  if (ids.length === 0) return;
  const services = await prisma.service.findMany({
    where: { vendorId: { in: ids } },
    select: { id: true },
  });
  const serviceIds = services.map((s) => s.id);
  if (serviceIds.length > 0) {
    await prisma.booking.deleteMany({ where: { serviceId: { in: serviceIds } } });
    await prisma.service.deleteMany({ where: { id: { in: serviceIds } } });
  }
  await prisma.vendor.deleteMany({ where: { id: { in: ids } } });
}

/**
 * Throwaway admin: created directly with role ADMIN, then logged in through
 * the real POST /admin/auth/login endpoint. The sentinel phone can never
 * pass normalizePhone, so the OTP backdoor cannot touch this row.
 */
export async function adminAuth() {
  const t = tag();
  const email = `${t}@admin.samanrent`;
  const password = 'adminpass123';
  await prisma.user.create({
    data: {
      phone: `admin:${email}`,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    },
  });
  const login = await request(app).post('/api/v1/admin/auth/login').send({ email, password });
  if (login.status !== 200) throw new Error(`admin login failed: ${login.status}`);
  return {
    header: { Authorization: `Bearer ${login.body.data.token}` },
    email,
  };
}

export async function cleanupAdmin(email: string) {
  await prisma.user.deleteMany({ where: { email } });
}
