import { Router } from 'express';
import { authRouter } from './auth';
import { catalogRouter } from './catalog';
import { healthRouter } from './health';
import { wishlistRouter } from './wishlist';

export const v1Router = Router();

// Phase 6: + wishlist. Bookings land next.
v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/wishlist', wishlistRouter);
v1Router.use('/', catalogRouter);
