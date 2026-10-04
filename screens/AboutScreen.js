import React from 'react';
import { Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenHeader from '../components/ScreenHeader';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-white p-5" contentContainerStyle={{ paddingBottom: 24 }}>
      <ScreenHeader title="About Us" onBack={() => router.back()} backTestID="about-back" />
      <Text className="text-primary font-extrabold text-[22px]">SamanRent</Text>
      <Text className="text-sm text-[#555] mt-2 leading-5">
        SamanRent is a rental marketplace for events — DJs, tent houses, luxury cars and more.
        Browse verified vendors around Koderma, send a booking request in seconds, and track
        confirmation right in the app.
      </Text>
      <Text className="text-sm text-[#555] mt-2 leading-5">
        Vendors manage their services and accept requests from their own dashboard, so every
        booking is confirmed by a real person.
      </Text>
      <Text className="text-xs text-muted mt-4">Version 1.0.0 (MVP)</Text>
    </ScrollView>
  );
}
