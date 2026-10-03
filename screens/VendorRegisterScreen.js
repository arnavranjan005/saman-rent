import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import { useVendorRegister } from '../hooks/useVendor';

export default function VendorRegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const register = useVendorRegister();

  const submit = () => {
    register.mutate(
      {
        name,
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      },
      { onSuccess: () => router.replace('/(vendor)') },
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} testID="vendor-register-back">
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text className="font-extrabold text-[22px] mt-4">Register your business</Text>
        <Text className="text-[#666] text-[13px] mt-1.5">
          New vendors start as PENDING until approved.
        </Text>
        <Text className="font-semibold text-[13px] mt-5 mb-1.5">Business Name</Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
          placeholder="Royal DJ Sound"
          value={name}
          onChangeText={setName}
          testID="vendor-name-input"
        />
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">Email</Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
          placeholder="you@business.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          testID="vendor-reg-email-input"
        />
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">Phone (Optional)</Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
          placeholder="10-digit mobile number"
          keyboardType="number-pad"
          value={phone}
          onChangeText={setPhone}
          testID="vendor-phone-input"
        />
        <Text className="font-semibold text-[13px] mt-3 mb-1.5">Password (min 8 chars)</Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3.5 text-base"
          placeholder="Choose a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          testID="vendor-reg-password-input"
        />
        {register.isError && (
          <Text className="text-danger mt-2.5 font-semibold" testID="vendor-register-error">
            {register.error?.message ?? 'Could not register. Try again.'}
          </Text>
        )}
        <TouchableOpacity
          className={`bg-primary rounded-xl p-[15px] items-center mt-4 ${register.isPending ? 'opacity-60' : ''}`}
          onPress={submit}
          disabled={register.isPending}
          testID="vendor-register-btn"
        >
          <Text className="text-white font-bold">
            {register.isPending ? 'Registering…' : 'Register Business'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
