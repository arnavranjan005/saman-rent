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
import { useRouter } from 'expo-router';
import { COLORS } from '../data/mock';
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
      style={s.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.icon}>
        <Ionicons name="phone-portrait-outline" size={40} color={COLORS.primary} />
      </View>
      <Text style={s.title}>Log in to SamanRent</Text>
      <Text style={s.sub}>Enter your mobile number. We will send a 6-digit OTP.</Text>
      <Text style={s.label}>Mobile Number</Text>
      <TextInput
        style={s.input}
        placeholder="10-digit mobile number"
        keyboardType="number-pad"
        maxLength={13}
        value={phone}
        onChangeText={setPhone}
        testID="login-phone-input"
      />
      {sendOtp.isError && (
        <Text style={s.err} testID="login-error">
          {sendOtp.error?.message ?? 'Could not send OTP. Try again.'}
        </Text>
      )}
      <TouchableOpacity
        style={[s.btn, sendOtp.isPending && s.btnOff]}
        onPress={submit}
        disabled={sendOtp.isPending}
        testID="send-otp-btn"
      >
        <Text style={s.btnT}>
          {sendOtp.isPending ? 'Sending OTP…' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 20, justifyContent: 'center' },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F6F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontWeight: '800', fontSize: 22 },
  sub: { color: '#666', fontSize: 13, marginTop: 6 },
  label: { fontWeight: '600', fontSize: 13, marginTop: 20, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  err: { color: COLORS.red, marginTop: 10, fontWeight: '600' },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  btnOff: { opacity: 0.6 },
  btnT: { color: '#fff', fontWeight: '700' },
});
