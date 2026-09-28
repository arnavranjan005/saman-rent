import { Router } from 'express';
import { authRouter } from './auth';
import { catalogRouter } from './catalog';
import { healthRouter } from './health';

export const v1Router = Router();

// Phase 5: health + auth + marketplace. Bookings/wishlist land next.
v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/', catalogRouter);
