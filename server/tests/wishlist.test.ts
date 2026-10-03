import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { activeServiceId, app, cleanupCustomer, customerAuth, prisma } from './helpers';

describe('wishlist', () => {
  it('adds idempotently: double add yields a single row', async () => {
    const { header, phone } = await customerAuth();
    try {
      const serviceId = await activeServiceId();
      const first = await request(app).post(`/api/v1/wishlist/${serviceId}`).set(header);
      expect(first.status).toBe(200);
      const second = await request(app).post(`/api/v1/wishlist/${serviceId}`).set(header);
      expect(second.status).toBe(200);

      const user = await prisma.user.findUniqueOrThrow({ where: { phone } });
      const count = await prisma.wishlist.count({ where: { userId: user.id, serviceId } });
      expect(count).toBe(1);

      const removed = await request(app).delete(`/api/v1/wishlist/${serviceId}`).set(header);
      expect(removed.status).toBe(200);
      const after = await prisma.wishlist.count({ where: { userId: user.id, serviceId } });
      expect(after).toBe(0);
    } finally {
      await cleanupCustomer(phone);
    }
  });

  it('rejects unauthenticated access and unknown services', async () => {
    const anon = await request(app).get('/api/v1/wishlist');
    expect(anon.status).toBe(401);

    const { header, phone } = await customerAuth();
    try {
      const bad = await request(app).post('/api/v1/wishlist/does-not-exist').set(header);
      expect(bad.status).toBe(404);
      expect(bad.body.error.code).toBe('SERVICE_NOT_FOUND');
    } finally {
      await cleanupCustomer(phone);
    }
  });
});
