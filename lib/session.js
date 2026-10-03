// Global session-expiry bus. Screens stay dumb: when the API reports a dead
// token (expired/invalid/deleted/disabled — NOT bad credentials), registered
// handlers wipe the stored session so the app falls back to logged-out state.
const handlers = new Set();

export function addSessionExpiredHandler(fn) {
  handlers.add(fn);
  return () => handlers.delete(fn);
}

export function notifySessionExpired() {
  for (const fn of handlers) {
    try {
      fn();
    } catch {
      // Never let session cleanup crash a request path.
    }
  }
}

// Only these codes mean "the stored token is dead — log out".
export function isSessionDead(code) {
  return ['TOKEN_INVALID', 'USER_GONE', 'VENDOR_GONE', 'VENDOR_DISABLED'].includes(code);
}
