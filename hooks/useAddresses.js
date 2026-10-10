import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAddress, deleteAddress, fetchAddresses, updateAddress } from '../api/addresses';

export const addressKeys = {
  list: ['addresses'],
};

export function useAddresses(enabled = true) {
  return useQuery({ queryKey: addressKeys.list, queryFn: fetchAddresses, enabled });
}

function useInvalidateAddresses() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: addressKeys.list });
}

export function useCreateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: (payload) => createAddress(payload),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: ({ id, payload }) => updateAddress(id, payload),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: (id) => deleteAddress(id),
    onSuccess: () => invalidate(),
  });
}
