import { api } from './client';

export const createBooking = (payload) => api.post('/bookings', payload);

export const fetchBookings = () => api.get('/bookings');

export const fetchBookingById = (id) => api.get(`/bookings/${id}`);

export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
