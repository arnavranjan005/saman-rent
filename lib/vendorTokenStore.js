import * as SecureStore from 'expo-secure-store';

const VENDOR_TOKEN_KEY = 'samanrent.vendorToken';

export async function getVendorToken() {
  try {
    return await SecureStore.getItemAsync(VENDOR_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setVendorToken(token) {
  if (!token) return clearVendorToken();
  await SecureStore.setItemAsync(VENDOR_TOKEN_KEY, token);
}

export async function clearVendorToken() {
  try {
    await SecureStore.deleteItemAsync(VENDOR_TOKEN_KEY);
  } catch {
    // Already empty — nothing to do.
  }
}
