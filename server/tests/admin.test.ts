import { describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  adminAuth,
  app,
  cleanupAdmin,
  cleanupCustomer,
  cleanupVendor,
  customerAuth,
  prisma,
  vendorAuth,
} from './helpers';

describe('POST /api/v1/admin/auth/login', () => {
  it('logs in with email+password and exposes /me', async () => {
    const { header, email } = await adminAuth();
    try {
      const me = await request(app).get('/api/v1/admin/auth/me').set(header);
      expect(me.status).toBe(200);
      expect(me.body.data.email).toBe(email);
      expect(me.body.data.role).toBe('ADMIN');
    } finally {
      await cleanupAdmin(email);
    }
  });

  it('rejects wrong passwords and unknown emails without leaking which', async () => {
    const { email } = await adminAuth();
    try {
      const wrong = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({ email, password: 'wrongpass123' });
      expect(wrong.status).toBe(401);
      expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');

      const unknown = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({ email: 'nobody@admin.samanrent', password: 'whatever123' });
      expect(unknown.status).toBe(401);
      expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
    } finally {
      await cleanupAdmin(email);
    }
  });

  it('keeps customer and vendor tokens out of admin routes', async () => {
    const customer = await customerAuth();
    const vendor = await vendorAuth();
    const admin = await adminAuth();
    try {
      for (const h of [customer.header, vendor.header]) {
        const res = await request(app).get('/api/v1/admin/vendors').set(h);
        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('NOT_AN_ADMIN');
      }
      const anon = await request(app).get('/api/v1/admin/vendors');
      expect(anon.status).toBe(401);

      // Sanity: the admin token itself works.
      const ok = await request(app).get('/api/v1/admin/vendors').set(admin.header);
      expect(ok.status).toBe(200);
      expect(ok.body.data).toMatchObject({ page: 1 });
      expect(Array.isArray(ok.body.data.items)).toBe(true);
    } finally {
      await cleanupCustomer(customer.phone);
      await cleanupVendor(vendor.vendor.email);
      await cleanupAdmin(admin.email);
    }
  });
});

