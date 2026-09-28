import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addVendorServiceImage,
  createVendorService,
  disableVendorService,
  fetchVendorBookings,
  fetchVendorMe,
  fetchVendorServices,
  fetchVendorStats,
  removeVendorServiceImage,
  setVendorBookingStatus,
  updateVendorService,
  vendorLogin,
  vendorRegister,
} from '../api/vendor';
import { clearVendorToken, setVendorToken } from '../lib/vendorTokenStore';

export const vendorKeys = {
  me: ['vendor', 'me'],
  stats: ['vendor', 'stats'],
  services: ['vendor', 'services'],
  bookings: (status) => ['vendor', 'bookings', status ?? 'all'],
};

function invalidateVendor(queryClient) {
  queryClient.invalidateQueries({ queryKey: ['vendor'] });
}

export function useVendorMe(enabled = false) {
  return useQuery({ queryKey: vendorKeys.me, queryFn: fetchVendorMe, enabled, retry: false });
}

export function useVendorRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vendorRegister,
    onSuccess: async (data) => {
      if (data?.token) await setVendorToken(data.token);
      queryClient.setQueryData(vendorKeys.me, data?.vendor ?? null);
      invalidateVendor(queryClient);
    },
  });
}

export function useVendorLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }) => vendorLogin(email, password),
    onSuccess: async (data) => {
      if (data?.token) await setVendorToken(data.token);
      queryClient.setQueryData(vendorKeys.me, data?.vendor ?? null);
      invalidateVendor(queryClient);
    },
  });
}

export function useVendorLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => true,
    onSettled: async () => {
      await clearVendorToken();
      queryClient.removeQueries({ queryKey: ['vendor'] });
    },
  });
}

export function useVendorStats(enabled = true) {
  return useQuery({ queryKey: vendorKeys.stats, queryFn: fetchVendorStats, enabled });
}

export function useVendorServices(enabled = true) {
  return useQuery({ queryKey: vendorKeys.services, queryFn: fetchVendorServices, enabled });
}

export function useVendorBookings(status, enabled = true) {
  return useQuery({
    queryKey: vendorKeys.bookings(status),
    queryFn: () => fetchVendorBookings(status),
    enabled,
  });
}

export function useCreateVendorService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorService,
    onSuccess: () => invalidateVendor(queryClient),
  });
}

export function useUpdateVendorService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateVendorService(id, payload),
    onSuccess: () => invalidateVendor(queryClient),
  });
}

export function useDisableVendorService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => disableVendorService(id),
    onSuccess: () => invalidateVendor(queryClient),
  });
}

export function useAddVendorServiceImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => addVendorServiceImage(id, payload),
    onSuccess: () => invalidateVendor(queryClient),
  });
}

export function useRemoveVendorServiceImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }) => removeVendorServiceImage(id, imageId),
    onSuccess: () => invalidateVendor(queryClient),
  });
}

export function useSetVendorBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => setVendorBookingStatus(id, status),
    onSuccess: () => invalidateVendor(queryClient),
  });
}
