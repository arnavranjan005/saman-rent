import { describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  app,
  cleanupCustomer,
  cleanupVendor,
  customerAuth,
  prisma,
  vendorAuth,
} from './helpers';

async function completedBooking() {
  const v = await vendorAuth();
  const c = await customerAuth();
  const created = await request(app)
    .post('/api/v1/vendor/services')
    .set(v.header)
    .send({ name: 'Review Probe', categoryId: 'dj', price: 5000 });
  const serviceId = created.body.data.id;
  // Phase 10: bookings require an APPROVED vendor — approve directly here
  // (the approval flow itself is covered in admin.test.ts).
  await prisma.vendor.update({ where: { id: v.vendor.id }, data: { status: 'APPROVED' } });
  await prisma.service.update({ where: { id: serviceId }, data: { status: 'ACTIVE' } });

  const booking = await request(app).post('/api/v1/bookings').set(c.header).send({
    serviceId,
    date: '2026-12-31',
    startTime: '12:00',
    duration: 2,
    location: 'Koderma Test',
  });
  const bookingId = booking.body.data.id;
  await request(app)
    .patch(`/api/v1/vendor/bookings/${bookingId}/status`)
    .set(v.header)
    .send({ status: 'CONFIRMED' });
  await request(app)
    .patch(`/api/v1/vendor/bookings/${bookingId}/status`)
    .set(v.header)
    .send({ status: 'COMPLETED' });
  return { v, c, serviceId, bookingId };
}

describe('POST /api/v1/bookings/:id/review', () => {
  it(
    'accepts a review on a COMPLETED booking and recomputes the service average',
    { timeout: 120_000 },
    async () => {
    const { v, c, serviceId, bookingId } = await completedBooking();
    let c2Phone = null;
    try {
      const res = await request(app)
        .post(`/api/v1/bookings/${bookingId}/review`)
        .set(c.header)
        .send({ rating: 5, comment: 'Superb sound!' });
      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);

      const svc = await prisma.service.findUniqueOrThrow({ where: { id: serviceId } });
      expect(svc.reviewsCount).toBe(1);
      expect(svc.rating).toBe(5);

      // Second customer rates 3 -> average drops to 4.
      const c2 = await customerAuth();
      c2Phone = c2.phone;
      {
        const b2 = await request(app).post('/api/v1/bookings').set(c2.header).send({
          serviceId,
          date: '2026-12-31',
          startTime: '14:00',
          duration: 2,
          location: 'Koderma Test',
        });
        const b2id = b2.body.data.id;
        await request(app)
          .patch(`/api/v1/vendor/bookings/${b2id}/status`)
          .set(v.header)
          .send({ status: 'CONFIRMED' });
        await request(app)
          .patch(`/api/v1/vendor/bookings/${b2id}/status`)
          .set(v.header)
          .send({ status: 'COMPLETED' });
        const r2 = await request(app)
          .post(`/api/v1/bookings/${b2id}/review`)
          .set(c2.header)
          .send({ rating: 3 });
        expect(r2.status).toBe(201);
        const svc2 = await prisma.service.findUniqueOrThrow({ where: { id: serviceId } });
        expect(svc2.reviewsCount).toBe(2);
        expect(svc2.rating).toBe(4);
      }

      // Public list shows both, newest first, phones masked.
      const list = await request(app).get(`/api/v1/services/${serviceId}/reviews`);
      expect(list.status).toBe(200);
      expect(list.body.data).toHaveLength(2);
      expect(list.body.data[0].rating).toBe(3);
      expect(list.body.data[0].reviewer).toMatch(/^\+\d/);
    } finally {
      if (c2Phone) await cleanupCustomer(c2Phone);
      await cleanupCustomer(c.phone);
      await cleanupVendor(v.vendor.email);
    }
    },
  );

  it('rejects reviews on non-completed bookings and duplicates', async () => {
    const { v, c, bookingId } = await completedBooking();
    try {
      // Fresh PENDING booking cannot be reviewed.
      const serviceId = (
        await prisma.service.findFirstOrThrow({ where: { vendorId: v.vendor.id } })
      ).id;
      const pending = await request(app).post('/api/v1/bookings').set(c.header).send({
        serviceId,
        date: '2026-12-31',
        startTime: '16:00',
        duration: 2,
        location: 'Koderma Test',
      });
      const no = await request(app)
        .post(`/api/v1/bookings/${pending.body.data.id}/review`)
        .set(c.header)
        .send({ rating: 5 });
      expect(no.status).toBe(400);
      expect(no.body.error.code).toBe('BOOKING_NOT_REVIEWABLE');

      // First review ok, second is a duplicate.
      const ok = await request(app)
        .post(`/api/v1/bookings/${bookingId}/review`)
        .set(c.header)
        .send({ rating: 4 });
      expect(ok.status).toBe(201);
      const dup = await request(app)
        .post(`/api/v1/bookings/${bookingId}/review`)
        .set(c.header)
        .send({ rating: 5 });
      expect(dup.status).toBe(400);
      expect(dup.body.error.code).toBe('REVIEW_EXISTS');

      // Rating out of range is rejected by validation.
      const bad = await request(app)
        .post(`/api/v1/bookings/${pending.body.data.id}/review`)
        .set(c.header)
        .send({ rating: 6 });
      expect(bad.status).toBe(400);
      expect(bad.body.error.code).toBe('INVALID_REVIEW');
    } finally {
      await cleanupCustomer(c.phone);
      await cleanupVendor(v.vendor.email);
    }
  });

  it('rejects other customers bookings and unauthenticated calls', async () => {
    const { v, c, bookingId } = await completedBooking();
    const other = await customerAuth();
    try {
      const peek = await request(app)
        .post(`/api/v1/bookings/${bookingId}/review`)
        .set(other.header)
        .send({ rating: 5 });
      expect(peek.status).toBe(404);

      const anon = await request(app)
        .post(`/api/v1/bookings/${bookingId}/review`)
        .send({ rating: 5 });
      expect(anon.status).toBe(401);
    } finally {
      await cleanupCustomer(c.phone);
      await cleanupCustomer(other.phone);
      await cleanupVendor(v.vendor.email);
    }
  });
});
