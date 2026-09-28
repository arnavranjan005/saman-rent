import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FAQS = [
  {
    q: 'How do I book a service?',
    a: 'Open a service, tap Book Now, pick your date, time, duration and location, then send the request. The vendor confirms it shortly.',
  },
  {
    q: 'How do I know my booking is confirmed?',
    a: 'Check the Bookings tab. A request starts as PENDING and changes to CONFIRMED once the vendor accepts it.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Open the booking in the Bookings tab and tap Cancel Booking while it is still PENDING.',
  },
  {
    q: 'How do I log in?',
    a: 'Go to Profile and tap the log-in icon. Enter your mobile number and the 6-digit OTP we send you.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white p-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="flex-row items-center mt-2 mb-4">
        <TouchableOpacity onPress={() => router.back()} testID="help-back">
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text className="font-extrabold text-lg ml-3">Help & Support</Text>
      </View>
      {FAQS.map((f) => (
        <View key={f.q} className="bg-[#F8F7FF] rounded-xl p-4 mb-3">
          <Text className="font-bold text-sm">{f.q}</Text>
          <Text className="text-[13px] text-[#555] mt-1.5">{f.a}</Text>
        </View>
      ))}
      <Text className="text-xs text-muted text-center mt-2">
        Still stuck? Contact support@samanrent.app
      </Text>
    </ScrollView>
  );
}
