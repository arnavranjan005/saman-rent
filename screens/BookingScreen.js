import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, fmt } from '../data/mock';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useMe } from '../hooks/useAuth';
import { useCreateBooking } from '../hooks/useBookings';
import { useService } from '../hooks/useServices';
import { resolveImage } from '../lib/serviceImage';

export default function BookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: me } = useMe();
  const service = useService(id);
  const create = useCreateBooking();

  const [date, setDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('19:00');
  const [duration, setDuration] = useState('5');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [notes, setNotes] = useState('');

  const goBack = () => router.back();

  if (service.isPending) return <LoadingState testID="booking-loading" />;
  if (service.isError || !service.data) {
    return (
      <ErrorState
        testID="booking-error"
        message={service.error?.message ?? 'Service not found.'}
        onRetry={() => service.refetch()}
      />
    );
  }

  const v = service.data;
  const loc = location || v.location || '';
  const hours = Math.min(24, Math.max(1, parseInt(duration, 10) || 1));

  if (!me) {
    return (
      <View style={s.wrap}>
        <View style={s.header}>
          <TouchableOpacity onPress={goBack} testID="booking-back"><Ionicons name="arrow-back" size={22} color="#000" /></TouchableOpacity>
          <Text style={s.title}>Book Now</Text><Text style={s.back}> </Text>
        </View>
        <View style={s.auth}>
          <Text style={s.authT}>Log in to send a booking request.</Text>
          <TouchableOpacity
            style={s.btn}
            onPress={() => router.push('/login')}
            testID="booking-login-btn"
          >
            <Text style={s.btnT}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const submit = () => {
    create.mutate(
      {
        serviceId: v.id,
        date,
        startTime,
        duration: hours,
        location: loc,
        eventType,
        notes: notes || undefined,
      },
      { onSuccess: () => {} },
    );
  };

  const booking = create.data;

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <TouchableOpacity onPress={goBack} testID="booking-back"><Ionicons name="arrow-back" size={22} color="#000" /></TouchableOpacity>
        <Text style={s.title}>Book Now</Text><Text style={s.back}> </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={s.sum}>
          <Image source={resolveImage(v.img)} style={s.thumb} />
          <View><Text style={s.sumN}>{v.name}</Text><Text style={s.sumP}>{fmt(v.price)} Onwards</Text><Text style={s.sumL}><Ionicons name="location-outline" size={11} color="#666" /> {v.location}</Text></View>
        </View>
        <Text style={s.fLabel}>Event Date (YYYY-MM-DD)</Text>
        <TextInput style={s.fBox} value={date} onChangeText={setDate} testID="field-date" />
        <Text style={s.fLabel}>Event Time (HH:MM, 24h)</Text>
        <TextInput style={s.fBox} value={startTime} onChangeText={setStartTime} testID="field-time" />
        <Text style={s.fLabel}>Duration (hours)</Text>
        <View style={s.durRow}>
          <TouchableOpacity
            style={s.durBtn}
            onPress={() => setDuration(String(Math.max(1, hours - 1)))}
            testID="duration-minus"
          >
            <Text style={s.durBtnT}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={[s.fBox, s.durInput]}
            value={String(hours)}
            keyboardType="number-pad"
            onChangeText={(t) => setDuration(t.replace(/\D/g, ''))}
            testID="field-duration"
          />
          <TouchableOpacity
            style={s.durBtn}
            onPress={() => setDuration(String(Math.min(24, hours + 1)))}
            testID="duration-plus"
          >
            <Text style={s.durBtnT}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.fLabel}>Location</Text>
        <TextInput
          style={s.fBox}
          value={loc}
          onChangeText={setLocation}
          placeholder={v.location}
          testID="field-loc"
        />
        <Text style={s.fLabel}>Event Type</Text>
        <TextInput style={s.fBox} value={eventType} onChangeText={setEventType} testID="field-type" />
        <Text style={s.fLabel}>Additional Notes (Optional)</Text>
        <TextInput
          style={s.notes}
          placeholder="Write something..."
          value={notes}
          onChangeText={setNotes}
          testID="field-notes"
          multiline
        />
        <View style={s.total}><Text>Total Price</Text><Text style={s.totalP}>{fmt(v.price * hours)}</Text></View>
        {create.isError && (
          <Text style={s.err} testID="booking-error-msg">
            {create.error?.message ?? 'Could not send the booking request.'}
          </Text>
        )}
        {booking && (
          <Text style={s.ok} testID="booking-done">
            ✓ Booking request sent! ID {booking.id}. Vendor will confirm shortly.
          </Text>
        )}
      </ScrollView>
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.btn, (create.isPending || booking) && s.btnOff]}
          testID="send-booking-btn"
          onPress={submit}
          disabled={create.isPending || Boolean(booking)}
        >
          <Text style={s.btnT}>
            {create.isPending ? 'Sending…' : booking ? 'Request Sent' : 'Send Booking Request'}
          </Text>
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
  fLabel: { fontWeight: '600', fontSize: 13, marginTop: 12, marginBottom: 6 },
  fBox: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, fontSize: 14 },
  durRow: { flexDirection: 'row', alignItems: 'center' },
  durBtn: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  durBtnT: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  durInput: { flex: 1, marginHorizontal: 8, textAlign: 'center' },
  notes: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 12, minHeight: 60 },
  total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  totalP: { color: COLORS.green, fontWeight: '800', fontSize: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: '#fff' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center' },
  btnOff: { opacity: 0.6 },
  btnT: { color: '#fff', fontWeight: '700' },
  ok: { color: COLORS.green, marginTop: 12, fontWeight: '700' },
  err: { color: COLORS.red, marginTop: 12, fontWeight: '600' },
  auth: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  authT: { fontSize: 14, color: '#555', marginBottom: 12 },
});
