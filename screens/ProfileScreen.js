import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, IMG } from '../data/mock';
import { useLogout, useMe } from '../hooks/useAuth';
import { useBookings } from '../hooks/useBookings';
import { resolveImage } from '../lib/serviceImage';

const MENU = [
  { label: 'My Wishlist', icon: 'heart-outline' },
  { label: 'Address Book', icon: 'location-outline' },
  { label: 'Payment Methods', icon: 'card-outline' },
  { label: 'Help & Support', icon: 'help-circle-outline' },
  { label: 'About Us', icon: 'information-circle-outline' },
  { label: 'Log Out', icon: 'log-out-outline' },
];
const badge = (st) =>
  st === 'CONFIRMED' || st === 'COMPLETED'
    ? COLORS.green
    : st === 'PENDING'
      ? COLORS.orange
      : COLORS.red;

export default function ProfileScreen() {
  const router = useRouter();
  // Cache-only read: AuthBootstrap fills this on startup when a token exists.
  const { data: me } = useMe();
  const logout = useLogout();
  const { data: bookings } = useBookings(Boolean(me));

  const handleAuthAction = () => {
    if (me) {
      logout.mutate();
    } else {
      router.push('/login');
    }
  };

  const goTab = (tab) => router.push(`/(tabs)/${tab}`);

  return (
    <ScrollView className="flex-1 bg-white p-3.5" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row items-center mt-2">
        <Image source={IMG.avatar} className="w-14 h-14 rounded-full bg-[#EEE]" resizeMode="cover" />
        <View className="flex-1 ml-2.5">
          <Text className="font-extrabold text-base">
            {me?.name ?? (me ? 'SamanRent User' : 'Guest')}
          </Text>
          <Text className="text-xs text-[#666]">{me?.phone ?? 'Log in to book services'}</Text>
          <Text className="text-primary text-xs font-semibold">Edit Profile</Text>
        </View>
        <Text> </Text>
        <TouchableOpacity
          onPress={handleAuthAction}
          testID={me ? 'profile-logout-btn' : 'profile-login-btn'}
        >
          <Ionicons
            name={me ? 'log-out-outline' : 'log-in-outline'}
            size={22}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between mt-[18px] mb-2.5">
        <Text className="font-bold">My Bookings</Text>
        <TouchableOpacity onPress={() => goTab('bookings')} testID="profile-view-all-bookings">
          <Text className="text-primary text-xs">View All</Text>
        </TouchableOpacity>
      </View>
      {!me ? (
        <Text className="text-xs text-muted mb-2.5">Log in to see your bookings here.</Text>
      ) : (bookings ?? []).length === 0 ? (
        <Text className="text-xs text-muted mb-2.5">No bookings yet.</Text>
      ) : (
        (bookings ?? []).slice(0, 3).map((b) => (
          <View key={b.id} className="flex-row bg-[#F8F7FF] rounded-xl p-2.5 mb-2.5 items-center" testID={`booking-${b.id}`}>
            <Image source={resolveImage(b.service.img)} className="w-[52px] h-[52px] rounded-[10px]" />
            <View className="flex-1 ml-2.5">
              <Text className="font-bold text-[13px]">{b.service.name}</Text>
              <Text className="text-[11px] text-[#666]">
                {b.date} {'\n'}
                {b.startTime}
              </Text>
            </View>
            <Text className="text-[11px] font-bold" style={{ color: badge(b.status) }}>
              {b.status}
            </Text>
          </View>
        ))
      )}
      {MENU.map((m) => (
        <TouchableOpacity
          key={m.label}
          className="flex-row justify-between items-center py-3 border-b border-[#F0F0F0]"
          onPress={
            m.label === 'Log Out'
              ? handleAuthAction
              : m.label === 'My Wishlist'
                ? () => goTab('wishlist')
                : undefined
          }
          testID={
            m.label === 'Log Out'
              ? 'profile-menu-logout'
              : m.label === 'My Wishlist'
                ? 'profile-menu-wishlist'
                : undefined
          }
        >
          <View className="flex-row items-center">
            <Ionicons name={m.icon} size={18} color="#555" />
            <Text className="ml-2.5 text-sm">{m.label}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
