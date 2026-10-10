import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import { useMe } from '../hooks/useAuth';
import { useToggleWishlist, useWishlist } from '../hooks/useWishlist';

/** Tappable wishlist heart. Redirects to login when logged out. */
export default function SaveHeart({ serviceId, size = 18, dark = false }) {
  const router = useRouter();
  const { data: me } = useMe();
  // Subscribed (not getQueryData) so instant cache flips re-render immediately.
  const { data: wishlist } = useWishlist(Boolean(me));
  const { toggle, isSyncing } = useToggleWishlist();

  const saved =
    Array.isArray(wishlist) && wishlist.some((s) => s?.id === serviceId);

  const onPress = () => {
    if (!me) {
      router.push('/login');
      return;
    }
    // Never blocked: every tap flips instantly, network is debounced in the hook.
    toggle(serviceId);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      testID={`heart-${serviceId}`}
      style={{ opacity: isSyncing ? 0.6 : 1 }}
    >
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size}
        color={saved ? COLORS.red : dark ? '#fff' : '#999'}
      />
    </TouchableOpacity>
  );
}
