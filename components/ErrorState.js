import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../data/mock';

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  testID = 'error-state',
}) {
  return (
    <View style={s.wrap} testID={testID}>
      <Text style={s.msg}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={s.btn} onPress={onRetry} testID="error-retry-btn">
          <Text style={s.btnT}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  msg: { color: COLORS.red, textAlign: 'center', marginBottom: 12 },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnT: { color: '#fff', fontWeight: '700' },
});
