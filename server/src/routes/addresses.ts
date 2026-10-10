import { Router } from 'express';
import {
  createAddressController,
  deleteAddressController,
  listAddressesController,
  updateAddressController,
} from '../controllers/addressController';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';

export const addressesRouter = Router();

addressesRouter.use(requireAuth);
addressesRouter.get('/', asyncHandler(listAddressesController));
addressesRouter.post('/', asyncHandler(createAddressController));
addressesRouter.patch('/:id', asyncHandler(updateAddressController));
addressesRouter.delete('/:id', asyncHandler(deleteAddressController));
