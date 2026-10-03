import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS } from '../../lib/theme';
import { fetchVendorMe } from '../../api/vendor';
import { vendorKeys } from '../../hooks/useVendor';
import { clearVendorToken, getVendorToken } from '../../lib/vendorTokenStore';

const TABS = [
  { name: 'index', title: 'Panel', icon: 'grid' },
  { name: 'bookings', title: 'Bookings', icon: 'calendar' },
  { name: 'services', title: 'Services', icon: 'briefcase' },
  { name: 'profile', title: 'Profile', icon: 'person' },
];

// Restores the vendor session inside the vendor section. No token → login.
function VendorBootstrap({ children }) {
  const router = useRouter();
  const client = useQueryClient();
  useEffect(() => {
    (async () => {
      const token = await getVendorToken();
      if (!token) {
        router.replace('/vendor-login');
        return;
      }
      try {
        const me = await fetchVendorMe();
        client.setQueryData(vendorKeys.me, me);
      } catch {
        await clearVendorToken();
        router.replace('/vendor-login');
      }
    })();
  }, [client, router]);
  return children;
}

export default function VendorTabsLayout() {
  return (
    <VendorBootstrap>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.grey,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: '#EEE',
            height: 66,
            paddingTop: 8,
            paddingBottom: 12,
          },
          tabBarLabelStyle: { fontSize: 10, marginTop: 2 },
        }}
      >
        {TABS.map((t) => (
          <Tabs.Screen
            key={t.name}
            name={t.name}
            options={{
              title: t.title,
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons name={focused ? t.icon : `${t.icon}-outline`} size={size} color={color} />
              ),
            }}
          />
        ))}
      </Tabs>
    </VendorBootstrap>
  );
}
