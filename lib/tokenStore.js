import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'samanrent.authToken';

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token) {
  if (!token) return clearToken();
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Already empty — nothing to do.
  }
}
