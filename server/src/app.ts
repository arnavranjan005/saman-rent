import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { requestLogger } from './middleware/requestLogger';
import { v1Router } from './routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  // Permissive in dev: Expo Go on LAN uses dynamic origins.
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);

  // Unversioned liveness probe (no DB check).
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: { status: 'ok', service: 'samanrent-api' },
    });
  });

  app.use(env.API_PREFIX, v1Router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
