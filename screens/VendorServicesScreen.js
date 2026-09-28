import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, fmt } from '../data/mock';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import {
  useDisableVendorService,
  useVendorMe,
  useVendorServices,
} from '../hooks/useVendor';
import { resolveImage } from '../lib/serviceImage';
import { Image } from 'react-native';

const statusColor = (st) =>
  st === 'ACTIVE' ? COLORS.green : st === 'PENDING_APPROVAL' ? COLORS.orange : COLORS.grey;

export default function VendorServicesScreen() {
  const router = useRouter();
  const { data: me } = useVendorMe();
  const query = useVendorServices(Boolean(me));
  const disable = useDisableVendorService();

  if (!me) return <LoadingState testID="vendor-services-loading" />;
  if (query.isPending) return <LoadingState testID="vendor-services-list-loading" />;
  if (query.isError) {
    return (
      <ErrorState
        testID="vendor-services-error"
        message={query.error?.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  const list = query.data ?? [];
  return (
    <ScrollView className="flex-1 bg-white p-3.5" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row justify-between items-center mt-2 mb-3">
        <Text className="font-extrabold text-lg">My Services</Text>
        <TouchableOpacity
          className="bg-primary rounded-[10px] px-4 py-2.5 flex-row items-center"
          onPress={() => router.push('/(vendor)/service-new')}
          testID="vendor-add-service-btn"
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text className="text-white font-bold text-sm ml-1">Add</Text>
        </TouchableOpacity>
      </View>
      {list.length === 0 ? (
        <EmptyState testID="vendor-services-empty" message="No services yet. Add your first one." />
      ) : (
        list.map((s) => (
          <View
            key={s.id}
            className="flex-row bg-[#F8F7FF] rounded-xl p-3 mb-2.5 items-center"
            testID={`vendor-service-${s.id}`}
          >
            <Image
              source={resolveImage(s.images?.[0]?.url ?? s.img)}
              className="w-[52px] h-[52px] rounded-[10px]"
            />
            <View className="flex-1 ml-2.5">
              <Text className="font-bold text-sm">{s.name}</Text>
              <Text className="text-xs text-[#666]">
                {fmt(s.price)} · {s.bookingCount ?? 0} bookings
              </Text>
              <Text className="text-[11px] font-bold" style={{ color: statusColor(s.status) }}>
                {s.status?.replace('_', ' ')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(vendor)/service/[id]', params: { id: s.id } })}
              testID={`vendor-edit-${s.id}`}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              className="ml-3"
              onPress={() => disable.mutate(s.id)}
              testID={`vendor-disable-${s.id}`}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}
