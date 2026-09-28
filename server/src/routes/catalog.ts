import { Router } from 'express';
import {
  categoriesController,
  homeController,
  serviceDetailController,
  servicesController,
} from '../controllers/catalogController';
import { asyncHandler } from '../utils/asyncHandler';

export const catalogRouter = Router();

catalogRouter.get('/home', asyncHandler(homeController));
catalogRouter.get('/categories', asyncHandler(categoriesController));
catalogRouter.get('/services', asyncHandler(servicesController));
catalogRouter.get('/services/:id', asyncHandler(serviceDetailController));
