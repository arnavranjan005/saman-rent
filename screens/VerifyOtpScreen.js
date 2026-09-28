import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../data/mock';
import { useSendOtp, useVerifyOtp } from '../hooks/useAuth';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const verify = useVerifyOtp();
  const resend = useSendOtp();

  const submit = () => {
    verify.mutate(
      { phone: String(phone ?? ''), otp },
      {
        onSuccess: () => router.replace('/(tabs)'),
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={s.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => router.back()} testID="verify-back">
        <Ionicons name="arrow-back" size={22} color="#000" />
      </TouchableOpacity>
      <Text style={s.title}>Enter OTP</Text>
      <Text style={s.sub}>Sent to +91 {phone}</Text>
      <TextInput
        style={s.input}
        placeholder="6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        testID="otp-input"
      />
      {verify.isError && (
        <Text style={s.err} testID="verify-error">
          {verify.error?.message ?? 'Incorrect OTP. Try again.'}
        </Text>
      )}
      {verify.data && (
        <Text style={s.ok} testID="login-success">
          Logged in successfully.
        </Text>
      )}
      <TouchableOpacity
        style={[s.btn, verify.isPending && s.btnOff]}
        onPress={submit}
        disabled={verify.isPending}
        testID="verify-otp-btn"
      >
        <Text style={s.btnT}>{verify.isPending ? 'Verifying…' : 'Verify & Log In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.resend}
        onPress={() => resend.mutate(String(phone ?? ''))}
        disabled={resend.isPending}
        testID="resend-otp-btn"
      >
        <Text style={s.resendT}>
          {resend.isPending ? 'Resending…' : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 40 },
  title: { fontWeight: '800', fontSize: 22, marginTop: 16 },
  sub: { color: '#666', fontSize: 13, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    marginTop: 20,
  },
  err: { color: COLORS.red, marginTop: 10, fontWeight: '600' },
  ok: { color: COLORS.green, marginTop: 10, fontWeight: '700' },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  btnOff: { opacity: 0.6 },
  btnT: { color: '#fff', fontWeight: '700' },
  resend: { alignItems: 'center', marginTop: 14 },
  resendT: { color: COLORS.primary, fontWeight: '700' },
});
