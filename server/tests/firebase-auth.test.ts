import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { ApiError } from '../src/utils/ApiError';
import { app, cleanupCustomer } from './helpers';

vi.mock('../src/lib/firebase', () => ({ verifyFirebaseIdToken: vi.fn() }));

// eslint-disable-next-line import/first
import { verifyFirebaseIdToken } from '../src/lib/firebase';

const mockVerify = vi.mocked(verifyFirebaseIdToken);

describe('POST /auth/firebase (Firebase phone-auth login)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('verifies the ID token and returns our JWT for a verified +91 number', async () => {
    mockVerify.mockResolvedValue({ uid: 'firebase-uid-1', phoneNumber: '+919876501111' });
    try {
      const login = await request(app).post('/api/v1/auth/firebase').send({ idToken: 'fake-id-token' });
      expect(login.status).toBe(200);
      expect(login.body.data.token).toBeTruthy();
      expect(login.body.data.user.phone).toBe('+919876501111');

      const me = await request(app)
        .get('/api/v1/auth/me')
        .set({ Authorization: `Bearer ${login.body.data.token}` });
      expect(me.status).toBe(200);
      expect(me.body.data.phone).toBe('+919876501111');
    } finally {
      await cleanupCustomer('+919876501111');
    }
  });

  it('rejects invalid ID tokens with 401', async () => {
    mockVerify.mockRejectedValue(ApiError.unauthorized('Invalid login token. Please try again.', 'INVALID_FIREBASE_TOKEN'));
    const res = await request(app).post('/api/v1/auth/firebase').send({ idToken: 'bogus' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_FIREBASE_TOKEN');
  });

  it('rejects tokens without a verified phone number', async () => {
    mockVerify.mockResolvedValue({ uid: 'firebase-uid-2' });
    const res = await request(app).post('/api/v1/auth/firebase').send({ idToken: 'no-phone-token' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PHONE');
  });

  it('rejects non-Indian numbers', async () => {
    mockVerify.mockResolvedValue({ uid: 'firebase-uid-3', phoneNumber: '+15551234567' });
    const res = await request(app).post('/api/v1/auth/firebase').send({ idToken: 'us-token' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PHONE');
  });

  it('requires the idToken field', async () => {
    const res = await request(app).post('/api/v1/auth/firebase').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });
});
