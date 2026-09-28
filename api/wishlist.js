import { api } from './client';

export const fetchWishlist = () => api.get('/wishlist');

export const addToWishlist = (serviceId) =>
  api.post(`/wishlist/${serviceId}`);

export const removeFromWishlist = (serviceId) =>
  api.del(`/wishlist/${serviceId}`);
