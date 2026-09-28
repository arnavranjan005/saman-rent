import type { Prisma } from '@prisma/client';
import { getPrisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

const serviceInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  vendor: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
};

/** Raw image reference passthrough — the Expo app resolves
 *  `seed://` markers to local assets and https:// to remote URIs. */
export function resolveImageUrl(ref?: string | null): string | null {
  return ref ?? null;
}

/** Card shape the Expo app renders (mirrors the old VENDORS mock). */
export function toCard(s: {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  location: string | null;
  price: number;
  categoryId: string;
  color: string | null;
  tag: string | null;
  images: { url: string }[];
  vendor: { id: string; name: string };
}) {
  return {
    id: s.id,
    name: s.name,
    rating: s.rating,
    reviews: s.reviewsCount,
    location: s.location,
    price: s.price,
    category: s.categoryId,
    color: s.color,
    tag: s.tag,
    img: s.images[0]?.url ?? null,
    hero: s.images[1]?.url ?? s.images[0]?.url ?? null,
    vendor: s.vendor,
  };
}

export async function getCategories() {
  return db().category.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getHome() {
  const prisma = db();
  const [categories, popular] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.service.findMany({
      where: { status: 'ACTIVE', tag: 'Popular' },
      include: serviceInclude,
      orderBy: { rating: 'desc' },
      take: 4,
    }),
  ]);
  return { categories, popular: popular.map(toCard) };
}

export interface ServiceQuery {
  q?: string;
  category?: string;
  tag?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export async function getServices(query: ServiceQuery) {
  const prisma = db();
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));

  const where: Prisma.ServiceWhereInput = { status: 'ACTIVE' };
  if (query.category) where.categoryId = query.category;
  if (query.tag) where.tag = query.tag;
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { location: { contains: query.q, mode: 'insensitive' } },
    ];
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price.gte = query.minPrice;
    if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
  }

  const orderBy: Prisma.ServiceOrderByWithRelationInput =
    query.sort === 'price_asc'
      ? { price: 'asc' }
      : query.sort === 'price_desc'
        ? { price: 'desc' }
        : { rating: 'desc' };

  const [total, rows] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      include: serviceInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items: rows.map(toCard),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getServiceById(id: string) {
  const service = await db().service.findFirst({
    where: { id, status: 'ACTIVE' },
    include: serviceInclude,
  });
  if (!service) throw ApiError.notFound('Service not found.', 'SERVICE_NOT_FOUND');
  return {
    ...toCard(service),
    description: service.description,
    images: service.images,
  };
}
