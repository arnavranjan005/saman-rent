import { PrismaClient } from '@prisma/client';
import { env, isDbConfigured } from '../config/env';

let prisma: PrismaClient | null = null;

/** Lazily create the client only when a real DATABASE_URL is configured. */
export function getPrisma(): PrismaClient | null {
  if (!isDbConfigured(env.DATABASE_URL)) return null;
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

export type DbStatus = 'connected' | 'not-configured' | 'unreachable';

export async function checkDb(): Promise<DbStatus> {
  const client = getPrisma();
  if (!client) return 'not-configured';
  try {
    await client.$queryRaw`SELECT 1`;
    return 'connected';
  } catch {
    return 'unreachable';
  }
}
