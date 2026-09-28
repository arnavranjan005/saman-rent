import { api } from './client';

export const sendOtp = (phone) =>
  api.post('/auth/send-otp', { phone }, { auth: false });

export const verifyOtp = (phone, otp) =>
  api.post('/auth/verify-otp', { phone, otp }, { auth: false });

export const fetchMe = () => api.get('/auth/me');

export const logout = () => api.post('/auth/logout');
