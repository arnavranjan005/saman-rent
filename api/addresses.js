import { api } from './client';

export const fetchAddresses = () => api.get('/addresses');

export const createAddress = (payload) => api.post('/addresses', payload);

export const updateAddress = (id, payload) => api.patch(`/addresses/${id}`, payload);

export const deleteAddress = (id) => api.del(`/addresses/${id}`);
