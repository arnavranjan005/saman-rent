import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS } from '../data/mock';
import { useMe } from '../hooks/useAuth';
import { useToggleWishlist, wishlistKeys } from '../hooks/useWishlist';

/** Tappable wishlist heart. Redirects to login when logged out. */
export default function SaveHeart({ serviceId, size = 18, dark = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const toggle = useToggleWishlist();

  const cached = queryClient.getQueryData(wishlistKeys.list);
  const saved =
    Array.isArray(cached) && cached.some((s) => s?.id === serviceId);

  const onPress = () => {
    if (!me) {
      router.push('/login');
      return;
    }
    toggle.mutate({ serviceId, saved });
  };

  return (
    <TouchableOpacity onPress={onPress} testID={`heart-${serviceId}`}>
      <Ionicons
        name={saved ? 'heart' : 'heart-outline'}
        size={size}
        color={saved ? COLORS.red : dark ? '#fff' : '#999'}
      />
    </TouchableOpacity>
  );
}
