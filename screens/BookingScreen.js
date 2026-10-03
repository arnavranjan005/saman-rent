import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import { fmt } from '../lib/format';
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
      <View className="flex-1 bg-white p-3.5">
        <View className="flex-row justify-between mt-2 mb-2.5">
          <TouchableOpacity onPress={goBack} testID="booking-back">
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text className="font-bold text-base">Book Now</Text>
          <Text className="text-[22px]"> </Text>
        </View>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-sm text-[#555] mb-3">Log in to send a booking request.</Text>
          <TouchableOpacity
            className="bg-primary rounded-xl p-[15px] items-center"
            onPress={() => router.push('/login')}
            testID="booking-login-btn"
          >
            <Text className="text-white font-bold">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const submit = () => {
    create.mutate({
      serviceId: v.id,
      date,
      startTime,
      duration: hours,
      location: loc,
      eventType,
      notes: notes || undefined,
    });
  };

  const booking = create.data;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 p-3.5">
      <View className="flex-row justify-between mt-2 mb-2.5">
        <TouchableOpacity onPress={goBack} testID="booking-back">
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text className="font-bold text-base">Book Now</Text>
        <Text className="text-[22px]"> </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View className="flex-row bg-[#F6F5FF] rounded-[14px] p-3 items-center">
          <Image source={resolveImage(v.img)} className="w-[60px] h-[60px] rounded-xl mr-2.5" />
          <View>
            <Text className="font-bold">{v.name}</Text>
            <Text className="text-primary font-bold">{fmt(v.price)} Onwards</Text>
            <Text className="text-[11px] text-[#666]">
              <Ionicons name="location-outline" size={11} color="#666" /> {v.location}
            </Text>
          </View>
        </View>
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">
          <Ionicons name="calendar-outline" size={12} color="#666" /> Event Date (YYYY-MM-DD)
        </Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3 text-sm"
          value={date}
          onChangeText={setDate}
          testID="field-date"
        />
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">
          <Ionicons name="time-outline" size={12} color="#666" /> Event Time (HH:MM, 24h)
        </Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3 text-sm"
          value={startTime}
          onChangeText={setStartTime}
          testID="field-time"
        />
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">
          <Ionicons name="hourglass-outline" size={12} color="#666" /> Duration (hours)
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            className="border border-[#DDD] rounded-[10px] w-[46px] h-[46px] items-center justify-center"
            onPress={() => setDuration(String(Math.max(1, hours - 1)))}
            testID="duration-minus"
          >
            <Text className="text-xl font-bold text-primary">−</Text>
          </TouchableOpacity>
          <TextInput
            className="border border-[#DDD] rounded-[10px] p-3 text-sm flex-1 mx-2 text-center"
            value={String(hours)}
            keyboardType="number-pad"
            onChangeText={(t) => setDuration(t.replace(/\D/g, ''))}
            testID="field-duration"
          />
          <TouchableOpacity
            className="border border-[#DDD] rounded-[10px] w-[46px] h-[46px] items-center justify-center"
            onPress={() => setDuration(String(Math.min(24, hours + 1)))}
            testID="duration-plus"
          >
            <Text className="text-xl font-bold text-primary">+</Text>
          </TouchableOpacity>
        </View>
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">
          <Ionicons name="location-outline" size={12} color="#666" /> Location
        </Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3 text-sm"
          value={loc}
          onChangeText={setLocation}
          placeholder={v.location}
          testID="field-loc"
        />
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">
          <Ionicons name="pricetag-outline" size={12} color="#666" /> Event Type
        </Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3 text-sm"
          value={eventType}
          onChangeText={setEventType}
          testID="field-type"
        />
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">Additional Notes (Optional)</Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3 min-h-[60px]"
          placeholder="Write something..."
          value={notes}
          onChangeText={setNotes}
          testID="field-notes"
          multiline
        />
        <View className="flex-row justify-between mt-4">
          <Text>Total Price</Text>
          <Text className="text-leaf font-extrabold text-base">{fmt(v.price * hours)}</Text>
        </View>
        {create.isError && (
          <Text className="text-danger mt-3 font-semibold" testID="booking-error-msg">
            {create.error?.message ?? 'Could not send the booking request.'}
          </Text>
        )}
        {booking && (
          <Text className="text-leaf mt-3 font-bold" testID="booking-done">
            ✓ Booking request sent! ID {booking.id}. Vendor will confirm shortly.
          </Text>
        )}
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 p-3.5 bg-white">
        <TouchableOpacity
          className={`bg-primary rounded-xl p-[15px] items-center ${create.isPending || booking ? 'opacity-60' : ''}`}
          testID="send-booking-btn"
          onPress={submit}
          disabled={create.isPending || Boolean(booking)}
        >
          <Text className="text-white font-bold">
            {create.isPending ? 'Sending…' : booking ? 'Request Sent' : 'Send Booking Request'}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}
