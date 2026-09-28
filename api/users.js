import { api } from './client';

export const fetchProfile = () => api.get('/auth/me');

export const updateProfile = (payload) => api.patch('/users/me', payload);
