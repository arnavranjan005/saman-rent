import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import VendorCard from '../components/VendorCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useCategories, useServices } from '../hooks/useServices';

const FILTERS = ['All', 'Popular', 'Price Low to High'];
const KNOWN_CATEGORIES = ['dj', 'tent', 'cars'];
export default function CategoryScreen({ showBack = true }) {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const catId = KNOWN_CATEGORIES.includes(id) ? id : 'dj';
  const { data: categories } = useCategories();
  const catName =
    (categories ?? []).find((c) => c.id === catId)?.name ?? 'DJ Booking';
  const goBack = () => router.back();
  const openDetails = (v) => router.push({ pathname: '/details', params: { id: v.id } });
  const [f, setF] = useState('All');
  const params =
    f === 'Popular'
      ? { category: catId, tag: 'Popular' }
      : f === 'Price Low to High'
        ? { category: catId, sort: 'price_asc' }
        : { category: catId };
  const { data, isPending, isError, error, refetch } = useServices(params);
  const list = data?.items ?? [];
  return (
    <View className="flex-1 bg-white p-3.5">
      <View className="flex-row justify-between items-center mt-2 mb-2.5">
        {showBack ? (
          <TouchableOpacity onPress={goBack} testID="cat-back">
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
        ) : (
          <View className="w-[22px]" />
        )}
        <Text className="font-bold text-base">{catName}</Text>
        <Ionicons name="search" size={22} color="#000" />
      </View>
      <View className="flex-row mb-3">
        {FILTERS.map((c) => (
          <TouchableOpacity
            key={c}
            className={`border rounded-full px-3 py-1.5 mr-2 ${f === c ? 'bg-primary border-primary' : 'border-[#DDD]'}`}
            onPress={() => setF(c)}
            testID={`filter-${c}`}
          >
            <Text className={`text-xs ${f === c ? 'text-white font-bold' : 'text-[#333]'}`}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {isPending ? (
          <LoadingState testID="category-loading" />
        ) : isError ? (
          <ErrorState
            testID="category-error"
            message={error?.message}
            onRetry={() => refetch()}
          />
        ) : list.length === 0 ? (
          <EmptyState testID="category-empty" message="No services in this category yet." />
        ) : (
          list.map((v) => <VendorCard key={v.id} v={v} onPress={() => openDetails(v)} />)
        )}
      </ScrollView>
    </View>
  );
}
