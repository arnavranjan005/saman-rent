import React, { useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { fmt } from '../lib/format';
import { statusPillClass } from '../lib/bookingStatus';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useMe } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import { resolveImage } from '../lib/serviceImage';

function BookingRow({ b, onOpen }) {
  return (
    <TouchableOpacity
      className="flex-row bg-[#F8F7FF] rounded-xl p-3 mb-2.5 items-center"
      onPress={() => onOpen(b.id)}
      testID={`booking-${b.id}`}
    >
      <Image
        source={resolveImage(b.service.img)}
        className="w-[52px] h-[52px] rounded-[10px] mr-2.5"
      />
      <View className="flex-1">
        <Text className="font-bold text-sm">{b.service.name}</Text>
        <Text className="text-xs text-[#666] mt-0.5">
          {b.date} · {b.startTime} · {b.duration}h
        </Text>
        <Text className="text-xs text-[#666] mt-0.5">{fmt(b.total)}</Text>
      </View>
      <Text className={statusPillClass(b.status)}>{b.status}</Text>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data, isPending, isError, error, refetch } = useBookings(Boolean(me));
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };
  const openBooking = (id) => router.push({ pathname: '/booking-detail', params: { id } });

  if (!me) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-sm text-[#555] mb-3">Log in to see your bookings.</Text>
        <TouchableOpacity
          className="bg-primary rounded-[10px] px-7 py-3"
          onPress={() => router.push('/login')}
          testID="bookings-login-btn"
        >
          <Text className="text-white font-bold">Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isPending) return <LoadingState testID="bookings-loading" />;
  if (isError) {
    return (
      <ErrorState
        testID="bookings-error"
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  const list = data ?? [];
  if (list.length === 0) {
    return (
      <EmptyState
        testID="bookings-empty"
        message="No bookings yet. Find a service and send your first request."
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white p-3.5"
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#5B2DF0']}
          testID="bookings-refresh"
        />
      }
    >
      <Text className="font-extrabold text-lg mt-2 mb-3">My Bookings</Text>
      {list.map((b) => (
        <BookingRow key={b.id} b={b} onOpen={openBooking} />
      ))}
    </ScrollView>
  );
}
