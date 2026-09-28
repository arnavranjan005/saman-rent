import React from 'react';
import { Text, View } from 'react-native';

export default function EmptyState({
  message = 'Nothing here yet.',
  testID = 'empty-state',
}) {
  return (
    <View className="flex-1 items-center justify-center p-6" testID={testID}>
      <Text className="text-muted text-center">{message}</Text>
    </View>
  );
}
