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
import { COLORS } from '../data/mock';
import { useVendorLogin } from '../hooks/useVendor';

export default function VendorLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useVendorLogin();

  const submit = () => {
    login.mutate(
      { email: email.trim(), password },
      { onSuccess: () => router.replace('/(vendor)') },
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white p-5 justify-center"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="w-[72px] h-[72px] rounded-full bg-[#F6F5FF] items-center justify-center mb-4">
        <Ionicons name="storefront-outline" size={40} color={COLORS.primary} />
      </View>
      <Text className="font-extrabold text-[22px]">Vendor Login</Text>
      <Text className="text-[#666] text-[13px] mt-1.5">
        Manage your services and bookings.
      </Text>
      <Text className="font-semibold text-[13px] mt-5 mb-1.5">Email</Text>
      <TextInput
        className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
        placeholder="you@business.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        testID="vendor-email-input"
      />
      <Text className="font-semibold text-[13px] mt-3 mb-1.5">Password</Text>
      <TextInput
        className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
        placeholder="Your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        testID="vendor-password-input"
      />
      {login.isError && (
        <Text className="text-danger mt-2.5 font-semibold" testID="vendor-login-error">
          {login.error?.message ?? 'Could not log in. Try again.'}
        </Text>
      )}
      <TouchableOpacity
        className={`bg-primary rounded-xl p-[15px] items-center mt-4 ${login.isPending ? 'opacity-60' : ''}`}
        onPress={submit}
        disabled={login.isPending}
        testID="vendor-login-btn"
      >
        <Text className="text-white font-bold">
          {login.isPending ? 'Logging in…' : 'Log In as Vendor'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="items-center mt-4"
        onPress={() => router.push('/vendor-register')}
        testID="vendor-go-register-btn"
      >
        <Text className="text-primary font-bold">New here? Register your business</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
