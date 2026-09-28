import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../data/mock';

export default function EmptyState({
  message = 'Nothing here yet.',
  testID = 'empty-state',
}) {
  return (
    <View style={s.wrap} testID={testID}>
      <Text style={s.msg}>{message}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  msg: { color: COLORS.grey, textAlign: 'center' },
});
