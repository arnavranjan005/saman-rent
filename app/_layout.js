import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { fetchMe } from '../api/auth';
import { authKeys } from '../hooks/useAuth';
import { clearToken, getToken } from '../lib/tokenStore';

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

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <SafeAreaProvider>
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthBootstrap>
    </QueryClientProvider>
  );
}
