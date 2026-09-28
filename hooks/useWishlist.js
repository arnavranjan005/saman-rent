import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from '../api/wishlist';

export const wishlistKeys = {
  list: ['wishlist'],
};

export function useWishlist(enabled = true) {
  return useQuery({ queryKey: wishlistKeys.list, queryFn: fetchWishlist, enabled });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, saved }) =>
      saved ? removeFromWishlist(serviceId) : addToWishlist(serviceId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list }),
  });
}
