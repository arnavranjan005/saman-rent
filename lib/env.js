// Central environment configuration for the Expo app.
// Set EXPO_PUBLIC_API_URL in `.env` (see `.env.example`).
// Falls back to the dev machine's LAN IP so a physical device over
// Expo Go can reach the local Express API without code changes.

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.241.140:3001/api/v1';

export const API_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 10000,
);
