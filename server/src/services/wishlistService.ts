import { getPrisma } from '../lib/prisma';
import { toCard } from './catalogService';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

const wishlistInclude = {
  service: {
    include: {
      images: { orderBy: { sortOrder: 'asc' as const } },
      vendor: { select: { id: true, name: true } },
    },
  },
};

export async function getWishlist(userId: string) {
  const rows = await db().wishlist.findMany({
    where: { userId },
    include: wishlistInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows
    .filter((r) => r.service.status === 'ACTIVE')
    .map((r) => toCard(r.service));
}

/** Idempotent add — saving twice returns the existing entry. */
export async function addWishlist(userId: string, serviceId: string) {
  const prisma = db();
  const service = await prisma.service.findFirst({
    where: { id: serviceId, status: 'ACTIVE' },
    select: { id: true },
  });
  if (!service) throw ApiError.notFound('Service not found.', 'SERVICE_NOT_FOUND');
  await prisma.wishlist.upsert({
    where: { userId_serviceId: { userId, serviceId } },
    update: {},
    create: { userId, serviceId },
  });
  return { saved: true, serviceId };
}

export async function removeWishlist(userId: string, serviceId: string) {
  await db().wishlist.deleteMany({ where: { userId, serviceId } });
  return { saved: false, serviceId };
}
