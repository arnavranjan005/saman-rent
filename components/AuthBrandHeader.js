import React from 'react';
import { Text, View } from 'react-native';

/**
 * Splash-style brand lockup for the login / verify-OTP screens.
 * Deep-purple panel with the SR monogram + "Rent Anything, Anytime",
 * matching the SamanRent splash identity.
 */
export default function AuthBrandHeader({ compact = false }) {
  return (
    <View className={`bg-[#1E0E4E] items-center px-5 ${compact ? 'pt-12 pb-6' : 'pt-16 pb-9'}`}>
      <View
        className={`rounded-2xl bg-white/10 border border-white/20 items-center justify-center ${
          compact ? 'w-[60px] h-[60px]' : 'w-[76px] h-[76px]'
        }`}
      >
        <Text className={`font-extrabold ${compact ? 'text-[28px]' : 'text-[36px]'}`}>
          <Text className="text-white">S</Text>
          <Text className="text-[#A78BFA]">R</Text>
        </Text>
      </View>
      <Text className={`text-white font-extrabold mt-3 ${compact ? 'text-[22px]' : 'text-[26px]'}`}>
        Saman<Text className="text-[#A78BFA]">Rent</Text>
      </Text>
      <Text className="text-[#C9C2E8] text-[13px] mt-1">Rent Anything, Anytime</Text>
    </View>
  );
}
