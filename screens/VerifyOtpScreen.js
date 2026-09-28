import React, { useRef, useState } from 'react';
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
      style={s.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => router.back()} testID="verify-back">
        <Ionicons name="arrow-back" size={22} color="#000" />
      </TouchableOpacity>
      <Text style={s.title}>Enter OTP</Text>
      <Text style={s.sub}>Sent to +91 {phone}</Text>
      <View style={s.boxes} testID="otp-input">
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              refs.current[i] = r;
            }}
            style={[s.box, focused === i && s.boxFocus, d ? s.boxFill : null]}
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
        style={[s.btn, (!complete || verify.isPending) && s.btnOff]}
        onPress={submit}
        disabled={!complete || verify.isPending}
        testID="verify-otp-btn"
      >
        <Text style={s.btnT}>{verify.isPending ? 'Verifying…' : 'Verify & Log In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.resend}
        onPress={() => {
          setDigits(Array(LEN).fill(''));
          focusBox(0);
          resend.mutate(String(phone ?? ''));
        }}
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
  boxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#DDD',
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111',
    backgroundColor: '#FAFAFA',
  },
  boxFocus: { borderColor: COLORS.primary, backgroundColor: '#fff' },
  boxFill: { borderColor: COLORS.primary },
  err: { color: COLORS.red, marginTop: 12, fontWeight: '600' },
  ok: { color: COLORS.green, marginTop: 12, fontWeight: '700' },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  btnOff: { opacity: 0.5 },
  btnT: { color: '#fff', fontWeight: '700' },
  resend: { alignItems: 'center', marginTop: 14 },
  resendT: { color: COLORS.primary, fontWeight: '700' },
});
