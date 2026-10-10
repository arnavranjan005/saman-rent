import React, { useEffect, useRef, useState } from 'react';
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
import { StatusBar } from 'expo-status-bar';
import AuthBrandHeader from '../components/AuthBrandHeader';
import {
  clearPhoneConfirmation,
  friendlyFirebaseError,
  getFirebaseAuthModule,
  getPhoneConfirmation,
  setPhoneConfirmation,
} from '../lib/phoneAuth';
import { useFirebaseLogin, useSendOtp, useVerifyOtp } from '../hooks/useAuth';

const LEN = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone, via } = useLocalSearchParams();
  const isFirebase = via === 'firebase';
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [focused, setFocused] = useState(-1);
  const [fbError, setFbError] = useState('');
  const [fbConfirming, setFbConfirming] = useState(false);
  const refs = useRef([]);
  const verify = useVerifyOtp();
  const resend = useSendOtp();
  const firebaseLogin = useFirebaseLogin();

  const otp = digits.join('');
  const complete = otp.length === LEN;
  const pending = verify.isPending || firebaseLogin.isPending || fbConfirming || resend.isPending;
  const error =
    fbError ||
    (verify.isError ? (verify.error?.message ?? 'Incorrect OTP. Try again.') : '') ||
    (firebaseLogin.isError ? (firebaseLogin.error?.message ?? 'Login failed. Try again.') : '');
  const loggedIn = !!verify.data || !!firebaseLogin.data;

  // Android auto-verification (instant verification / auto-retrieval) can
  // sign the user in without a manual code — complete our login then.
  useEffect(() => {
    if (!isFirebase) return undefined;
    const fb = getFirebaseAuthModule();
    if (!fb) return undefined;
    const unsub = fb.onAuthStateChanged(fb.getAuth(), async (fbUser) => {
      if (!fbUser) return;
      try {
        const idToken = await fbUser.getIdToken();
        clearPhoneConfirmation();
        firebaseLogin.mutate(idToken, {
          onSuccess: () => router.replace('/(tabs)'),
        });
      } catch (e) {
        setFbError(friendlyFirebaseError(e));
      }
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirebase]);

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

  const completeFirebaseLogin = (idToken) => {
    firebaseLogin.mutate(idToken, {
      onSuccess: () => router.replace('/(tabs)'),
    });
  };

  const submit = () => {
    if (!complete || pending) return;
    if (!isFirebase) {
      verify.mutate(
        { phone: String(phone ?? ''), otp },
        {
          onSuccess: () => router.replace('/(tabs)'),
        },
      );
      return;
    }
    const confirmation = getPhoneConfirmation(String(phone ?? ''));
    if (!confirmation) {
      setFbError('Code expired. Go back and request a new one.');
      return;
    }
    setFbError('');
    setFbConfirming(true);
    confirmation
      .confirm(otp)
      .then((cred) => cred.user.getIdToken())
      .then((idToken) => {
        clearPhoneConfirmation();
        completeFirebaseLogin(idToken);
      })
      .catch((e) => {
        setFbError(friendlyFirebaseError(e));
      })
      .finally(() => {
        setFbConfirming(false);
      });
  };

  const resendCode = () => {
    if (resend.isPending || fbConfirming) return;
    if (!isFirebase) {
      setDigits(Array(LEN).fill(''));
      focusBox(0);
      resend.mutate(String(phone ?? ''));
      return;
    }
    const digitsOnly = String(phone ?? '').replace(/\D/g, '');
    setFbError('');
    const fb = getFirebaseAuthModule();
    if (!fb) {
      // Native module missing (Expo Go) — fall back to server-OTP resend.
      setDigits(Array(LEN).fill(''));
      focusBox(0);
      resend.mutate(String(phone ?? ''));
      return;
    }
    fb.signInWithPhoneNumber(fb.getAuth(), `+91${digitsOnly}`)
      .then((confirmation) => {
        setPhoneConfirmation(confirmation, digitsOnly);
        setDigits(Array(LEN).fill(''));
        focusBox(0);
      })
      .catch((e) => {
        setFbError(friendlyFirebaseError(e));
      });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Brand panel is dark — light status-bar icons stay visible on it. */}
      <StatusBar style="light" />
      <AuthBrandHeader compact />
      <KeyboardAvoidingView
        className="flex-1 px-5 pt-5"
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
      {!!error && (
        <Text className="text-danger mt-3 font-semibold" testID="verify-error">
          {error}
        </Text>
      )}
      {loggedIn && (
        <Text className="text-leaf mt-3 font-bold" testID="login-success">
          Logged in successfully.
        </Text>
      )}
      <TouchableOpacity
        className={`bg-primary rounded-xl p-[15px] items-center mt-5 ${!complete || pending ? 'opacity-50' : ''}`}
        onPress={submit}
        disabled={!complete || pending}
        testID="verify-otp-btn"
      >
        <Text className="text-white font-bold">
          {pending ? 'Verifying…' : 'Verify & Log In'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center mt-3.5"
        onPress={resendCode}
        disabled={pending}
        testID="resend-otp-btn"
      >
        <Text className="text-primary font-bold">
          {resend.isPending ? 'Resending…' : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}
