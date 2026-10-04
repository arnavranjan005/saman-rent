import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  cancelBooking,
  createBooking,
  createBookingReview,
  fetchBookingById,
  fetchBookings,
} from '../api/bookings';

export const bookingKeys = {
  list: ['bookings'],
  detail: (id) => ['bookings', id],
};

export function useBookings(enabled = true) {
  return useQuery({ queryKey: bookingKeys.list, queryFn: fetchBookings, enabled });
}

export function useBooking(id) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => fetchBookingById(id),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.list }),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.list }),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => createBookingReview(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}
