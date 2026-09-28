import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BOOKINGS, IMG } from '../data/mock';

const MENU = [
  { label: 'My Wishlist', icon: 'heart-outline' },
  { label: 'Address Book', icon: 'location-outline' },
  { label: 'Payment Methods', icon: 'card-outline' },
  { label: 'Help & Support', icon: 'help-circle-outline' },
  { label: 'About Us', icon: 'information-circle-outline' },
  { label: 'Log Out', icon: 'log-out-outline' },
];
const badge = (st) => st === 'Confirmed' ? COLORS.green : st === 'Pending' ? COLORS.orange : COLORS.red;

export default function ProfileScreen() {
  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={s.header}>
        <Image source={IMG.avatar} style={s.avatar} resizeMode="cover" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.name}>Md Rustam Khan</Text>
          <Text style={s.ph}>+91 9123456789</Text>
          <Text style={s.edit}>Edit Profile</Text>
        </View>
        <Text> </Text>
        <Ionicons name="settings-outline" size={22} color="#333" />
      </View>
      <View style={s.row}><Text style={s.h}>My Bookings</Text><Text style={s.link}>View All</Text></View>
      {BOOKINGS.map((b) => (
        <View key={b.id} style={s.bCard} testID={`booking-${b.id}`}>
          <Image source={b.img} style={s.thumb} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.bN}>{b.vendor}</Text>
            <Text style={s.bD}>{b.date} {'\n'}{b.time}</Text>
          </View>
          <Text style={[s.badge, { color: badge(b.status) }]}>{b.status}</Text>
        </View>
      ))}
      {MENU.map((m) => (
        <TouchableOpacity key={m.label} style={s.menu}>
          <View style={s.menuL}><Ionicons name={m.icon} size={18} color="#555" /><Text style={s.menuT}>{m.label}</Text></View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center' },
  name: { fontWeight: '800', fontSize: 16 }, ph: { fontSize: 12, color: '#666' }, edit: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 },
  h: { fontWeight: '700' }, link: { color: COLORS.primary, fontSize: 12 },
  bCard: { flexDirection: 'row', backgroundColor: '#F8F7FF', borderRadius: 12, padding: 10, marginBottom: 10, alignItems: 'center' },
  thumb: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bN: { fontWeight: '700', fontSize: 13 }, bD: { fontSize: 11, color: '#666' },
  badge: { fontSize: 11, fontWeight: '700' },
  menu: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  menuL: { flexDirection: 'row', alignItems: 'center' },
  menuT: { marginLeft: 10, fontSize: 14 },
});
