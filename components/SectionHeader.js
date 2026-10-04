import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Shared section header: bold title + optional right action (e.g. View All).
 * Same top/bottom rhythm for every list section on every screen.
 */
export default function SectionHeader({ title, actionLabel, onAction, actionTestID, testID }) {
  return (
    <View className="flex-row justify-between items-center mt-5 mb-3" testID={testID}>
      <Text className="font-extrabold text-[15px]">{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction} hitSlop={8} testID={actionTestID}>
          <Text className="text-primary text-xs font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
