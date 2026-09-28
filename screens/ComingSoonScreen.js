import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../data/mock';

export default function ComingSoonScreen({ title, message, icon, onHome }) {
  const router = useRouter();
  const goHome = onHome || (() => router.replace('/'));
  return (
    <View className="flex-1 bg-white items-center px-8 pt-[130px]">
      <View className="w-[110px] h-[110px] rounded-full bg-[#EFEAFF] items-center justify-center">
        <Ionicons name={icon || 'hourglass-outline'} size={48} color={COLORS.primary} />
      </View>
      <Text className="font-extrabold text-[22px] mt-5">{title}</Text>
      <Text className="text-primary font-bold text-[13px] mt-1.5 bg-[#EFEAFF] px-3.5 py-1 rounded-full overflow-hidden">
        Coming Soon
      </Text>
      <Text className="text-center text-[#666] text-sm mt-3 leading-5">{message}</Text>
      <TouchableOpacity
        className="bg-primary rounded-xl px-8 py-3.5 mt-6"
        onPress={goHome}
        testID="coming-home-btn"
      >
        <Text className="text-white font-bold text-[15px]">Explore Services</Text>
      </TouchableOpacity>
    </View>
  );
}
