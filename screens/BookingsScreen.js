import React, { useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import { fmt } from '../lib/format';
import { statusPillClass } from '../lib/bookingStatus';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useMe } from '../hooks/useAuth';
import { useBooking, useBookings, useCancelBooking } from '../hooks/useBookings';

const badge = (st) =>
  st === 'CONFIRMED' || st === 'COMPLETED'
    ? COLORS.green
    : st === 'PENDING'
      ? COLORS.orange
      : COLORS.red;

function BookingRow({ b, onOpen }) {
  return (
    <TouchableOpacity
      className="flex-row bg-[#F8F7FF] rounded-xl p-3 mb-2.5 items-center"
      onPress={() => onOpen(b.id)}
      testID={`booking-${b.id}`}
    >
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

function BookingDetail({ id, onClose }) {
  const router = useRouter();
  const { data: b, isPending, isError, error, refetch } = useBooking(id);
  const cancel = useCancelBooking();

  if (isPending) return <LoadingState testID="booking-detail-loading" />;
  if (isError || !b) {
    return (
      <ErrorState
        testID="booking-detail-error"
        message={error?.message ?? 'Booking not found.'}
        onRetry={() => refetch()}
      />
    );
  }

  const doCancel = () => {
    Alert.alert('Cancel booking?', 'This will cancel your pending request.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: () => cancel.mutate(b.id),
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white p-3.5" contentContainerStyle={{ paddingBottom: 20 }}>
      <TouchableOpacity onPress={onClose} testID="booking-detail-back">
        <Text className="text-primary text-[13px] mt-2">← All bookings</Text>
      </TouchableOpacity>
      <Text className="font-extrabold text-lg mt-2 mb-3">{b.service.name}</Text>
      <Text className={statusPillClass(b.status)}>{b.status}</Text>
      <View className="flex-row justify-between py-2.5 border-b border-[#F0F0F0]">
        <Text className="text-[#666] text-[13px]">Date</Text>
        <Text className="font-semibold text-[13px]">{b.date}</Text>
      </View>
      <View className="flex-row justify-between py-2.5 border-b border-[#F0F0F0]">
        <Text className="text-[#666] text-[13px]">Time</Text>
        <Text className="font-semibold text-[13px]">
          {b.startTime} · {b.duration}h
        </Text>
      </View>
      <View className="flex-row justify-between py-2.5 border-b border-[#F0F0F0]">
        <Text className="text-[#666] text-[13px]">Location</Text>
        <Text className="font-semibold text-[13px]">{b.location}</Text>
      </View>
      {b.eventType && (
        <View className="flex-row justify-between py-2.5 border-b border-[#F0F0F0]">
          <Text className="text-[#666] text-[13px]">Event</Text>
          <Text className="font-semibold text-[13px]">{b.eventType}</Text>
        </View>
      )}
      {b.notes && (
        <View className="flex-row justify-between py-2.5 border-b border-[#F0F0F0]">
          <Text className="text-[#666] text-[13px]">Notes</Text>
          <Text className="font-semibold text-[13px]">{b.notes}</Text>
        </View>
      )}
      <View className="flex-row justify-between py-2.5 border-b border-[#F0F0F0]">
        <Text className="text-[#666] text-[13px]">Total</Text>
        <Text className="text-leaf font-extrabold text-[15px]">{fmt(b.total)}</Text>
      </View>
      {cancel.isError && (
        <Text className="text-danger mt-3 font-semibold" testID="booking-cancel-error">
          {cancel.error?.message}
        </Text>
      )}
      {b.status === 'PENDING' && (
        <TouchableOpacity
          className="border border-danger rounded-xl p-3.5 items-center mt-4"
          onPress={doCancel}
          disabled={cancel.isPending}
          testID="booking-cancel-btn"
        >
          <Text className="text-danger font-bold">
            {cancel.isPending ? 'Cancelling…' : 'Cancel Booking'}
          </Text>
        </TouchableOpacity>
      )}
      {b.status === 'COMPLETED' && !b.review && (
        <TouchableOpacity
          className="bg-primary rounded-xl p-3.5 items-center mt-4"
          onPress={() => router.push({ pathname: '/review', params: { id: b.id } })}
          testID="booking-rate-btn"
        >
          <Text className="text-white font-bold">Rate Service</Text>
        </TouchableOpacity>
      )}
      {b.status === 'COMPLETED' && b.review && (
        <Text className="text-xs text-muted text-center mt-4" testID="booking-reviewed-label">
          You rated this {b.review.rating} out of 5
        </Text>
      )}
    </ScrollView>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const [selectedId, setSelectedId] = useState(null);
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

  if (selectedId) return <BookingDetail id={selectedId} onClose={() => setSelectedId(null)} />;
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
        <BookingRow key={b.id} b={b} onOpen={setSelectedId} />
      ))}
    </ScrollView>
  );
}
