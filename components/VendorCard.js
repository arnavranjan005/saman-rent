import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fmt } from '../data/mock';

export default function VendorCard({ v, onPress }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} testID={`vendor-${v.id}`}>
      <Image source={v.img} style={s.thumb} />
      <View style={s.info}>
        <Text style={s.name}>{v.name}</Text>
        <Text style={s.sub}><Ionicons name="star" size={12} color="#F59E0B" /> {v.rating} ({v.reviews})</Text>
        <Text style={s.loc}>{v.location}</Text>
      </View>
      <View style={s.right}>
        <Ionicons name="heart-outline" size={18} color="#999" />
        <Text style={s.price}>{fmt(v.price)}</Text>
        <Text style={s.onwards}>Onwards</Text>
      </View>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 10, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  thumb: { width: 72, height: 72, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  thumbIcon: { fontSize: 30 },
  info: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  name: { fontWeight: '700', fontSize: 14 },
  sub: { fontSize: 12, color: '#444', marginTop: 2 },
  loc: { fontSize: 11, color: COLORS.grey, marginTop: 2 },
  right: { alignItems: 'flex-end', justifyContent: 'center' },
  price: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginTop: 4 },
  onwards: { fontSize: 10, color: COLORS.grey },
});
