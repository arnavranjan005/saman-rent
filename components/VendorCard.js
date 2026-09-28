import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, fmt } from '../data/mock';
import { resolveImage } from '../lib/serviceImage';
import SaveHeart from './SaveHeart';

export default function VendorCard({ v, onPress }) {
  return (
    <TouchableOpacity
      className="flex-row bg-white rounded-[14px] p-2.5 mb-3"
      style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 }}
      onPress={onPress}
      testID={`vendor-${v.id}`}
    >
      <Image source={resolveImage(v.img)} className="w-[72px] h-[72px] rounded-xl" />
      <View className="flex-1 ml-2.5 justify-center">
        <Text className="font-bold text-sm">{v.name}</Text>
        <Text className="text-xs text-[#444] mt-0.5">
          <Ionicons name="star" size={12} color="#F59E0B" /> {v.rating} ({v.reviews})
        </Text>
        <Text className="text-[11px] text-muted mt-0.5">{v.location}</Text>
      </View>
      <View className="items-end justify-center">
        <SaveHeart serviceId={v.id} />
        <Text className="text-primary font-extrabold text-[13px] mt-1">{fmt(v.price)}</Text>
        <Text className="text-[10px] text-muted">Onwards</Text>
      </View>
    </TouchableOpacity>
  );
}
