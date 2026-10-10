import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBookings,
  fetchServices,
  fetchVendors,
  setServiceStatus,
  setVendorStatus,
} from '../lib/api';

export const vendorKeys = {
  all: ['vendors'],
  list: (params) => ['vendors', params],
};

export const serviceKeys = {
  all: ['services'],
  list: (params) => ['services', params],
};

export const bookingKeys = {
  all: ['bookings'],
  list: (params) => ['bookings', params],
};

export function useVendors(params) {
  return useQuery({ queryKey: vendorKeys.list(params), queryFn: () => fetchVendors(params) });
}

export function useSetVendorStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => setVendorStatus(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: vendorKeys.all });
      client.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useServices(params) {
  return useQuery({ queryKey: serviceKeys.list(params), queryFn: () => fetchServices(params) });
}

export function useSetServiceStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => setServiceStatus(id, status),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}

export function useBookings(params) {
  return useQuery({ queryKey: bookingKeys.list(params), queryFn: () => fetchBookings(params) });
}
