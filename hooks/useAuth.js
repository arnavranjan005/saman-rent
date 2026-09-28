import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, logout as logoutRequest, sendOtp, verifyOtp } from '../api/auth';
import { clearToken, setToken } from '../lib/tokenStore';

export const authKeys = {
  me: ['auth', 'me'],
};

export function useMe(enabled = false) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    enabled,
    retry: false,
  });
}

export function useSendOtp() {
  return useMutation({ mutationFn: (phone) => sendOtp(phone) });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, otp }) => verifyOtp(phone, otp),
    onSuccess: async (data) => {
      if (data?.token) await setToken(data.token);
      queryClient.setQueryData(authKeys.me, data?.user ?? null);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutRequest,
    onSettled: async () => {
      await clearToken();
      queryClient.clear();
    },
  });
}
