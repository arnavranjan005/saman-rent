import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../lib/theme';
import { fmt } from '../lib/format';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useSetVendorBookingStatus, useVendorBookings, useVendorMe } from '../hooks/useVendor';

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'REJECTED'];

const badgeBg = (st) =>
  st === 'CONFIRMED' || st === 'COMPLETED'
    ? 'bg-[#DCFCE7]'
    : st === 'PENDING'
      ? 'bg-[#FEF3C7]'
      : 'bg-[#FEE2E2]';

const badgeTx = (st) =>
  st === 'CONFIRMED' || st === 'COMPLETED'
    ? 'text-leaf'
    : st === 'PENDING'
      ? 'text-amber'
      : 'text-danger';

function BookingCard({ b }) {
  const decide = useSetVendorBookingStatus();

  const act = (status) => decide.mutate({ id: b.id, status });

  return (
    <View className="bg-[#F8F7FF] rounded-xl p-3.5 mb-3" testID={`vendor-booking-${b.id}`}>
      <View className="flex-row justify-between items-center">
        <Text className="font-bold text-sm">{b.service?.name}</Text>
        <Text
          className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full overflow-hidden ${badgeBg(b.status)} ${badgeTx(b.status)}`}
        >
          {b.status}
        </Text>
      </View>
      <Text className="text-xs text-[#666] mt-1">
        {b.date} · {b.startTime} · {b.duration}h · {fmt(b.total)}
      </Text>
      <Text className="text-xs text-[#666] mt-0.5">
        {b.customer?.name ?? 'Customer'} · {b.customer?.phone ?? ''}
      </Text>
      <Text className="text-xs text-[#666] mt-0.5">{b.location}</Text>
      {b.notes ? <Text className="text-xs text-[#555] mt-1 italic">{b.notes}</Text> : null}
      {decide.isError && (
        <Text className="text-danger text-xs mt-2 font-semibold">
          {decide.error?.message}
        </Text>
      )}
      {b.status === 'PENDING' && (
        <View className="flex-row mt-3">
          <TouchableOpacity
            className={`flex-1 bg-primary rounded-[10px] py-2.5 items-center mr-2 ${decide.isPending ? 'opacity-60' : ''}`}
            onPress={() => act('CONFIRMED')}
            disabled={decide.isPending}
            testID={`vendor-accept-${b.id}`}
          >
            <Text className="text-white font-bold text-sm">Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 border border-danger rounded-[10px] py-2.5 items-center"
            onPress={() => act('REJECTED')}
            disabled={decide.isPending}
            testID={`vendor-reject-${b.id}`}
          >
            <Text className="text-danger font-bold text-sm">Reject</Text>
          </TouchableOpacity>
        </View>
      )}
      {b.status === 'CONFIRMED' && (
        <TouchableOpacity
          className={`bg-leaf rounded-[10px] py-2.5 items-center mt-3 ${decide.isPending ? 'opacity-60' : ''}`}
          onPress={() => act('COMPLETED')}
          disabled={decide.isPending}
          testID={`vendor-complete-${b.id}`}
        >
          <Text className="text-white font-bold text-sm">Mark Completed</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function VendorBookingsScreen() {
  const { data: me } = useVendorMe();
  const [filter, setFilter] = useState('ALL');
  const query = useVendorBookings(filter === 'ALL' ? undefined : filter, Boolean(me));
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (!me) return <LoadingState testID="vendor-bookings-loading" />;
  if (query.isPending) return <LoadingState testID="vendor-bookings-list-loading" />;
  if (query.isError) {
    return (
      <ErrorState
        testID="vendor-bookings-error"
        message={query.error?.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  const list = query.data ?? [];
  return (
    <ScrollView
      className="flex-1 bg-white p-3.5"
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#5B2DF0']}
          testID="vendor-bookings-refresh"
        />
      }
    >
      <Text className="font-extrabold text-lg mt-2 mb-3">Bookings</Text>
      <View className="flex-row flex-wrap mb-3">
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            className={`border rounded-full px-3 py-1.5 mr-2 mb-2 ${filter === f ? 'bg-primary border-primary' : 'border-[#DDD]'}`}
            onPress={() => setFilter(f)}
            testID={`vendor-filter-${f}`}
          >
            <Text className={`text-xs ${filter === f ? 'text-white font-bold' : 'text-[#333]'}`}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {list.length === 0 ? (
        <EmptyState testID="vendor-bookings-empty" message="No bookings here yet." />
      ) : (
        list.map((b) => <BookingCard key={b.id} b={b} />)
      )}
    </ScrollView>
  );
}
