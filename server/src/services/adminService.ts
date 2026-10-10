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

function paging(page?: number, limit?: number) {
  const p = Math.max(1, page ?? 1);
  const l = Math.min(50, Math.max(1, limit ?? 20));
  return { page: p, limit: l, skip: (p - 1) * l };
}

function pageOf(total: number, limit: number, page: number) {
  return { total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export interface VendorQuery {
  status?: 'PENDING' | 'APPROVED' | 'DISABLED';
  search?: string;
  page?: number;
  limit?: number;
}

/** All vendors, newest first. Includes service + booking counts. */
export async function listVendors(query: VendorQuery) {
  const prisma = db();
  const { page, limit, skip } = paging(query.page, query.limit);
  const where: Prisma.VendorWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.search) {
    const s = query.search.trim();
    if (s) {
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
      ];
    }
  }
  const [total, rows] = await Promise.all([
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      where,
      include: { _count: { select: { services: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);
  const items = await Promise.all(
    rows.map(async (v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
      phone: v.phone,
      status: v.status,
      createdAt: v.createdAt,
      serviceCount: v._count.services,
      bookingCount: await prisma.booking.count({ where: { service: { vendorId: v.id } } }),
    })),
  );
  return { items, page, limit, ...pageOf(total, limit, page) };
}

/** PENDING→APPROVED (approve, incl. re-approve), any→DISABLED (disable/reject). Same-status is a no-op. */
export async function setVendorStatus(vendorId: string, status: 'APPROVED' | 'DISABLED') {
  const prisma = db();
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw ApiError.notFound('Vendor not found.', 'VENDOR_NOT_FOUND');
  if (vendor.status === status) return vendor;
  return prisma.vendor.update({ where: { id: vendorId }, data: { status } });
}

export interface ServiceQuery {
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED';
  vendorId?: string;
  category?: string;
  page?: number;
  limit?: number;
}

const adminServiceInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  vendor: { select: { id: true, name: true, status: true } },
  category: { select: { id: true, name: true } },
  _count: { select: { bookings: true } },
};

/** All services across vendors, newest first. */
export async function listServices(query: ServiceQuery) {
  const prisma = db();
  const { page, limit, skip } = paging(query.page, query.limit);
  const where: Prisma.ServiceWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.vendorId) where.vendorId = query.vendorId;
  if (query.category) where.categoryId = query.category;
  const [total, rows] = await Promise.all([
    prisma.service.count({ where }),
    prisma.service.findMany({
      where,
      include: adminServiceInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);
  return {
    items: rows.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      location: s.location,
      rating: s.rating,
      reviewsCount: s.reviewsCount,
      status: s.status,
      createdAt: s.createdAt,
      vendor: s.vendor,
      category: s.category,
      images: s.images,
      bookingCount: s._count.bookings,
    })),
    page,
    limit,
    ...pageOf(total, limit, page),
  };
}

/** PENDING_APPROVAL|DRAFT→ACTIVE (approve), any→DISABLED, DISABLED→ACTIVE (re-approve). Same-status is a no-op. */
export async function setServiceStatus(serviceId: string, status: 'ACTIVE' | 'DISABLED') {
  const prisma = db();
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw ApiError.notFound('Service not found.', 'SERVICE_NOT_FOUND');
  if (service.status === status) {
    return prisma.service.findUniqueOrThrow({
      where: { id: serviceId },
      include: adminServiceInclude,
    });
  }
  return prisma.service.update({
    where: { id: serviceId },
    data: { status },
    include: adminServiceInclude,
  });
}

export interface BookingQuery {
  status?: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  vendorId?: string;
  serviceId?: string;
  page?: number;
  limit?: number;
}

const adminBookingInclude = {
  service: { select: { id: true, name: true, vendor: { select: { id: true, name: true } } } },
  user: { select: { id: true, phone: true, name: true } },
};

/** All bookings, newest first (read-only for admin). */
export async function listBookings(query: BookingQuery) {
  const prisma = db();
  const { page, limit, skip } = paging(query.page, query.limit);
  const where: Prisma.BookingWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.serviceId) where.serviceId = query.serviceId;
  if (query.vendorId) where.service = { vendorId: query.vendorId };
  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      include: adminBookingInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);
  return {
    items: rows.map((b) => ({
      id: b.id,
      date: b.date,
      startTime: b.startTime,
      duration: b.duration,
      location: b.location,
      eventType: b.eventType,
      notes: b.notes,
      total: b.total,
      status: b.status,
      createdAt: b.createdAt,
      service: b.service,
      customer: b.user,
    })),
    page,
    limit,
    ...pageOf(total, limit, page),
  };
}
