// Typed API client for the Phase 10 admin dashboard.
// Mirrors mobile api/client.js: unwraps the { success, data } envelope and
// throws { code, message } errors from { success: false, error }.
const BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3001/api/v1';

const TOKEN_KEY = 'samanrent_admin_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok || payload?.success === false) {
      const err = new Error(payload?.error?.message ?? `Request failed (${res.status})`);
      err.code = payload?.error?.code ?? `HTTP_${res.status}`;
      err.status = res.status;
      throw err;
    }
    return payload?.data ?? payload;
  } catch (err) {
    if (err?.name === 'AbortError') {
      const timeout = new Error('Request timed out. Check the API server and retry.');
      timeout.code = 'TIMEOUT';
      throw timeout;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Any of these means the stored admin session is dead or not an admin.
export function isSessionDead(code) {
  return ['TOKEN_INVALID', 'ADMIN_GONE', 'NOT_AN_ADMIN', 'ADMIN_UNAUTHORIZED'].includes(code);
}

export const adminLogin = (email, password) =>
  api('/admin/auth/login', { method: 'POST', body: { email, password }, auth: false });

export const fetchAdminMe = () => api('/admin/auth/me');

export const fetchVendors = (params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')),
  ).toString();
  return api(`/admin/vendors${q ? `?${q}` : ''}`);
};

export const setVendorStatus = (id, status) =>
  api(`/admin/vendors/${id}/status`, { method: 'PATCH', body: { status } });

export const fetchServices = (params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')),
  ).toString();
  return api(`/admin/services${q ? `?${q}` : ''}`);
};

export const setServiceStatus = (id, status) =>
  api(`/admin/services/${id}/status`, { method: 'PATCH', body: { status } });

export const fetchBookings = (params = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')),
  ).toString();
  return api(`/admin/bookings${q ? `?${q}` : ''}`);
};
