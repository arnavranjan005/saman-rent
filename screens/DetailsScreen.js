import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, VENDORS, fmt } from '../data/mock';

const FALLBACK = { id: '1', name: 'Royal DJ Sound', rating: 4.8, reviews: 120, location: 'Koderma, Jharkhand', price: 15000, color: '#2D1B69', img: require('../assets/vendors/dj1.jpg'), hero: require('../assets/vendors/djhero.jpg') };

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const vendor = VENDORS.find((x) => x.id === id) || FALLBACK;
  const v = vendor;
  const goBack = () => router.back();
  const openBooking = () => router.push({ pathname: '/booking', params: { id: v.id } });
  return (
    <View style={s.wrap}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <ImageBackground source={v.hero || v.img} style={s.hero} resizeMode="cover">
          <View style={s.heroTop}>
            <TouchableOpacity onPress={goBack} testID="details-back"><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
            <View style={{ flexDirection: 'row' }}><Ionicons name="heart-outline" size={22} color="#fff" /><View style={{ width: 12 }} /><Ionicons name="share-outline" size={22} color="#fff" /></View>
          </View>
        </ImageBackground>
        <View style={s.body}>
          <Text style={s.name}>{v.name}</Text>
          <Text style={s.rate}><Ionicons name="star" size={12} color="#F59E0B" /> {v.rating} ({v.reviews} Reviews)   <Ionicons name="checkmark-circle" size={12} color="#16A34A" /> Verified</Text>
          <Text style={s.loc}><Ionicons name="location-outline" size={12} color="#666" /> {v.location}</Text>
          <Text style={s.h}>About</Text>
          <Text style={s.p}>We provide best DJ services for weddings, parties, birthdays & all types of events.</Text>
          <View style={s.stats}>
            {[['10+ Years', 'Experience'], ['50+ Events', 'Completed'], ['2', 'Team Size'], ['All India', 'Available']].map(([a, b]) => (
              <View key={b} style={s.stat}><Text style={s.statA}>{a}</Text><Text style={s.statB}>{b}</Text></View>
            ))}
          </View>
          <Text style={s.h}>Price</Text>
          <Text style={s.price}>{fmt(v.price)} Onwards</Text>
        </View>
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.btn} onPress={openBooking} testID="book-now-btn">
          <Text style={s.btnT}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 250, width: '100%', padding: 14, paddingTop: 35, justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  heroNav: { color: '#fff', fontSize: 20 },
  heroEmoji: { fontSize: 80, textAlign: 'center' },
  body: { padding: 16 },
  name: { fontWeight: '800', fontSize: 19 },
  rate: { fontSize: 12, marginTop: 4 },
  loc: { fontSize: 12, color: '#666', marginTop: 2 },
  h: { fontWeight: '700', fontSize: 15, marginTop: 14 },
  p: { fontSize: 13, color: '#555', marginTop: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, backgroundColor: '#F6F5FF', borderRadius: 12, padding: 12 },
  stat: { alignItems: 'center' },
  statA: { fontWeight: '700', fontSize: 12 },
  statB: { fontSize: 10, color: '#666' },
  price: { color: COLORS.primary, fontWeight: '800', fontSize: 16, marginTop: 4 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: '#fff' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '700' },
});
