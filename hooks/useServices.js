import { useQuery } from '@tanstack/react-query';
import {
  fetchCategories,
  fetchHome,
  fetchServiceById,
  fetchServiceReviews,
  fetchServices,
} from '../api/services';

export const serviceKeys = {
  home: ['home'],
  categories: ['categories'],
  list: (params) => ['services', params],
  detail: (id) => ['services', id],
};

export function useHome() {
  return useQuery({ queryKey: serviceKeys.home, queryFn: fetchHome });
}

export function useCategories() {
  return useQuery({ queryKey: serviceKeys.categories, queryFn: fetchCategories });
}

export function useServices(params = {}) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => fetchServices(params),
  });
}

export function useService(id) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => fetchServiceById(id),
    enabled: Boolean(id),
  });
}

export function useServiceReviews(id) {
  return useQuery({
    queryKey: [...serviceKeys.detail(id), 'reviews'],
    queryFn: () => fetchServiceReviews(id),
    enabled: Boolean(id),
  });
}
