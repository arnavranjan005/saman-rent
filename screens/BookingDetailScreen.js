import React, { useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fmt } from '../lib/format';
import { statusPillClass } from '../lib/bookingStatus';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ScreenHeader from '../components/ScreenHeader';
import { useBooking, useCancelBooking } from '../hooks/useBookings';
import { resolveImage } from '../lib/serviceImage';

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: b, isPending, isError, error, refetch } = useBooking(id);
  const cancel = useCancelBooking();
  const [refreshing, setRefreshing] = useState(false);

  const goBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace('/(tabs)/bookings');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isPending) return <LoadingState testID="booking-detail-loading" />;
  if (isError || !b) {
    return (
      <View className="flex-1 bg-white p-5">
        <ScreenHeader title="Booking Details" onBack={goBack} backTestID="booking-detail-back" />
        <ErrorState
          testID="booking-detail-error"
          message={error?.message ?? 'Booking not found.'}
          onRetry={() => refetch()}
        />
      </View>
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
    <ScrollView
      className="flex-1 bg-white p-5"
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#5B2DF0']}
          testID="booking-detail-refresh"
        />
      }
    >
      <ScreenHeader title="Booking Details" onBack={goBack} backTestID="booking-detail-back" />
      <Image
        source={resolveImage(b.service.img)}
        className="w-full h-[180px] rounded-2xl mt-2"
        resizeMode="cover"
        testID="booking-detail-image"
      />
      <Text className="font-extrabold text-lg mt-3 mb-3">{b.service.name}</Text>
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
