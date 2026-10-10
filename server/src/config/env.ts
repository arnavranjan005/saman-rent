import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Phase 10 admin bootstrap (seed-admin.ts). Never commit real values.
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  // Firebase phone auth (customer login). Service-account fields only —
  // the private key stays server-side. Required for POST /auth/firebase.
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);

/** True only when DATABASE_URL looks like a real Postgres URL (not a placeholder). */
export function isDbConfigured(url?: string): boolean {
  return (
    !!url &&
    url.startsWith('postgresql://') &&
    !url.includes('placeholder') &&
    !url.includes('user:password')
  );
}
