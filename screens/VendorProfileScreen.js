import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../data/mock';
import LoadingState from '../components/LoadingState';
import { useVendorLogout, useVendorMe } from '../hooks/useVendor';

export default function VendorProfileScreen() {
  const router = useRouter();
  const { data: me } = useVendorMe();
  const logout = useVendorLogout();

  if (!me) return <LoadingState testID="vendor-profile-loading" />;

  const doLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => router.replace('/vendor-login'),
    });
  };

  const initial = (me.name?.[0] ?? 'V').toUpperCase();

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="font-extrabold text-lg mt-2 mb-4">Vendor Profile</Text>
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
          <Text className="text-white font-extrabold text-2xl">{initial}</Text>
        </View>
        <View className="flex-1 ml-3">
          <Text className="font-extrabold text-base">{me.name}</Text>
          <Text className="text-xs text-[#666]">{me.email}</Text>
          {me.phone ? <Text className="text-xs text-[#666]">{me.phone}</Text> : null}
        </View>
      </View>

      <View className="flex-row justify-between py-3 border-b border-[#F0F0F0] mt-4">
        <Text className="text-sm text-[#555]">Account status</Text>
        <Text className="text-sm font-bold" testID="vendor-profile-status">
          {me.status}
        </Text>
      </View>
      <View className="flex-row justify-between py-3 border-b border-[#F0F0F0]">
        <Text className="text-sm text-[#555]">Services listed</Text>
        <Text className="text-sm font-bold">{me.serviceCount ?? 0}</Text>
      </View>

      <TouchableOpacity
        className="border border-[#DDD] rounded-xl p-[15px] items-center mt-6 flex-row justify-center"
        onPress={() => router.replace('/(tabs)')}
        testID="vendor-switch-customer-btn"
      >
        <Ionicons name="swap-horizontal-outline" size={18} color={COLORS.primary} />
        <Text className="text-primary font-bold ml-2">Switch to Customer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="rounded-xl p-[15px] items-center mt-3 flex-row justify-center border border-danger"
        onPress={doLogout}
        testID="vendor-logout-btn"
      >
        <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
        <Text className="text-danger font-bold ml-2">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
