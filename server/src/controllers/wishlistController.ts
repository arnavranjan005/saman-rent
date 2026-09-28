import type { Request, Response } from 'express';
import { addWishlist, getWishlist, removeWishlist } from '../services/wishlistService';
import { ApiError } from '../utils/ApiError';

/** GET /api/v1/wishlist */
export async function listWishlistController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await getWishlist(req.user.id) });
}

/** POST /api/v1/wishlist/:serviceId */
export async function addWishlistController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await addWishlist(req.user.id, req.params.serviceId) });
}

/** DELETE /api/v1/wishlist/:serviceId */
export async function removeWishlistController(req: Request, res: Response): Promise<void> {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ success: true, data: await removeWishlist(req.user.id, req.params.serviceId) });
}
