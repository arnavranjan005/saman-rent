import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, fmt } from '../data/mock';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useService } from '../hooks/useServices';
import SaveHeart from '../components/SaveHeart';
import { resolveImage } from '../lib/serviceImage';

const STATS = [
  ['10+ Years', 'Experience'],
  ['50+ Events', 'Completed'],
  ['2', 'Team Size'],
  ['All India', 'Available'],
];

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: v, isPending, isError, error, refetch } = useService(id);
  const goBack = () => router.back();

  if (isPending) return <LoadingState testID="details-loading" />;
  if (isError || !v) {
    return (
      <ErrorState
        testID="details-error"
        message={error?.message ?? 'Service not found.'}
        onRetry={() => refetch()}
      />
    );
  }

  const openBooking = () => router.push({ pathname: '/booking', params: { id: v.id } });
  const shareService = () =>
    Share.share({
      title: v.name,
      message: `${v.name} — ${v.location}\n${fmt(v.price)} onwards on SamanRent`,
    });
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <ImageBackground
          source={resolveImage(v.hero || v.img)}
          className="h-[250px] w-full p-3.5 pt-[35px] justify-between"
          resizeMode="cover"
        >
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={goBack} testID="details-back">
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <SaveHeart serviceId={v.id} size={22} dark />
              <View className="w-3" />
              <TouchableOpacity onPress={shareService} testID="share-btn">
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
        <View className="p-4">
          <Text className="font-extrabold text-[19px]">{v.name}</Text>
          <Text className="text-xs mt-1">
            <Ionicons name="star" size={12} color="#F59E0B" /> {v.rating} ({v.reviews} Reviews)
            {'   '}
            <Ionicons name="checkmark-circle" size={12} color="#16A34A" /> Verified
          </Text>
          <Text className="text-xs text-[#666] mt-0.5">
            <Ionicons name="location-outline" size={12} color="#666" /> {v.location}
          </Text>
          <Text className="font-bold text-[15px] mt-3.5">About</Text>
          <Text className="text-[13px] text-[#555] mt-1">
            {v.description ??
              'We provide best services for weddings, parties, birthdays & all types of events.'}
          </Text>
          <View className="flex-row justify-between mt-3 bg-[#F6F5FF] rounded-xl p-3">
            {STATS.map(([a, b]) => (
              <View key={b} className="items-center">
                <Text className="font-bold text-xs">{a}</Text>
                <Text className="text-[10px] text-[#666]">{b}</Text>
              </View>
            ))}
          </View>
          <Text className="font-bold text-[15px] mt-3.5">Price</Text>
          <Text className="text-primary font-extrabold text-base mt-1">
            {fmt(v.price)} Onwards
          </Text>
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 p-3.5 bg-white">
        <TouchableOpacity
          className="bg-primary rounded-xl p-[15px] items-center"
          onPress={openBooking}
          testID="book-now-btn"
        >
          <Text className="text-white font-bold">Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
