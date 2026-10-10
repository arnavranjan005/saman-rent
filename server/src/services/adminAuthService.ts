import bcrypt from 'bcryptjs';
import { signAccessToken } from '../lib/jwt';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

function toPublic(a: { id: string; email: string | null; name: string | null }) {
  return { id: a.id, email: a.email, name: a.name };
}

/** Email+password login for Phase 10 admins (seeded via prisma/seed-admin.ts). */
export async function loginAdmin(email: string, password: string) {
  const prisma = db();
  const admin = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!admin || admin.role !== 'ADMIN' || !admin.passwordHash) {
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  return {
    token: signAccessToken(admin.id, 'ADMIN'),
    admin: toPublic(admin),
  };
}

export async function getAdminMe(adminId: string) {
  const admin = await db().user.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!admin || admin.role !== 'ADMIN') {
    throw ApiError.notFound('Admin not found.', 'ADMIN_NOT_FOUND');
  }
  return admin;
}