describe('Phase 10 approval lifecycle + catalog gating', () => {
  it('hides PENDING/DISABLED vendors from catalog and bookings until approved', async () => {
    const admin = await adminAuth();
    const vendor = await vendorAuth();
    const customer = await customerAuth();
    const vendorEmail = vendor.vendor.email as string;
    const vendorId = vendor.vendor.id as string;
    try {
      // New vendors register as PENDING.
      expect(vendor.vendor.status).toBe('PENDING');

      // Vendor creates a service → PENDING_APPROVAL, invisible publicly.
      const created = await request(app)
        .post('/api/v1/vendor/services')
        .set(vendor.header)
        .send({ name: 'Gated Hall Test', categoryId: 'tent', price: 5000 });
      expect(created.status).toBe(201);
      const serviceId = created.body.data.id as string;

      const listed = await request(app).get('/api/v1/services');
      expect(listed.body.data.items.map((s: { id: string }) => s.id)).not.toContain(serviceId);
      expect(await request(app).get(`/api/v1/services/${serviceId}`)).toMatchObject({
        status: 404,
      });
      const blocked = await request(app).post('/api/v1/bookings').set(customer.header).send({
        serviceId,
        date: '2026-12-30',
        startTime: '18:00',
        duration: 4,
        location: 'Koderma Test',
      });
      expect(blocked.status).toBe(404);
      expect(blocked.body.error.code).toBe('SERVICE_NOT_FOUND');

      // Admin sees the applicant and approves vendor + service.
      const pending = await request(app).get('/api/v1/admin/vendors?status=PENDING').set(admin.header);
      expect(pending.status).toBe(200);
      expect(pending.body.data.items.map((v: { id: string }) => v.id)).toContain(vendorId);

      const approveVendor = await request(app)
        .patch(`/api/v1/admin/vendors/${vendorId}/status`)
        .set(admin.header)
        .send({ status: 'APPROVED' });
      expect(approveVendor.status).toBe(200);
      expect(approveVendor.body.data.status).toBe('APPROVED');

      const approveService = await request(app)
        .patch(`/api/v1/admin/services/${serviceId}/status`)
        .set(admin.header)
        .send({ status: 'ACTIVE' });
      expect(approveService.status).toBe(200);

      // Now publicly visible and bookable.
      expect((await request(app).get(`/api/v1/services/${serviceId}`)).status).toBe(200);
      const booked = await request(app).post('/api/v1/bookings').set(customer.header).send({
        serviceId,
        date: '2026-12-30',
        startTime: '18:00',
        duration: 4,
        location: 'Koderma Test',
      });
      expect(booked.status).toBe(201);
      const bookingId = booked.body.data.id as string;

      // Admin bookings view (read-only) contains it.
      const adminBookings = await request(app).get('/api/v1/admin/bookings').set(admin.header);
      expect(adminBookings.status).toBe(200);
      expect(adminBookings.body.data.items.map((b: { id: string }) => b.id)).toContain(bookingId);

      // Disabling the vendor hides everything again and blocks vendor login.
      const disable = await request(app)
        .patch(`/api/v1/admin/vendors/${vendorId}/status`)
        .set(admin.header)
        .send({ status: 'DISABLED' });
      expect(disable.status).toBe(200);
      expect((await request(app).get(`/api/v1/services/${serviceId}`)).status).toBe(404);
      const relisted = await request(app).get('/api/v1/services');
      expect(relisted.body.data.items.map((s: { id: string }) => s.id)).not.toContain(serviceId);
      const rebook = await request(app).post('/api/v1/bookings').set(customer.header).send({
        serviceId,
        date: '2026-12-30',
        startTime: '18:00',
        duration: 4,
        location: 'Koderma Test',
      });
      expect(rebook.status).toBe(404);
      const vendorLogin = await request(app)
        .post('/api/v1/vendor/auth/login')
        .send({ email: vendorEmail, password: 'password123' });
      expect(vendorLogin.status).toBe(403);
      expect(vendorLogin.body.error.code).toBe('VENDOR_DISABLED');

      // Re-approving restores visibility.
      await request(app)
        .patch(`/api/v1/admin/vendors/${vendorId}/status`)
        .set(admin.header)
        .send({ status: 'APPROVED' });
      expect((await request(app).get(`/api/v1/services/${serviceId}`)).status).toBe(200);
    } finally {
      await cleanupCustomer(customer.phone);
      await cleanupVendor(vendorEmail);
      await cleanupAdmin(admin.email);
    }
  }, 120000);

  it('validates status bodies and unknown ids', async () => {
    const { header, email } = await adminAuth();
    try {
      const bad = await request(app)
        .patch('/api/v1/admin/vendors/does-not-exist/status')
        .set(header)
        .send({ status: 'BANNED' });
      expect(bad.status).toBe(400);
      expect(bad.body.error.code).toBe('INVALID_STATUS');

      const missing = await request(app)
        .patch('/api/v1/admin/vendors/does-not-exist/status')
        .set(header)
        .send({ status: 'APPROVED' });
      expect(missing.status).toBe(404);
      expect(missing.body.error.code).toBe('VENDOR_NOT_FOUND');

      const missingSvc = await request(app)
        .patch('/api/v1/admin/services/does-not-exist/status')
        .set(header)
        .send({ status: 'ACTIVE' });
      expect(missingSvc.status).toBe(404);
      expect(missingSvc.body.error.code).toBe('SERVICE_NOT_FOUND');

      // Seeded catalog is visible to admins with filters.
      const active = await request(app).get('/api/v1/admin/services?status=ACTIVE').set(header);
      expect(active.status).toBe(200);
      expect(active.body.data.total).toBeGreaterThan(0);
      const svc = active.body.data.items[0];
      const byVendor = await request(app)
        .get(`/api/v1/admin/services?vendorId=${svc.vendor.id}`)
        .set(header);
      expect(byVendor.body.data.items.length).toBeGreaterThan(0);
    } finally {
      await cleanupAdmin(email);
    }
  });
});
