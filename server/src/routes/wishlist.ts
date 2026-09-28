import { Router } from 'express';
import {
  addWishlistController,
  listWishlistController,
  removeWishlistController,
} from '../controllers/wishlistController';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

export const wishlistRouter = Router();

wishlistRouter.use(requireAuth);
wishlistRouter.get('/', asyncHandler(listWishlistController));
wishlistRouter.post('/:serviceId', asyncHandler(addWishlistController));
wishlistRouter.delete('/:serviceId', asyncHandler(removeWishlistController));
