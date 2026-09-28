import { Router } from 'express';
import { authRouter } from './auth';
import { bookingsRouter } from './bookings';
import { catalogRouter } from './catalog';
import { healthRouter } from './health';
import { uploadsRouter } from './uploads';
import { vendorAuthRouter } from './vendorAuth';
import { vendorRouter } from './vendor';
import { wishlistRouter } from './wishlist';

export const v1Router = Router();

// Phase 9: vendor business APIs. Dev-only E2E hook removed (vendor decisions are live).
v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/wishlist', wishlistRouter);
v1Router.use('/bookings', bookingsRouter);
v1Router.use('/uploads', uploadsRouter);
v1Router.use('/vendor/auth', vendorAuthRouter);
v1Router.use('/vendor', vendorRouter);
v1Router.use('/', catalogRouter);
