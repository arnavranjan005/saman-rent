import { Router } from 'express';
import { authRouter } from './auth';
import { bookingsRouter } from './bookings';
import { catalogRouter } from './catalog';
import { devRouter } from './dev';
import { healthRouter } from './health';
import { uploadsRouter } from './uploads';
import { wishlistRouter } from './wishlist';

export const v1Router = Router();

// Phase 4: + signed upload pipeline.
v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/wishlist', wishlistRouter);
v1Router.use('/bookings', bookingsRouter);
v1Router.use('/uploads', uploadsRouter);
v1Router.use('/dev', devRouter);
v1Router.use('/', catalogRouter);
