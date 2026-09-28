import { api } from './client';
import { getVendorToken } from '../lib/vendorTokenStore';

const V = { getToken: getVendorToken };

export const vendorRegister = (payload) =>
  api.post('/vendor/auth/register', payload, { auth: false });

export const vendorLogin = (email, password) =>
  api.post('/vendor/auth/login', { email, password }, { auth: false });

export const fetchVendorMe = () => api.get('/vendor/auth/me', V);

export const fetchVendorStats = () => api.get('/vendor/stats', V);

export const fetchVendorServices = () => api.get('/vendor/services', V);

export const createVendorService = (payload) => api.post('/vendor/services', payload, V);

export const updateVendorService = (id, payload) =>
  api.patch(`/vendor/services/${id}`, payload, V);

export const disableVendorService = (id) => api.del(`/vendor/services/${id}`, V);

export const addVendorServiceImage = (id, payload) =>
  api.post(`/vendor/services/${id}/images`, payload, V);

export const removeVendorServiceImage = (id, imageId) =>
  api.del(`/vendor/services/${id}/images/${imageId}`, V);

export const fetchVendorBookings = (status) =>
  api.get(status ? `/vendor/bookings?status=${status}` : '/vendor/bookings', V);

export const setVendorBookingStatus = (id, status) =>
  api.patch(`/vendor/bookings/${id}/status`, { status }, V);
