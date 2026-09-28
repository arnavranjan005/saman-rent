import bcrypt from 'bcryptjs';
import { signAccessToken } from '../lib/jwt';
import { normalizePhone } from '../lib/otp';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

export interface RegisterVendorInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

function toPublic(v: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: 'PENDING' | 'APPROVED' | 'DISABLED';
}) {
  return { id: v.id, name: v.name, email: v.email, phone: v.phone, status: v.status };
}

/** Self-registration → PENDING (admin approves in Phase 10). */
export async function registerVendor(input: RegisterVendorInput) {
  const prisma = db();
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.vendor.findFirst({
    where: { OR: [{ email }, ...(input.phone ? [{ phone: input.phone }] : [])] },
    select: { id: true },
  });
  if (existing) {
    throw ApiError.badRequest('A vendor with this email or phone already exists.', 'VENDOR_EXISTS');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const vendor = await prisma.vendor.create({
    data: { name: input.name.trim(), email, phone: input.phone ?? null, passwordHash },
  });
  return {
    token: signAccessToken(vendor.id, 'VENDOR'),
    vendor: toPublic(vendor),
  };
}

export async function loginVendor(email: string, password: string) {
  const prisma = db();
  const vendor = await prisma.vendor.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!vendor || !vendor.passwordHash) {
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }
  if (vendor.status === 'DISABLED') {
    throw ApiError.forbidden('This vendor account is disabled.', 'VENDOR_DISABLED');
  }
  const ok = await bcrypt.compare(password, vendor.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  return {
    token: signAccessToken(vendor.id, 'VENDOR'),
    vendor: toPublic(vendor),
  };
}

export async function getVendorMe(vendorId: string) {
  const vendor = await db().vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      _count: { select: { services: true } },
    },
  });
  if (!vendor) throw ApiError.notFound('Vendor not found.', 'VENDOR_NOT_FOUND');
  return { ...vendor, serviceCount: vendor._count.services };
}

export { normalizePhone };
