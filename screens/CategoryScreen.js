import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [q, setQ] = useState('');
  const baseParams =
    f === 'Popular'
      ? { category: catId, tag: 'Popular' }
      : f === 'Price Low to High'
        ? { category: catId, sort: 'price_asc' }
        : { category: catId };
  const params = q ? { ...baseParams, q } : baseParams;
  const { data, isPending, isError, error, refetch } = useServices(params);
  const list = data?.items ?? [];
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };
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
        <TouchableOpacity
          onPress={() => {
            if (searchOpen) {
              setSearchOpen(false);
              setSearchText('');
              setQ('');
            } else {
              setSearchOpen(true);
            }
          }}
          testID="search-toggle-btn"
        >
          <Ionicons name={searchOpen ? 'close' : 'search'} size={22} color="#000" />
        </TouchableOpacity>
      </View>
      {searchOpen && (
        <View className="flex-row items-center border border-[#DDD] rounded-[10px] px-3 mb-3">
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            className="flex-1 p-3 text-sm"
            placeholder="Search services…"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => setQ(searchText.trim())}
            returnKeyType="search"
            autoFocus
            testID="search-input"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setQ('');
              }}
              testID="search-clear-btn"
            >
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5B2DF0']}
            testID="category-refresh"
          />
        }
      >
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
