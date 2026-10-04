import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import '../global.css';
import { fetchMe } from '../api/auth';
import { authKeys } from '../hooks/useAuth';
import { addSessionExpiredHandler } from '../lib/session';
import { clearToken, getToken } from '../lib/tokenStore';
import { clearVendorToken } from '../lib/vendorTokenStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// Phase 3: on app startup, restore the session — if a token was stored,
// validate it with GET /auth/me; drop it when the server rejects it.
function AuthBootstrap({ children }) {
  const client = useQueryClient();
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        const me = await fetchMe();
        client.setQueryData(authKeys.me, me);
      } catch {
        await clearToken();
      }
    })();
  }, [client]);
  return children;
}

// Phase 11c: any dead-token response anywhere wipes stored sessions,
// dropping the app back to logged-out state without per-screen handling.
function SessionExpiryWatcher() {
  const client = useQueryClient();
  useEffect(
    () =>
      addSessionExpiredHandler(() => {
        (async () => {
          await clearToken();
          await clearVendorToken();
          client.removeQueries({ queryKey: ['auth'] });
          client.removeQueries({ queryKey: ['vendor'] });
        })();
      }),
    [client],
  );
  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionExpiryWatcher />
      <AuthBootstrap>
        <SafeAreaProvider>
          <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
            {/* App UI is always light (bg-white), so force dark status-bar
                icons — "auto" turns them white in phone dark mode,
                making them invisible on our white background. */}
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthBootstrap>
    </QueryClientProvider>
  );
}
