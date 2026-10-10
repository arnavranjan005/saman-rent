import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, cleanupCustomer, customerAuth, prisma } from './helpers';

const koderma = { latitude: 24.4631, longitude: 85.5947 };

function payload(over: Record<string, unknown> = {}) {
  return {
    label: 'Home',
    line: '12 Station Road',
    city: 'Koderma',
    state: 'Jharkhand',
    postalCode: '825301',
    ...koderma,
    ...over,
  };
}

describe('addresses', () => {
  it('creates the first address as default, lists default-first', async () => {
    const { header, phone } = await customerAuth();
    try {
      const first = await request(app).post('/api/v1/addresses').set(header).send(payload());
      expect(first.status).toBe(201);
      expect(first.body.data.isDefault).toBe(true);
      expect(first.body.data.city).toBe('Koderma');
      expect(first.body.data.postalCode).toBe('825301');

      const second = await request(app)
        .post('/api/v1/addresses')
        .set(header)
        .send(payload({ label: 'Work', line: '5 Main Street' }));
      expect(second.status).toBe(201);
      expect(second.body.data.isDefault).toBe(false);

      const list = await request(app).get('/api/v1/addresses').set(header);
      expect(list.status).toBe(200);
      expect(list.body.data).toHaveLength(2);
      expect(list.body.data[0].isDefault).toBe(true);
      expect(list.body.data[0].latitude).toBeCloseTo(koderma.latitude);
    } finally {
      await cleanupCustomer(phone);
    }
  });

  it('moves the default on update and promotes on delete', async () => {
    const { header, phone } = await customerAuth();
    try {
      const a = await request(app).post('/api/v1/addresses').set(header).send(payload());
      const b = await request(app)
        .post('/api/v1/addresses')
        .set(header)
        .send(payload({ label: 'Other', line: '9 Park Lane' }));

      const move = await request(app)
        .patch(`/api/v1/addresses/${b.body.data.id}`)
        .set(header)
        .send({ isDefault: true });
      expect(move.status).toBe(200);
      expect(move.body.data.isDefault).toBe(true);

      const del = await request(app).delete(`/api/v1/addresses/${b.body.data.id}`).set(header);
      expect(del.status).toBe(200);

      const list = await request(app).get('/api/v1/addresses').set(header);
      expect(list.body.data).toHaveLength(1);
      expect(list.body.data[0].id).toBe(a.body.data.id);
      expect(list.body.data[0].isDefault).toBe(true);
    } finally {
      await cleanupCustomer(phone);
    }
  });

  it('rejects bad labels, short lines and out-of-range coords', async () => {
    const { header, phone } = await customerAuth();
    try {
      const badLabel = await request(app).post('/api/v1/addresses').set(header).send(payload({ label: 'HQ' }));
      expect(badLabel.status).toBe(400);
      const shortLine = await request(app).post('/api/v1/addresses').set(header).send(payload({ line: 'ab' }));
      expect(shortLine.status).toBe(400);
      const badLat = await request(app).post('/api/v1/addresses').set(header).send(payload({ latitude: 91 }));
      expect(badLat.status).toBe(400);
    } finally {
      await cleanupCustomer(phone);
    }
  });

  it('isolates owners and rejects anonymous callers', async () => {
    const anon = await request(app).get('/api/v1/addresses');
    expect(anon.status).toBe(401);

    const a = await customerAuth();
    const b = await customerAuth();
    try {
      const created = await request(app).post('/api/v1/addresses').set(a.header).send(payload());
      const id = created.body.data.id;

      const otherList = await request(app).get('/api/v1/addresses').set(b.header);
      expect(otherList.body.data).toHaveLength(0);
      const hijack = await request(app)
        .patch(`/api/v1/addresses/${id}`)
        .set(b.header)
        .send({ line: 'Hijacked' });
      expect(hijack.status).toBe(404);
      const delOther = await request(app).delete(`/api/v1/addresses/${id}`).set(b.header);
      expect(delOther.status).toBe(404);
    } finally {
      await cleanupCustomer(a.phone);
      await cleanupCustomer(b.phone);
    }
  });
});
