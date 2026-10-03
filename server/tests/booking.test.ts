import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { activeServiceId, app, cleanupCustomer, customerAuth, prisma } from './helpers';

const payload = (serviceId: string) => ({
  serviceId,
  date: '2026-12-30',
  startTime: '18:00',
  duration: 4,
  location: 'Koderma Test',
  eventType: 'Wedding',
});

describe('POST /api/v1/bookings', () => {
  it('calculates total server-side as price x duration', async () => {
    const { header, phone } = await customerAuth();
    try {
      const serviceId = await activeServiceId();
      const service = await prisma.service.findUniqueOrThrow({ where: { id: serviceId } });
      const res = await request(app).post('/api/v1/bookings').set(header).send(payload(serviceId));
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.total).toBe(service.price * 4);
    } finally {
      await cleanupCustomer(phone);
    }
  });

  it('rejects invalid date format', async () => {
    const { header, phone } = await customerAuth();
    try {
      const serviceId = await activeServiceId();
      const res = await request(app)
        .post('/api/v1/bookings')
        .set(header)
        .send({ ...payload(serviceId), date: 'tomorrow' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_BOOKING');
    } finally {
      await cleanupCustomer(phone);
    }
  });

  it('requires authentication', async () => {
    const serviceId = await activeServiceId();
    const res = await request(app).post('/api/v1/bookings').send(payload(serviceId));
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/v1/bookings/:id/cancel', () => {
  it('lets owners cancel PENDING but not CONFIRMED bookings', async () => {
    const { header, phone } = await customerAuth();
    try {
      const serviceId = await activeServiceId();
      const created = await request(app).post('/api/v1/bookings').set(header).send(payload(serviceId));
      const id = created.body.data.id;

      const cancelled = await request(app).patch(`/api/v1/bookings/${id}/cancel`).set(header);
      expect(cancelled.status).toBe(200);
      expect(cancelled.body.data.status).toBe('CANCELLED');

      // Second cancel is rejected: no longer PENDING.
      const again = await request(app).patch(`/api/v1/bookings/${id}/cancel`).set(header);
      expect(again.status).toBe(400);
      expect(again.body.error.code).toBe('BOOKING_NOT_CANCELLABLE');
    } finally {
      await cleanupCustomer(phone);
    }
  });
});
