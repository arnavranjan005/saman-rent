import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, cleanupCustomer } from './helpers';

describe('OTP flow (single send-otp exercise; rest of suite uses the test backdoor)', () => {
  it('sends an OTP and verifies with the dev code', async () => {
    const phone = '9876501234';
    try {
      const send = await request(app).post('/api/v1/auth/send-otp').send({ phone });
      expect(send.status).toBe(200);
      expect(send.body.data.devCode).toMatch(/^\d{6}$/);

      const verify = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phone, otp: send.body.data.devCode });
      expect(verify.status).toBe(200);
      expect(verify.body.data.token).toBeTruthy();

      const me = await request(app)
        .get('/api/v1/auth/me')
        .set({ Authorization: `Bearer ${verify.body.data.token}` });
      expect(me.status).toBe(200);
      expect(me.body.data.phone).toBe('+919876501234');
    } finally {
      await cleanupCustomer('+919876501234');
    }
  });

  it('rejects bad phones and wrong codes', async () => {
    const badPhone = await request(app).post('/api/v1/auth/send-otp').send({ phone: '123' });
    expect(badPhone.status).toBe(400);

    const wrong = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phone: '9876501234', otp: '999999' });
    expect(wrong.status).toBe(400);
    expect(['OTP_NOT_FOUND', 'OTP_MISMATCH']).toContain(wrong.body.error.code);
  });
});
