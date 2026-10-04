import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Shared stack-screen header: back chevron + left-aligned title.
 * Keeps header height, spacing and title size identical everywhere.
 */
export default function ScreenHeader({ title, onBack, backTestID, right = null, testID }) {
  return (
    <View
      className="flex-row items-center mt-1 mb-4 min-h-[30px]"
      testID={testID}
    >
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={12} testID={backTestID}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
      ) : null}
      <Text className={`font-extrabold text-lg flex-1 ${onBack ? 'ml-3' : ''}`}>{title}</Text>
      {right}
    </View>
  );
}
