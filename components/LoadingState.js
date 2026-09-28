import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../data/mock';

export default function LoadingState({ testID = 'loading-state' }) {
  return (
    <View style={s.wrap} testID={testID}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
