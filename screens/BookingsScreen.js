import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, fmt } from '../data/mock';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useMe } from '../hooks/useAuth';
import { useBooking, useBookings, useCancelBooking } from '../hooks/useBookings';

const badge = (st) =>
  st === 'CONFIRMED' || st === 'COMPLETED'
    ? COLORS.green
    : st === 'PENDING'
      ? COLORS.orange
      : COLORS.red;

function BookingRow({ b, onOpen }) {
  return (
    <TouchableOpacity style={s.card} onPress={() => onOpen(b.id)} testID={`booking-${b.id}`}>
      <View style={{ flex: 1 }}>
        <Text style={s.bN}>{b.service.name}</Text>
        <Text style={s.bD}>
          {b.date} · {b.startTime} · {b.duration}h
        </Text>
        <Text style={s.bD}>{fmt(b.total)}</Text>
      </View>
      <Text style={[s.badge, { color: badge(b.status) }]}>{b.status}</Text>
    </TouchableOpacity>
  );
}

function BookingDetail({ id, onClose }) {
  const { data: b, isPending, isError, error, refetch } = useBooking(id);
  const cancel = useCancelBooking();

  if (isPending) return <LoadingState testID="booking-detail-loading" />;
  if (isError || !b) {
    return (
      <ErrorState
        testID="booking-detail-error"
        message={error?.message ?? 'Booking not found.'}
        onRetry={() => refetch()}
      />
    );
  }

  const doCancel = () => {
    Alert.alert('Cancel booking?', 'This will cancel your pending request.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: () => cancel.mutate(b.id),
      },
    ]);
  };

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ paddingBottom: 20 }}>
      <TouchableOpacity onPress={onClose} testID="booking-detail-back">
        <Text style={s.link}>← All bookings</Text>
      </TouchableOpacity>
      <Text style={s.title}>{b.service.name}</Text>
      <Text style={[s.badge, { color: badge(b.status) }]}>{b.status}</Text>
      <View style={s.kv}>
        <Text style={s.k}>Date</Text>
        <Text style={s.v}>{b.date}</Text>
      </View>
      <View style={s.kv}>
        <Text style={s.k}>Time</Text>
        <Text style={s.v}>
          {b.startTime} · {b.duration}h
        </Text>
      </View>
      <View style={s.kv}>
        <Text style={s.k}>Location</Text>
        <Text style={s.v}>{b.location}</Text>
      </View>
      {b.eventType && (
        <View style={s.kv}>
          <Text style={s.k}>Event</Text>
          <Text style={s.v}>{b.eventType}</Text>
        </View>
      )}
      {b.notes && (
        <View style={s.kv}>
          <Text style={s.k}>Notes</Text>
          <Text style={s.v}>{b.notes}</Text>
        </View>
      )}
      <View style={s.kv}>
        <Text style={s.k}>Total</Text>
        <Text style={s.total}>{fmt(b.total)}</Text>
      </View>
      {cancel.isError && (
        <Text style={s.err} testID="booking-cancel-error">
          {cancel.error?.message}
        </Text>
      )}
      {b.status === 'PENDING' && (
        <TouchableOpacity
          style={s.cancelBtn}
          onPress={doCancel}
          disabled={cancel.isPending}
          testID="booking-cancel-btn"
        >
          <Text style={s.cancelT}>
            {cancel.isPending ? 'Cancelling…' : 'Cancel Booking'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const { data: me } = useMe();
  const [selectedId, setSelectedId] = useState(null);
  const { data, isPending, isError, error, refetch } = useBookings(Boolean(me));

  if (!me) {
    return (
      <View style={s.auth}>
        <Text style={s.authT}>Log in to see your bookings.</Text>
        <TouchableOpacity
          style={s.loginBtn}
          onPress={() => router.push('/login')}
          testID="bookings-login-btn"
        >
          <Text style={s.loginT}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (selectedId) return <BookingDetail id={selectedId} onClose={() => setSelectedId(null)} />;
  if (isPending) return <LoadingState testID="bookings-loading" />;
  if (isError) {
    return (
      <ErrorState
        testID="bookings-error"
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  const list = data ?? [];
  if (list.length === 0) {
    return (
      <EmptyState
        testID="bookings-empty"
        message="No bookings yet. Find a service and send your first request."
      />
    );
  }

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={s.title}>My Bookings</Text>
      {list.map((b) => (
        <BookingRow key={b.id} b={b} onOpen={setSelectedId} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 14 },
  title: { fontWeight: '800', fontSize: 18, marginTop: 8, marginBottom: 12 },
  link: { color: COLORS.primary, fontSize: 13, marginTop: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  bN: { fontWeight: '700', fontSize: 14 },
  bD: { fontSize: 12, color: '#666', marginTop: 2 },
  badge: { fontSize: 11, fontWeight: '800' },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  k: { color: '#666', fontSize: 13 },
  v: { fontWeight: '600', fontSize: 13 },
  total: { color: COLORS.green, fontWeight: '800', fontSize: 15 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelT: { color: COLORS.red, fontWeight: '700' },
  err: { color: COLORS.red, marginTop: 12, fontWeight: '600' },
  auth: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  authT: { fontSize: 14, color: '#555', marginBottom: 12 },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  loginT: { color: '#fff', fontWeight: '700' },
});
