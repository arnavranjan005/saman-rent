import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, fmt, IMG } from '../data/mock';
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
    <ScrollView style={s.wrap} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={s.header}>
        <View><Text style={s.logo}>SamanRent</Text><Text style={s.loc}><Ionicons name="location" size={12} color={COLORS.primary} /> Koderma, Jharkhand</Text></View>
        <Ionicons name="notifications-outline" size={22} color="#333" />
      </View>
      <View style={s.banner}>
        <View style={{ flex: 1 }}>
          <Text style={s.bannerT}>Make Your Event{'\n'}Extra Special</Text>
          <Text style={s.bannerS}>Book DJ, Tent, Luxury Cars and more...</Text>
          <TouchableOpacity style={s.bannerBtn} onPress={() => openCategory('dj')} testID="explore-btn">
            <Text style={s.bannerBtnT}>Explore Now</Text>
          </TouchableOpacity>
        </View>
        <Image source={IMG.banner} style={s.bannerImg} />
      </View>
      <View style={s.row}><Text style={s.h}>Top Categories</Text><Text style={s.link}>View All</Text></View>
      <View style={s.cats}>
        {cats.map((c) => (
          <TouchableOpacity key={c.id} style={[s.cat, { backgroundColor: c.color }]} onPress={() => openCategory(c.id)} testID={`cat-${c.id}`}>
            {c.lib === 'mci' ? <MaterialCommunityIcons name={c.icon} size={30} color="#B45309" /> : <Ionicons name={c.icon} size={30} color={COLORS.primary} />}<Text style={s.catT}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={s.row}><Text style={s.h}>Popular Near You</Text><Text style={s.link}>View All</Text></View>
      {popular.map((v) => (
        <VendorCard key={v.id} v={v} onPress={() => openDetails(v)} />
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  logo: { color: COLORS.primary, fontWeight: '800', fontSize: 20 },
  loc: { fontSize: 12, color: '#333' },
  bell: { fontSize: 20 },
  banner: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, marginTop: 12, alignItems: 'center' },
  bannerT: { color: '#fff', fontWeight: '800', fontSize: 17 },
  bannerS: { color: '#DDD6FE', fontSize: 11, marginTop: 4 },
  bannerBtn: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, marginTop: 10, alignSelf: 'flex-start' },
  bannerBtnT: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  bannerEmoji: { fontSize: 60 },
  bannerImg: { width: 90, height: 110, borderRadius: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  h: { fontWeight: '700', fontSize: 15 },
  link: { color: COLORS.primary, fontSize: 12 },
  cats: { flexDirection: 'row', justifyContent: 'space-between' },
  cat: { width: '31%', borderRadius: 14, padding: 12, alignItems: 'center' },
  catIcon: { fontSize: 28 },
  catT: { fontSize: 11, fontWeight: '600', marginTop: 6, textAlign: 'center' },
});
