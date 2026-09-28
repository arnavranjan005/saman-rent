import { API_BASE_URL, API_TIMEOUT_MS } from '../lib/env';
import { getToken } from '../lib/tokenStore';

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(
  path,
  { method = 'GET', body, auth = true, timeout = API_TIMEOUT_MS } = {},
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = await getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError(
        res.status,
        payload?.error?.code ?? 'REQUEST_FAILED',
        payload?.error?.message ?? `Request failed (${res.status})`,
      );
    }
    // Backend envelope is `{ success, data }`; tolerate bare bodies too.
    return payload?.data ?? payload;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError(
        0,
        'TIMEOUT',
        'Request timed out. Check your connection and try again.',
      );
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Could not reach the server. Check your connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};
