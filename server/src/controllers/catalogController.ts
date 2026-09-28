import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  getCategories,
  getHome,
  getServiceById,
  getServices,
  type ServiceQuery,
} from '../services/catalogService';
import { ApiError } from '../utils/ApiError';

/** GET /api/v1/home */
export async function homeController(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await getHome() });
}

/** GET /api/v1/categories */
export async function categoriesController(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await getCategories() });
}

const servicesQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating']).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/** GET /api/v1/services */
export async function servicesController(req: Request, res: Response): Promise<void> {
  const parsed = servicesQuerySchema.safeParse(req.query);
  if (!parsed.success) throw ApiError.badRequest('Invalid query parameters.', 'INVALID_QUERY');
  res.json({ success: true, data: await getServices(parsed.data as ServiceQuery) });
}

/** GET /api/v1/services/:id */
export async function serviceDetailController(req: Request, res: Response): Promise<void> {
  res.json({ success: true, data: await getServiceById(req.params.id) });
}
