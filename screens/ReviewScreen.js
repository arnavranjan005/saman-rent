import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../lib/theme';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import ScreenHeader from '../components/ScreenHeader';
import { useBooking, useCreateReview } from '../hooks/useBookings';

export default function ReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: b, isPending, isError, error, refetch } = useBooking(id);
  const submit = useCreateReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (isPending) return <LoadingState testID="review-loading" />;
  if (isError || !b) {
    return (
      <ErrorState
        testID="review-error"
        message={error?.message ?? 'Booking not found.'}
        onRetry={() => refetch()}
      />
    );
  }
  if (b.status !== 'COMPLETED') {
    return (
      <View className="flex-1 bg-white p-5">
        <ScreenHeader title="Rate Service" onBack={() => router.back()} backTestID="review-back" />
        <Text className="text-sm text-[#555] mt-2">
          You can rate this service once the booking is completed (current: {b.status}).
        </Text>
      </View>
    );
  }
  if (b.review) {
    return (
      <View className="flex-1 bg-white p-5">
        <ScreenHeader title="Rate Service" onBack={() => router.back()} backTestID="review-back" />
        <Text className="text-sm text-[#555] mt-2">
          You already rated this booking {b.review.rating} out of 5. Thanks!
        </Text>
      </View>
    );
  }

  const send = () => {
    if (!rating || submit.isPending) return;
    submit.mutate(
      { id, payload: { rating, comment: comment.trim() || undefined } },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 24 }}>
        <ScreenHeader title="Rate Service" onBack={() => router.back()} backTestID="review-back" />
        <Text className="font-bold text-base">{b.service.name}</Text>
        <Text className="text-xs text-muted mt-0.5">
          {b.date} · {b.startTime}
        </Text>

        <Text className="font-semibold text-[13px] mt-5 mb-2">How was it?</Text>
        <View className="flex-row" testID="review-stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setRating(s)}
              hitSlop={8}
              testID={`review-star-${s}`}
            >
              <Ionicons
                name={s <= rating ? 'star' : 'star-outline'}
                size={36}
                color={COLORS.orange}
                style={{ marginRight: 6 }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="font-semibold text-[13px] mt-5 mb-1.5">Comment (optional)</Text>
        <TextInput
          className="border border-[#DDD] rounded-[10px] p-3.5 text-base min-h-[90px]"
          placeholder="Tell others what was great…"
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={500}
          textAlignVertical="top"
          testID="review-comment"
        />

        {submit.isError && (
          <Text className="text-danger mt-3 font-semibold" testID="review-submit-error">
            {submit.error?.message ?? 'Could not submit. Try again.'}
          </Text>
        )}
        <TouchableOpacity
          className={`bg-primary rounded-xl p-[15px] items-center mt-5 ${!rating || submit.isPending ? 'opacity-60' : ''}`}
          onPress={send}
          disabled={!rating || submit.isPending}
          testID="review-submit-btn"
        >
          <Text className="text-white font-bold">
            {submit.isPending ? 'Submitting…' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
