import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import VendorCard from '../components/VendorCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useMe } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';

export default function WishlistScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data, isPending, isError, error, refetch } = useWishlist(Boolean(me));
  const openDetails = (v) => router.push({ pathname: '/details', params: { id: v.id } });

  if (!me) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-sm text-[#555] mb-3">Log in to see your wishlist.</Text>
        <TouchableOpacity
          className="bg-primary rounded-[10px] px-7 py-3"
          onPress={() => router.push('/login')}
          testID="wishlist-login-btn"
        >
          <Text className="text-white font-bold">Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isPending) return <LoadingState testID="wishlist-loading" />;
  if (isError) {
    return (
      <ErrorState
        testID="wishlist-error"
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  const list = data ?? [];
  if (list.length === 0) {
    return (
      <EmptyState
        testID="wishlist-empty"
        message="Save your favourite vendors here and find them quickly later."
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-3.5" contentContainerStyle={{ paddingBottom: 20 }}>
      <Text className="font-extrabold text-lg mt-2 mb-3">My Wishlist</Text>
      {list.map((v) => (
        <VendorCard key={v.id} v={v} onPress={() => openDetails(v)} />
      ))}
    </ScrollView>
  );
}
