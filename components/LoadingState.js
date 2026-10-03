import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../lib/theme';

export default function LoadingState({ testID = 'loading-state' }) {
  return (
    <View className="flex-1 items-center justify-center p-6" testID={testID}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}
