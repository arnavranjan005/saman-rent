// Helpers for the Firebase phone-auth flow.
//
// signInWithPhoneNumber() returns a confirmation object that is not
// serializable, so it cannot travel via router params — it lives here for
// the hop between LoginScreen and VerifyOtpScreen.

let current = null;

export function setPhoneConfirmation(confirmation, phone) {
  current = { confirmation, phone };
}

export function getPhoneConfirmation(phone) {
  if (!current) return null;
  if (phone && current.phone !== phone) return null;
  return current.confirmation;
}

export function clearPhoneConfirmation() {
  current = null;
}

/** True when the Firebase native module is missing (Expo Go / web). */
export function isMissingNativeModuleError(err) {
  return /native module|not installed|not available|not supported|UNAVAILABLE/i.test(String(err?.message ?? err ?? ''));
}

let firebaseAuthModule = null;
let firebaseAuthTried = false;

/**
 * Lazily load `@react-native-firebase/auth`. Returns null where the native
 * module is missing (Expo Go / web).
 *
 * The native check MUST come first: merely evaluating the Firebase JS
 * package throws "Native module NativeRNFBTurboApp is not registered" as
 * an *uncaught* fatal in Expo Go — a JS try/catch around require() does
 * NOT contain it. TurboModuleRegistry.get() is safe (null, never throws),
 * so gate on it and never let the require execute without a native side.
 */
export function getFirebaseAuthModule() {
  if (firebaseAuthTried) return firebaseAuthModule;
  firebaseAuthTried = true;
  try {
    const { TurboModuleRegistry } = require('react-native');
    if (!TurboModuleRegistry?.get?.('NativeRNFBTurboApp')) return firebaseAuthModule;
    firebaseAuthModule = require('@react-native-firebase/auth');
  } catch {
    firebaseAuthModule = null;
  }
  return firebaseAuthModule;
}

export function friendlyFirebaseError(err) {
  const code = err?.code ?? '';
  if (code === 'auth/invalid-phone-number') return 'Enter a valid 10-digit mobile number.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again in a few minutes.';
  if (code === 'auth/network-request-failed')
    return 'Could not reach the server. Check your connection and try again.';
  if (code === 'auth/session-expired') return 'Code expired. Please request a new one.';
  if (code === 'auth/invalid-verification-code') return 'Incorrect OTP. Try again.';
  return err?.message ?? 'Could not send OTP. Try again.';
}
