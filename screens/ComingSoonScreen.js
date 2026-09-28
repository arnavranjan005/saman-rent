import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../data/mock';

export default function ComingSoonScreen({ title, message, icon, onHome }) {
  const router = useRouter();
  const goHome = onHome || (() => router.replace('/'));
  return (
    <View style={s.wrap}>
      <View style={s.circle}>
        <Ionicons name={icon || 'hourglass-outline'} size={48} color={COLORS.primary} />
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.badge}>Coming Soon</Text>
      <Text style={s.msg}>{message}</Text>
      <TouchableOpacity style={s.btn} onPress={goHome} testID="coming-home-btn">
        <Text style={s.btnT}>Explore Services</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingHorizontal: 32, paddingTop: 130 },
  circle: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#EFEAFF', alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 22, marginTop: 20 },
  badge: { color: COLORS.primary, fontWeight: '700', fontSize: 13, marginTop: 6, backgroundColor: '#EFEAFF', paddingVertical: 4, paddingHorizontal: 14, borderRadius: 20, overflow: 'hidden' },
  msg: { textAlign: 'center', color: '#666', fontSize: 14, marginTop: 12, lineHeight: 20 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 26 },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
