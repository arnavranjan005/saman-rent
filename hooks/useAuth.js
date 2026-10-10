import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, firebaseLogin, logout as logoutRequest, sendOtp, verifyOtp } from '../api/auth';
import { getFirebaseAuthModule } from '../lib/phoneAuth';
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

/**
 * Customer login via Firebase phone auth: exchange the Firebase ID token
 * (after the app verifies the SMS code) for our own JWT. Same session
 * handling as the legacy OTP flow.
 */
export function useFirebaseLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idToken) => firebaseLogin(idToken),
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
      try {
        // Drop Firebase persistence too, so a stale Firebase session can't
        // auto-login after our logout. Lazy module: null in Expo Go where
        // the native module is missing — safe to skip there.
        const fb = getFirebaseAuthModule();
        if (fb) await fb.signOut(fb.getAuth());
      } catch {
        /* Expo Go has no native Firebase module */
      }
      queryClient.clear();
    },
  });
}
