import type { Request, Response } from 'express';
import { getHealth } from '../services/healthService';

/** GET /api/v1/health — liveness + database connectivity. */
export async function healthController(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await getHealth() });
}
