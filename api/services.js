import { api } from './client';

export const fetchHome = () => api.get('/home', { auth: false });

export const fetchCategories = () => api.get('/categories', { auth: false });

export const fetchServices = (params = {}) => {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.append(key, String(value));
    }
  }
  const suffix = qs.size > 0 ? `?${qs.toString()}` : '';
  return api.get(`/services${suffix}`, { auth: false });
};

export const fetchServiceById = (id) =>
  api.get(`/services/${id}`, { auth: false });

export const fetchServiceReviews = (id) =>
  api.get(`/services/${id}/reviews`, { auth: false });
