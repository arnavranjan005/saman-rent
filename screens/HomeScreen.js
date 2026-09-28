import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, IMG } from '../data/mock';
import VendorCard from '../components/VendorCard';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useCategories, useHome } from '../hooks/useServices';

export default function HomeScreen() {
  const router = useRouter();
  const home = useHome();
  const categories = useCategories();
  const openCategory = (id) => router.push({ pathname: '/category', params: { id } });
  const openDetails = (v) => router.push({ pathname: '/details', params: { id: v.id } });
  const openSearch = () => router.push('/(tabs)/search');

  if (home.isPending || categories.isPending) return <LoadingState testID="home-loading" />;
  if (home.isError || categories.isError) {
    return (
      <ErrorState
        testID="home-error"
        message={(home.error ?? categories.error)?.message}
        onRetry={() => {
          home.refetch();
          categories.refetch();
        }}
      />
    );
  }

  const cats = categories.data ?? [];
  const popular = home.data?.popular ?? [];
  return (
    <ScrollView className="flex-1 bg-white p-3.5" contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row justify-between items-center mt-2">
        <View>
          <Text className="text-primary font-extrabold text-xl">SamanRent</Text>
          <Text className="text-xs text-[#333]">
            <Ionicons name="location" size={12} color={COLORS.primary} /> Koderma, Jharkhand
          </Text>
        </View>
        <Ionicons name="notifications-outline" size={22} color="#333" />
      </View>
      <View className="flex-row bg-primary rounded-2xl p-4 mt-3 items-center">
        <View className="flex-1">
          <Text className="text-white font-extrabold text-[17px]">
            Make Your Event{'\n'}Extra Special
          </Text>
          <Text className="text-[#DDD6FE] text-[11px] mt-1">
            Book DJ, Tent, Luxury Cars and more...
          </Text>
          <TouchableOpacity
            className="bg-white rounded-lg px-3 py-1.5 mt-2.5 self-start"
            onPress={() => openCategory('dj')}
            testID="explore-btn"
          >
            <Text className="text-primary font-bold text-xs">Explore Now</Text>
          </TouchableOpacity>
        </View>
        <Image source={IMG.banner} className="w-[90px] h-[110px] rounded-xl" />
      </View>
      <View className="flex-row justify-between mt-4 mb-2.5">
        <Text className="font-bold text-[15px]">Top Categories</Text>
        <TouchableOpacity onPress={openSearch} testID="home-viewall-cats">
          <Text className="text-primary text-xs">View All</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between">
        {cats.map((c) => (
          <TouchableOpacity
            key={c.id}
            className="w-[31%] rounded-[14px] p-3 items-center"
            style={{ backgroundColor: c.color }}
            onPress={() => openCategory(c.id)}
            testID={`cat-${c.id}`}
          >
            {c.lib === 'mci' ? (
              <MaterialCommunityIcons name={c.icon} size={30} color="#B45309" />
            ) : (
              <Ionicons name={c.icon} size={30} color={COLORS.primary} />
            )}
            <Text className="text-[11px] font-semibold mt-1.5 text-center">{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-row justify-between mt-4 mb-2.5">
        <Text className="font-bold text-[15px]">Popular Near You</Text>
        <TouchableOpacity onPress={openSearch} testID="home-viewall-popular">
          <Text className="text-primary text-xs">View All</Text>
        </TouchableOpacity>
      </View>
      {popular.map((v) => (
        <VendorCard key={v.id} v={v} onPress={() => openDetails(v)} />
      ))}
    </ScrollView>
  );
}
