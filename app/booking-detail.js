import { useLocalSearchParams } from 'expo-router';
import BookingDetailScreen from '../screens/BookingDetailScreen';

export default function BookingDetailRoute() {
  const { id } = useLocalSearchParams();
  // Key by booking id so navigating booking A -> back -> booking B
  // always mounts fresh — no stale detail state.
  return <BookingDetailScreen key={`booking-detail-${id}`} />;
}
