// One-off E2E helper: give the seeded demo vendors login credentials.
// Usage: npx tsx prisma/seed-vendor-creds.ts
// Emails: <slug>@vendor.samanrent.test, password: vendor1234 (dev only).

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function main() {
  const vendors = await prisma.vendor.findMany({ where: { email: null } });
  const passwordHash = await bcrypt.hash('vendor1234', 10);
  for (const v of vendors) {
    const email = `${slug(v.name)}@vendor.samanrent.test`;
    await prisma.vendor.update({
      where: { id: v.id },
      data: { email, passwordHash },
    });
    console.log(`${v.name} -> ${email} / vendor1234`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
