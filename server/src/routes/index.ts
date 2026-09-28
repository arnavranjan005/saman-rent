import { Router } from 'express';
import { healthRouter } from './health';

export const v1Router = Router();

// Phase 1: health only. Auth/services/bookings routers land in later phases.
v1Router.use('/health', healthRouter);
