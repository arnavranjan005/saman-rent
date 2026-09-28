import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../data/mock';
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
      <View style={s.auth}>
        <Text style={s.authT}>Log in to see your wishlist.</Text>
        <TouchableOpacity
          style={s.authBtn}
          onPress={() => router.push('/login')}
          testID="wishlist-login-btn"
        >
          <Text style={s.authBtnT}>Log In</Text>
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
    <ScrollView style={s.wrap} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={s.title}>My Wishlist</Text>
      {list.map((v) => (
        <VendorCard key={v.id} v={v} onPress={() => openDetails(v)} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 14 },
  title: { fontWeight: '800', fontSize: 18, marginTop: 8, marginBottom: 12 },
  auth: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  authT: { fontSize: 14, color: '#555', marginBottom: 12 },
  authBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  authBtnT: { color: '#fff', fontWeight: '700' },
});
