import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import { fmt } from '../lib/format';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useVendorMe } from '../hooks/useVendor';
import { useVendorStats } from '../hooks/useVendor';

const ACTIONS = [
  { label: 'My Bookings', icon: 'calendar-outline', route: '/(vendor)/bookings', testID: 'vendor-action-bookings' },
  { label: 'Add Service', icon: 'add-circle-outline', route: '/(vendor)/service-new', testID: 'vendor-action-add' },
  { label: 'My Services', icon: 'briefcase-outline', route: '/(vendor)/services', testID: 'vendor-action-services' },
  { label: 'Profile', icon: 'person-outline', route: '/(vendor)/profile', testID: 'vendor-action-profile' },
];

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

export default function VendorPanelScreen() {
  const router = useRouter();
  const { data: me } = useVendorMe();
  const stats = useVendorStats(Boolean(me));

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await stats.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (!me) return <LoadingState testID="vendor-panel-loading" />;
  if (me.status !== 'APPROVED') {
    return (
      <View className="flex-1 bg-white p-5 justify-center items-center">
        <Ionicons name="hourglass-outline" size={48} color={COLORS.primary} />
        <Text className="font-extrabold text-lg mt-4">Approval pending</Text>
        <Text className="text-sm text-[#555] text-center mt-2">
          {me.name} is under review. You can prepare services meanwhile — they go live after
          approval.
        </Text>
      </View>
    );
  }

  if (stats.isPending) return <LoadingState testID="vendor-stats-loading" />;
  if (stats.isError) {
    return (
      <ErrorState
        testID="vendor-stats-error"
        message={stats.error?.message}
        onRetry={() => stats.refetch()}
      />
    );
  }

  const s = stats.data;
  const initial = (me.name?.[0] ?? 'V').toUpperCase();

  return (
    <ScrollView
      className="flex-1 bg-white p-3.5"
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#5B2DF0']}
          testID="vendor-panel-refresh"
        />
      }
    >
      <View className="flex-row items-center mt-2">
        <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
          <Text className="text-white font-extrabold text-lg">{initial}</Text>
        </View>
        <View className="flex-1 ml-2.5">
          <Text className="text-xs text-[#666]">Welcome Back!</Text>
          <Text className="font-extrabold text-base">{me.name}</Text>
        </View>
      </View>

      <View className="flex-row mt-4">
        <View className="flex-1 bg-[#F6F5FF] rounded-2xl p-4 mr-2">
          <Text className="text-xs text-[#666]">Total Earnings</Text>
          <Text className="text-leaf font-extrabold text-xl mt-1" testID="vendor-earnings">
            {fmt(s.totalEarnings)}
          </Text>
        </View>
        <View className="flex-1 bg-[#F6F5FF] rounded-2xl p-4 ml-2">
          <Text className="text-xs text-[#666]">Total Bookings</Text>
          <Text className="font-extrabold text-xl mt-1" testID="vendor-booking-count">
            {s.totalBookings}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mt-5">
        {ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.label}
            className="items-center w-[23%]"
            onPress={() => router.push(a.route)}
            testID={a.testID}
          >
            <View className="w-14 h-14 rounded-2xl bg-[#F6F5FF] items-center justify-center">
              <Ionicons name={a.icon} size={26} color={COLORS.primary} />
            </View>
            <Text className="text-[11px] font-semibold mt-1.5 text-center">{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row justify-between items-center mt-5 mb-2.5">
        <Text className="font-bold text-[15px]">Recent Bookings</Text>
        <TouchableOpacity
          onPress={() => router.push('/(vendor)/bookings')}
          testID="vendor-recent-viewall"
        >
          <Text className="text-primary text-xs">View All</Text>
        </TouchableOpacity>
      </View>
      {s.recentBookings.length === 0 ? (
        <Text className="text-xs text-muted">No bookings yet.</Text>
      ) : (
        s.recentBookings.map((b) => (
          <TouchableOpacity
            key={b.id}
            className="flex-row bg-[#F8F7FF] rounded-xl p-3 mb-2.5 items-center"
            onPress={() => router.push('/(vendor)/bookings')}
            testID={`vendor-recent-${b.id}`}
          >
            <View className="flex-1">
              <Text className="text-xs text-[#666]">
                {b.date} · {b.startTime}
              </Text>
              <Text className="font-bold text-sm mt-0.5">
                {b.customer?.name ?? b.customer?.phone ?? 'Customer'}
              </Text>
              <Text className="text-xs text-[#666]">{b.service?.name}</Text>
            </View>
            <Text
              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full overflow-hidden ${badgeBg(b.status)} ${badgeTx(b.status)}`}
            >
              {b.status}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}
