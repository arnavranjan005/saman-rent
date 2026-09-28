import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CATEGORIES, COLORS, VENDORS } from '../data/mock';
import VendorCard from '../components/VendorCard';

const FILTERS = ['All', 'Popular', 'Price Low to High'];
export default function CategoryScreen({ showBack = true }) {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const catId = ['dj', 'tent', 'cars'].includes(id) ? id : 'dj';
  const catName = (CATEGORIES.find((c) => c.id === catId) || {}).name || 'DJ Booking';
  const goBack = () => router.back();
  const openDetails = (v) => router.push({ pathname: '/details', params: { id: v.id } });
  const [f, setF] = useState('All');
  let list = [...VENDORS.filter((v) => v.category === catId)];
  if (f === 'Popular') list = list.filter((v) => v.tag === 'Popular');
  if (f === 'Price Low to High') list.sort((a, b) => a.price - b.price);
  return (
    <View style={s.wrap}>
      <View style={s.header}>
        {showBack ? (
          <TouchableOpacity onPress={goBack} testID="cat-back"><Ionicons name="arrow-back" size={22} color="#000" /></TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
        <Text style={s.title}>{catName}</Text><Ionicons name="search" size={22} color="#000" />
      </View>
      <View style={s.chips}>
        {FILTERS.map((c) => (
          <TouchableOpacity key={c} style={[s.chip, f === c && s.chipOn]} onPress={() => setF(c)} testID={`filter-${c}`}>
            <Text style={[s.chipT, f === c && s.chipTOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {list.map((v) => <VendorCard key={v.id} v={v} onPress={() => openDetails(v)} />)}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 10 },
  back: { fontSize: 22 },
  title: { fontWeight: '700', fontSize: 16 },
  chips: { flexDirection: 'row', marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: '#DDD', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8 },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipT: { fontSize: 12, color: '#333' },
  chipTOn: { color: '#fff', fontWeight: '700' },
});
