import { checkDb, type DbStatus } from '../lib/prisma';

export interface HealthStatus {
  status: 'ok';
  version: 'v1';
  db: DbStatus;
  uptime: number;
  timestamp: string;
}

export async function getHealth(): Promise<HealthStatus> {
  return {
    status: 'ok',
    version: 'v1',
    db: await checkDb(),
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
