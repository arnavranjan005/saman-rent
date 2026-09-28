import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../data/mock';
import { useSendOtp, useVerifyOtp } from '../hooks/useAuth';

const LEN = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [focused, setFocused] = useState(-1);
  const refs = useRef([]);
  const verify = useVerifyOtp();
  const resend = useSendOtp();

  const otp = digits.join('');
  const complete = otp.length === LEN;

  const focusBox = (i) => refs.current[i]?.focus();

  const handleChange = (i, val) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      // Pasted a full code — distribute across boxes.
      const next = [...digits];
      for (let k = 0; k < clean.length && i + k < LEN; k++) {
        next[i + k] = clean[k];
      }
      setDigits(next);
      focusBox(Math.min(i + clean.length, LEN - 1));
      return;
    }
    const next = [...digits];
    next[i] = clean.slice(-1);
    setDigits(next);
    if (clean && i < LEN - 1) focusBox(i + 1);
  };

  const handleKeyPress = (i, e) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
      focusBox(i - 1);
    }
  };

  const submit = () => {
    if (!complete || verify.isPending) return;
    verify.mutate(
      { phone: String(phone ?? ''), otp },
      {
        onSuccess: () => router.replace('/(tabs)'),
      },
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white p-5 pt-10"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => router.back()} testID="verify-back">
        <Ionicons name="arrow-back" size={22} color="#000" />
      </TouchableOpacity>
      <Text className="font-extrabold text-[22px] mt-4">Enter OTP</Text>
      <Text className="text-[#666] text-[13px] mt-1.5">Sent to +91 {phone}</Text>
      <View className="flex-row justify-between mt-6" testID="otp-input">
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              refs.current[i] = r;
            }}
            className={`w-12 h-14 border-[1.5px] rounded-xl text-[22px] font-bold text-center text-[#111] bg-[#FAFAFA] ${
              focused === i || d ? 'border-primary bg-white' : 'border-[#DDD]'
            }`}
            keyboardType="number-pad"
            maxLength={6}
            value={d}
            onChangeText={(v) => handleChange(i, v)}
            onKeyPress={(e) => handleKeyPress(i, e)}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(-1)}
            selectTextOnFocus
            testID={`otp-box-${i}`}
          />
        ))}
      </View>
      {verify.isError && (
        <Text className="text-danger mt-3 font-semibold" testID="verify-error">
          {verify.error?.message ?? 'Incorrect OTP. Try again.'}
        </Text>
      )}
      {verify.data && (
        <Text className="text-leaf mt-3 font-bold" testID="login-success">
          Logged in successfully.
        </Text>
      )}
      <TouchableOpacity
        className={`bg-primary rounded-xl p-[15px] items-center mt-5 ${!complete || verify.isPending ? 'opacity-50' : ''}`}
        onPress={submit}
        disabled={!complete || verify.isPending}
        testID="verify-otp-btn"
      >
        <Text className="text-white font-bold">
          {verify.isPending ? 'Verifying…' : 'Verify & Log In'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center mt-3.5"
        onPress={() => {
          setDigits(Array(LEN).fill(''));
          focusBox(0);
          resend.mutate(String(phone ?? ''));
        }}
        disabled={resend.isPending}
        testID="resend-otp-btn"
      >
        <Text className="text-primary font-bold">
          {resend.isPending ? 'Resending…' : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
