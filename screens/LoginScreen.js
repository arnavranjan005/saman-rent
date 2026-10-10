import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AuthBrandHeader from '../components/AuthBrandHeader';
import {
  friendlyFirebaseError,
  getFirebaseAuthModule,
  isMissingNativeModuleError,
  setPhoneConfirmation,
} from '../lib/phoneAuth';
import { useSendOtp } from '../hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [fbError, setFbError] = useState('');
  const [fbPending, setFbPending] = useState(false);
  // Legacy server-OTP fallback for environments without the Firebase native
  // module (Expo Go). Production builds always take the Firebase path.
  const sendOtp = useSendOtp();

  const pending = fbPending || sendOtp.isPending;
  const error = fbError || (sendOtp.isError ? (sendOtp.error?.message ?? 'Could not send OTP. Try again.') : '');

  const submit = async () => {
    if (pending) return;
    const digits = phone.replace(/\D/g, '');
    setFbError('');
    // Expo Go has no Firebase native module — skip straight to server OTP.
    const fb = getFirebaseAuthModule();
    if (!fb) {
      sendOtp.mutate(digits, {
        onSuccess: () => router.push({ pathname: '/verify-otp', params: { phone: digits } }),
      });
      return;
    }
    setFbPending(true);
    try {
      const confirmation = await fb.signInWithPhoneNumber(fb.getAuth(), `+91${digits}`);
      setPhoneConfirmation(confirmation, digits);
      router.push({ pathname: '/verify-otp', params: { phone: digits, via: 'firebase' } });
    } catch (e) {
      if (isMissingNativeModuleError(e)) {
        setFbPending(false);
        sendOtp.mutate(digits, {
          onSuccess: () => router.push({ pathname: '/verify-otp', params: { phone: digits } }),
        });
        return;
      }
      setFbError(friendlyFirebaseError(e));
    } finally {
      setFbPending(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Brand panel is dark — light status-bar icons stay visible on it. */}
      <StatusBar style="light" />
      <AuthBrandHeader />
      <KeyboardAvoidingView
        className="flex-1 px-5 pt-6"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
      {!!error && (
        <Text className="text-danger mt-2.5 font-semibold" testID="login-error">
          {error}
        </Text>
      )}
      <TouchableOpacity
        className={`bg-primary rounded-xl p-[15px] items-center mt-4 ${pending ? 'opacity-60' : ''}`}
        onPress={submit}
        disabled={pending}
        testID="send-otp-btn"
      >
        <Text className="text-white font-bold">
          {pending ? 'Sending OTP…' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}
