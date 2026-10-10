import { Platform, ToastAndroid } from 'react-native';

/** Fire-and-forget user feedback. Android toast; no-op elsewhere. */
export function notify(message) {
  if (Platform.OS === 'android' && message) {
    ToastAndroid.show(String(message), ToastAndroid.SHORT);
  }
}
