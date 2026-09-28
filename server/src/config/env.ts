import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
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
