// Phase 2 seed — ports `data/mock.js` into PostgreSQL.
// Image URLs use the `seed://` scheme (local asset references).
// Phase 4 (Cloudinary) replaces them with real CDN URLs.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  { id: 'dj', name: 'DJ Booking', icon: 'headset', lib: 'ion', color: '#EDE9FE', sortOrder: 0 },
  { id: 'tent', name: 'Tent House', icon: 'tent', lib: 'mci', color: '#FEF3C7', sortOrder: 1 },
  { id: 'cars', name: 'Luxury Cars', icon: 'car-sport', lib: 'ion', color: '#DBEAFE', sortOrder: 2 },
] as const;

// Mirrors VENDORS in data/mock.js. `img`/`hero` are asset filenames.
const VENDORS = [
  { name: 'Royal DJ Sound', rating: 4.8, reviews: 120, location: 'Koderma, Jharkhand', price: 15000, category: 'dj', color: '#2D1B69', tag: 'Popular', img: 'dj1.jpg', hero: 'djhero.jpg' },
  { name: 'Power Bass DJ', rating: 4.6, reviews: 86, location: 'Koderma, Jharkhand', price: 10000, category: 'dj', color: '#0EA5E9', tag: 'Popular', img: 'dj2.jpg', hero: null },
  { name: 'Shiv DJ Center', rating: 4.7, reviews: 60, location: 'Satgawan, Koderma', price: 12000, category: 'dj', color: '#065F46', tag: null, img: 'dj3.jpg', hero: null },
  { name: 'High Voltage DJ', rating: 4.5, reviews: 45, location: 'Rajgarhi, Koderma', price: 18000, category: 'dj', color: '#7C2D12', tag: null, img: 'dj4.jpg', hero: null },
  { name: 'Shiv Shakti Tent House', rating: 4.7, reviews: 98, location: 'Satgawan, Koderma', price: 20000, category: 'tent', color: '#B45309', tag: 'Popular', img: 'tent.jpg', hero: null },
  { name: 'BMW 7 Series', rating: 4.9, reviews: 40, location: 'Koderma, Jharkhand', price: 25000, category: 'cars', color: '#111827', tag: null, img: 'bmw.jpg', hero: null },
] as const;

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, icon: c.icon, lib: c.lib, color: c.color, sortOrder: c.sortOrder },
      create: { id: c.id, name: c.name, icon: c.icon, lib: c.lib, color: c.color, sortOrder: c.sortOrder },
    });
  }

  for (const v of VENDORS) {
    let vendor = await prisma.vendor.findFirst({ where: { name: v.name } });
    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: { name: v.name, status: 'APPROVED' },
      });
    }

    // One service per seeded vendor (V1 demo data).
    const existing = await prisma.service.findFirst({
      where: { vendorId: vendor.id, name: v.name },
    });
    if (existing) continue;

    await prisma.service.create({
      data: {
        vendorId: vendor.id,
        categoryId: v.category,
        name: v.name,
        description: `${v.name} — seeded from the V1 mock catalog.`,
        price: v.price,
        location: v.location,
        color: v.color,
        tag: v.tag,
        rating: v.rating,
        reviewsCount: v.reviews,
        status: 'ACTIVE',
        images: {
          create: [
            ...(v.hero
              ? [{ url: `seed://assets/vendors/${v.hero}`, sortOrder: 0 }]
              : []),
            { url: `seed://assets/vendors/${v.img}`, sortOrder: v.hero ? 1 : 0 },
          ],
        },
      },
    });
  }

  const counts = await Promise.all([
    prisma.category.count(),
    prisma.vendor.count(),
    prisma.service.count(),
    prisma.serviceImage.count(),
  ]);
  console.log(
    `Seed done — categories=${counts[0]} vendors=${counts[1]} services=${counts[2]} images=${counts[3]}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
