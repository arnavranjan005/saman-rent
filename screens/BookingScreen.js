import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, VENDORS, fmt } from '../data/mock';

function Field({ label, value, onPress, testID }) {
  return (
    <View style={s.fWrap}>
      <Text style={s.fLabel}>{label}</Text>
      <TouchableOpacity style={s.fBox} onPress={onPress} testID={testID}><Text>{value}</Text></TouchableOpacity>
    </View>
  );
}
export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const vendor = VENDORS.find((x) => x.id === id);
  const v = vendor || { name: 'Royal DJ Sound', price: 15000, location: 'Koderma, Jharkhand', color: '#2D1B69', img: require('../assets/vendors/dj1.jpg') };
  const goBack = () => router.back();
  const [date, setDate] = useState('15 Aug 2026');
  const [sent, setSent] = useState(false);
  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} testID="booking-back"><Ionicons name="arrow-back" size={22} color="#000" /></TouchableOpacity>
        <Text style={s.title}>Book Now</Text><Text style={s.back}> </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={s.sum}>
          <Image source={v.img} style={s.thumb} />
          <View><Text style={s.sumN}>{v.name}</Text><Text style={s.sumP}>{fmt(v.price)} Onwards</Text><Text style={s.sumL}><Ionicons name="location-outline" size={11} color="#666" /> {v.location}</Text></View>
        </View>
        <Field label="Event Date" value={date} testID="field-date" onPress={() => setDate(date === '15 Aug 2026' ? '16 Aug 2026' : '15 Aug 2026')} />
        <Field label="Event Time" value="07:00 PM" testID="field-time" />
        <Field label="Location" value={v.location} testID="field-loc" />
        <Field label="Event Type" value="Wedding ▾" testID="field-type" />
        <Text style={s.fLabel}>Additional Notes (Optional)</Text>
        <TextInput style={s.notes} placeholder="Write something..." testID="field-notes" />
        <View style={s.total}><Text>Total Price</Text><Text style={s.totalP}>{fmt(v.price)}</Text></View>
        {sent && <Text style={s.ok} testID="booking-done">✓ Booking request sent! Vendor will confirm shortly.</Text>}
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity style={s.btn} testID="send-booking-btn" onPress={() => { setSent(true); }}>
          <Text style={s.btnT}>Send Booking Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 },
  back: { fontSize: 22 }, title: { fontWeight: '700', fontSize: 16 },
  sum: { flexDirection: 'row', backgroundColor: '#F6F5FF', borderRadius: 14, padding: 12, alignItems: 'center' },
  thumb: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  sumN: { fontWeight: '700' }, sumP: { color: COLORS.primary, fontWeight: '700' }, sumL: { fontSize: 11, color: '#666' },
  fWrap: { marginTop: 12 }, fLabel: { fontWeight: '600', fontSize: 13, marginTop: 12, marginBottom: 6 },
  fBox: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12 },
  notes: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, minHeight: 60 },
  total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  totalP: { color: COLORS.green, fontWeight: '800', fontSize: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: '#fff' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center' },
  btnT: { color: '#fff', fontWeight: '700' },
  ok: { color: COLORS.green, marginTop: 12, fontWeight: '700' },
});
