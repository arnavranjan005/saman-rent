import { getPrisma } from '../lib/prisma';
import { resolveImageUrl } from './catalogService';
import { ApiError } from '../utils/ApiError';

function db() {
  const prisma = getPrisma();
  if (!prisma) {
    throw new ApiError(503, 'DB_NOT_CONFIGURED', 'Database is not configured yet.');
  }
  return prisma;
}

const bookingInclude = {
  review: { select: { id: true, rating: true } },
  service: {
    select: {
      id: true,
      name: true,
      location: true,
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
      vendor: { select: { id: true, name: true } },
    },
  },
};

function toBooking(b: {
  id: string;
  date: string;
  startTime: string;
  duration: number;
  location: string;
  eventType: string | null;
  notes: string | null;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  createdAt: Date;
  review: { id: string; rating: number } | null;
  service: {
    id: string;
    name: string;
    location: string | null;
    images: { url: string }[];
    vendor: { id: string; name: string };
  };
}) {
  return {
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
    review: b.review ? { id: b.review.id, rating: b.review.rating } : null,
    service: {
      id: b.service.id,
      name: b.service.name,
      location: b.service.location,
      img: resolveImageUrl(b.service.images[0]?.url),
      vendor: b.service.vendor,
    },
  };
}

export interface CreateBookingInput {
  serviceId: string;
  date: string;
  startTime: string;
  duration: number;
  location: string;
  eventType?: string;
  notes?: string;
}

/**
 * Create a PENDING booking request. The total is always calculated
 * server-side (price × duration); any client-supplied total is ignored.
 */
export async function createBooking(userId: string, input: CreateBookingInput) {
  const prisma = db();
  // Phase 10: only book services that are ACTIVE and belong to an APPROVED
  // vendor. Same 404 shape as before — never leak the vendor's status.
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, status: 'ACTIVE', vendor: { status: 'APPROVED' } },
    select: { id: true, price: true },
  });
  if (!service) throw ApiError.notFound('Service not found.', 'SERVICE_NOT_FOUND');

  const booking = await prisma.booking.create({
    data: {
      userId,
      serviceId: service.id,
      date: input.date,
      startTime: input.startTime,
      duration: input.duration,
      location: input.location,
      eventType: input.eventType,
      notes: input.notes,
      total: service.price * input.duration,
    },
    include: bookingInclude,
  });
  return toBooking(booking);
}

/** Own bookings, upcoming dates first. */
export async function listBookings(userId: string) {
  const rows = await db().booking.findMany({
    where: { userId },
    include: bookingInclude,
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  });
  return rows.map(toBooking);
}

export async function getBookingById(userId: string, id: string) {
  const booking = await db().booking.findFirst({
    where: { id, userId },
    include: bookingInclude,
  });
  if (!booking) throw ApiError.notFound('Booking not found.', 'BOOKING_NOT_FOUND');
  return toBooking(booking);
}

/** Customers may cancel only their own PENDING bookings. */
export async function cancelBooking(userId: string, id: string) {
  const prisma = db();
  const booking = await prisma.booking.findFirst({ where: { id, userId } });
  if (!booking) throw ApiError.notFound('Booking not found.', 'BOOKING_NOT_FOUND');
  if (booking.status !== 'PENDING') {
    throw ApiError.badRequest(
      `Only pending bookings can be cancelled (current: ${booking.status}).`,
      'BOOKING_NOT_CANCELLABLE',
    );
  }
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: bookingInclude,
  });
  return toBooking(updated);
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}

/**
 * Rate a COMPLETED booking (one review per booking, owner only).
 * Recomputes the service's average rating + review count.
 */
export async function createReview(userId: string, bookingId: string, input: CreateReviewInput) {
  const prisma = db();
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { review: { select: { id: true } } },
  });
  if (!booking) throw ApiError.notFound('Booking not found.', 'BOOKING_NOT_FOUND');
  if (booking.status !== 'COMPLETED') {
    throw ApiError.badRequest(
      `Only completed bookings can be reviewed (current: ${booking.status}).`,
      'BOOKING_NOT_REVIEWABLE',
    );
  }
  if (booking.review) {
    throw ApiError.badRequest('This booking has already been reviewed.', 'REVIEW_EXISTS');
  }
  const created = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId: booking.id,
        serviceId: booking.serviceId,
        userId,
        rating: input.rating,
        comment: input.comment || null,
      },
    });
    const agg = await tx.review.aggregate({
      where: { serviceId: booking.serviceId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await tx.service.update({
      where: { id: booking.serviceId },
      data: { rating: agg._avg.rating ?? 0, reviewsCount: agg._count._all },
    });
    return review;
  });
  return {
    id: created.id,
    bookingId: created.bookingId,
    serviceId: created.serviceId,
    rating: created.rating,
    comment: created.comment,
    createdAt: created.createdAt,
  };
}
