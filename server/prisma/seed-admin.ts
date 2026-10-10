// One-off bootstrap: create/promote the admin user for Phase 10.
// Usage: npx tsx prisma/seed-admin.ts
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from server/.env (never commit).
// The admin row uses a sentinel phone (`admin:<email>`) that can never
// pass normalizePhone, so the OTP/test backdoor can never touch it.

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? '';
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.');
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      phone: `admin:${email}`,
      email,
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`Admin ready — ${admin.email} (id ${admin.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
