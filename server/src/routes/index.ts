import { Router } from 'express';
import { authRouter } from './auth';
import { healthRouter } from './health';

export const v1Router = Router();

// Phase 3: health + auth. Services/bookings routers land in later phases.
v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
