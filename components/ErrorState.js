import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  testID = 'error-state',
}) {
  return (
    <View className="flex-1 items-center justify-center p-6" testID={testID}>
      <Text className="text-danger text-center mb-3">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          className="bg-primary rounded-[10px] px-5 py-2.5"
          onPress={onRetry}
          testID="error-retry-btn"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
