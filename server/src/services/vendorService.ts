import { getPrisma } from '../lib/prisma';
import { resolveImageUrl, toCard } from './catalogService';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

const serviceDetailInclude = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  category: { select: { id: true, name: true } },
  _count: { select: { bookings: true } },
};

/** Dashboard aggregates. Earnings = Σ total of COMPLETED bookings. */
export async function getVendorStats(vendorId: string) {
  const prisma = db();
  const [totalBookings, completed, pendingCount, recent, serviceCount] = await Promise.all([
    prisma.booking.count({ where: { service: { vendorId } } }),
    prisma.booking.aggregate({
      where: { service: { vendorId }, status: 'COMPLETED' },
      _sum: { total: true },
    }),
    prisma.booking.count({ where: { service: { vendorId }, status: 'PENDING' } }),
    prisma.booking.findMany({
      where: { service: { vendorId } },
      include: {
        service: { select: { id: true, name: true } },
        user: { select: { id: true, phone: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.service.count({ where: { vendorId } }),
  ]);
  return {
    totalBookings,
    totalEarnings: completed._sum.total ?? 0,
    pendingCount,
    serviceCount,
    recentBookings: recent.map((b) => ({
      id: b.id,
      date: b.date,
      startTime: b.startTime,
      total: b.total,
      status: b.status,
      service: b.service,
      customer: b.user,
    })),
  };
}

export async function listVendorServices(vendorId: string) {
  const rows = await db().service.findMany({
    where: { vendorId },
    include: serviceDetailInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((s) => ({
    ...toCard({
      ...s,
      vendor: { id: vendorId, name: '' },
      images: s.images,
    }),
    description: s.description,
    status: s.status,
    bookingCount: s._count.bookings,
    images: s.images,
    category: s.category,
  }));
}

export interface UpsertServiceInput {
  name: string;
  categoryId: string;
  price: number;
  location?: string;
  description?: string;
  color?: string;
  tag?: string;
}

async function assertCategory(categoryId: string) {
  const cat = await db().category.findUnique({ where: { id: categoryId } });
  if (!cat) throw ApiError.badRequest('Unknown category.', 'INVALID_CATEGORY');
}

/** New/edited services go to PENDING_APPROVAL — only admin (Phase 10) activates. */
export async function createVendorService(vendorId: string, input: UpsertServiceInput) {
  await assertCategory(input.categoryId);
  const service = await db().service.create({
    data: {
      vendorId,
      categoryId: input.categoryId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      price: input.price,
      location: input.location?.trim() || null,
      color: input.color ?? null,
      tag: input.tag ?? null,
      status: 'PENDING_APPROVAL',
    },
    include: serviceDetailInclude,
  });
  return service;
}

export async function updateVendorService(
  vendorId: string,
  serviceId: string,
  input: Partial<UpsertServiceInput> & { status?: 'DRAFT' | 'DISABLED' },
) {
  const prisma = db();
  const existing = await prisma.service.findFirst({ where: { id: serviceId, vendorId } });
  if (!existing) throw ApiError.notFound('Service not found.', 'SERVICE_NOT_FOUND');
  if (input.categoryId) await assertCategory(input.categoryId);

  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.price !== undefined) data.price = input.price;
  if (input.location !== undefined) data.location = input.location?.trim() || null;
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.color !== undefined) data.color = input.color;
  if (input.tag !== undefined) data.tag = input.tag;
  if (input.status !== undefined) {
    data.status = input.status;
  } else if (existing.status === 'ACTIVE') {
    // Edits to a live service need re-approval.
    data.status = 'PENDING_APPROVAL';
  }

  return prisma.service.update({
    where: { id: serviceId },
    data,
    include: serviceDetailInclude,
  });
}

/** Soft-disable so booking history is preserved. */
export async function disableVendorService(vendorId: string, serviceId: string) {
  return updateVendorService(vendorId, serviceId, { status: 'DISABLED' });
}

export async function addServiceImage(
  vendorId: string,
  serviceId: string,
  input: { url: string; publicId?: string },
) {
  const prisma = db();
  const service = await prisma.service.findFirst({
    where: { id: serviceId, vendorId },
    include: { images: true },
  });
  if (!service) throw ApiError.notFound('Service not found.', 'SERVICE_NOT_FOUND');
  return prisma.serviceImage.create({
    data: {
      serviceId,
      url: input.url,
      publicId: input.publicId ?? null,
      sortOrder: service.images.length,
    },
  });
}

export async function removeServiceImage(vendorId: string, serviceId: string, imageId: string) {
  const prisma = db();
  const image = await prisma.serviceImage.findFirst({
    where: { id: imageId, serviceId, service: { vendorId } },
  });
  if (!image) throw ApiError.notFound('Image not found.', 'IMAGE_NOT_FOUND');
  await prisma.serviceImage.delete({ where: { id: imageId } });
  return { deleted: true, publicId: image.publicId };
}

const bookingInclude = {
  service: { select: { id: true, name: true } },
  user: { select: { id: true, phone: true, name: true } },
};

export async function listVendorBookings(vendorId: string, status?: string) {
  const rows = await db().booking.findMany({
    where: {
      service: { vendorId },
      ...(status ? { status: status as 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED' } : {}),
    },
    include: bookingInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((b) => ({
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
  }));
}

const VENDOR_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: ['COMPLETED'],
};

export async function setVendorBookingStatus(vendorId: string, bookingId: string, status: string) {
  const prisma = db();
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, service: { vendorId } },
  });
  if (!booking) throw ApiError.notFound('Booking not found.', 'BOOKING_NOT_FOUND');
  const allowed = VENDOR_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot move booking from ${booking.status} to ${status}.`,
      'INVALID_TRANSITION',
    );
  }
  return prisma.booking.update({ where: { id: bookingId }, data: { status: status as 'CONFIRMED' | 'REJECTED' | 'COMPLETED' } });
}

export { resolveImageUrl };
