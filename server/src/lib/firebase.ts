import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export interface FirebaseTokenInfo {
  uid: string;
  phoneNumber?: string;
}

/**
 * Lazily initializes firebase-admin from env (service-account fields only —
 * the private key never leaves the server) and verifies a Firebase ID token
 * minted by the app's phone-auth flow.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseTokenInfo> {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new ApiError(503, 'FIREBASE_NOT_CONFIGURED', 'Firebase login is not configured on this server.');
  }
  try {
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          clientEmail: FIREBASE_CLIENT_EMAIL,
          privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    const decoded = await getAuth().verifyIdToken(idToken);
    return { uid: decoded.uid, phoneNumber: decoded.phone_number };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('Invalid login token. Please try again.', 'INVALID_FIREBASE_TOKEN');
  }
}
