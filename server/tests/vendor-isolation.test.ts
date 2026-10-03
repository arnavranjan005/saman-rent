import { describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  activeServiceId,
  app,
  cleanupCustomer,
  cleanupVendor,
  customerAuth,
  prisma,
  vendorAuth,
} from './helpers';

describe('role + ownership isolation', () => {
  it('blocks customer tokens on vendor routes', async () => {
    const { header, phone } = await customerAuth();
    try {
      const res = await request(app).get('/api/v1/vendor/stats').set(header);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('NOT_A_VENDOR');
    } finally {
      await cleanupCustomer(phone);
    }
  });

  it('blocks vendor B from vendor A resources', async () => {
    const a = await vendorAuth();
    const b = await vendorAuth();
    try {
      const created = await request(app)
        .post('/api/v1/vendor/services')
        .set(a.header)
        .send({ name: 'Isolation Probe', categoryId: 'dj', price: 5000 });
      expect(created.status).toBe(201);
      const serviceId = created.body.data.id;

      const edit = await request(app)
        .patch(`/api/v1/vendor/services/${serviceId}`)
        .set(b.header)
        .send({ price: 1 });
      expect(edit.status).toBe(404);

      const listB = await request(app).get('/api/v1/vendor/bookings').set(b.header);
      expect(listB.status).toBe(200);
      expect(listB.body.data).toEqual([]);
    } finally {
      await cleanupVendor(a.vendor.email);
      await cleanupVendor(b.vendor.email);
    }
  });

  it('enforces vendor booking status transitions', async () => {
    const v = await vendorAuth();
    const c = await customerAuth();
    try {
      const created = await request(app)
        .post('/api/v1/vendor/services')
        .set(v.header)
        .send({ name: 'Transition Probe', categoryId: 'dj', price: 5000 });
      const serviceId = created.body.data.id;

      // Vendor services start PENDING_APPROVAL — flip ACTIVE directly for the test.
      await prisma.service.update({ where: { id: serviceId }, data: { status: 'ACTIVE' } });

      const booking = await request(app)
        .post('/api/v1/bookings')
        .set(c.header)
        .send({
          serviceId,
          date: '2026-12-31',
          startTime: '12:00',
          duration: 2,
          location: 'Koderma Test',
        });
      expect(booking.status).toBe(201);
      const bookingId = booking.body.data.id;

      // Illegal jump PENDING -> COMPLETED is rejected.
      const bad = await request(app)
        .patch(`/api/v1/vendor/bookings/${bookingId}/status`)
        .set(v.header)
        .send({ status: 'COMPLETED' });
      expect(bad.status).toBe(400);

      const ok = await request(app)
        .patch(`/api/v1/vendor/bookings/${bookingId}/status`)
        .set(v.header)
        .send({ status: 'CONFIRMED' });
      expect(ok.status).toBe(200);
      expect(ok.body.data.status).toBe('CONFIRMED');

      const done = await request(app)
        .patch(`/api/v1/vendor/bookings/${bookingId}/status`)
        .set(v.header)
        .send({ status: 'COMPLETED' });
      expect(done.body.data.status).toBe('COMPLETED');

      // Customer B cannot see customer A's booking.
      const c2 = await customerAuth();
      try {
        const peek = await request(app).get(`/api/v1/bookings/${bookingId}`).set(c2.header);
        expect(peek.status).toBe(404);
      } finally {
        await cleanupCustomer(c2.phone);
      }
    } finally {
      await cleanupCustomer(c.phone);
      await cleanupVendor(v.vendor.email);
    }
  });
});
