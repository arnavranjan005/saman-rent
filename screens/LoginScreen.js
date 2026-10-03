import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import { useSendOtp } from '../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const sendOtp = useSendOtp();

  const submit = () => {
    const digits = phone.replace(/\D/g, '');
    sendOtp.mutate(digits, {
      onSuccess: () =>
        router.push({ pathname: '/verify-otp', params: { phone: digits } }),
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white p-5 justify-center"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="w-[72px] h-[72px] rounded-full bg-[#F6F5FF] items-center justify-center mb-4">
        <Ionicons name="phone-portrait-outline" size={40} color={COLORS.primary} />
      </View>
      <Text className="font-extrabold text-[22px]">Log in to SamanRent</Text>
      <Text className="text-[#666] text-[13px] mt-1.5">
        Enter your mobile number. We will send a 6-digit OTP.
      </Text>
      <Text className="font-semibold text-[13px] mt-5 mb-1.5">Mobile Number</Text>
      <TextInput
        className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
        placeholder="10-digit mobile number"
        keyboardType="number-pad"
        maxLength={13}
        value={phone}
        onChangeText={setPhone}
        testID="login-phone-input"
      />
      {sendOtp.isError && (
        <Text className="text-danger mt-2.5 font-semibold" testID="login-error">
          {sendOtp.error?.message ?? 'Could not send OTP. Try again.'}
        </Text>
      )}
      <TouchableOpacity
        className={`bg-primary rounded-xl p-[15px] items-center mt-4 ${sendOtp.isPending ? 'opacity-60' : ''}`}
        onPress={submit}
        disabled={sendOtp.isPending}
        testID="send-otp-btn"
      >
        <Text className="text-white font-bold">
          {sendOtp.isPending ? 'Sending OTP…' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
