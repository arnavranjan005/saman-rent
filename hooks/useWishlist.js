import { useCallback, useState } from 'react';
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from '../api/wishlist';
import { notify } from '../lib/notify';

export const wishlistKeys = {
  list: ['wishlist'],
};

export function useWishlist(enabled = true) {
  return useQuery({ queryKey: wishlistKeys.list, queryFn: fetchWishlist, enabled });
}

/**
 * Instagram-style toggle: EVERY tap flips the UI instantly; only the network
 * is debounced. A burst of taps sends a single request with the final state
 * (taps that cancel out send nothing). Failures roll back to the last
 * server-confirmed state and always end with a refetch, so cache and server
 * converge no matter the order responses arrive in.
 */
const SYNC_DELAY_MS = 350;

// serviceId -> { timer, snapshot, seq, done[] } for the in-progress burst.
const pending = new Map();

function cachedSaved(queryClient, serviceId) {
  const list = queryClient.getQueryData(wishlistKeys.list);
  return Array.isArray(list) && list.some((s) => s?.id === serviceId);
}

function flush(queryClient, serviceId) {
  const entry = pending.get(serviceId);
  if (!entry) return;
  pending.delete(serviceId);
  const desired = cachedSaved(queryClient, serviceId);
  const base = Array.isArray(entry.snapshot)
    && entry.snapshot.some((s) => s?.id === serviceId);
  const finish = () => entry.done.forEach((d) => d());
  if (desired === base) {
    finish();
    return;
  }
  const request = desired
    ? addToWishlist(serviceId)
    : removeFromWishlist(serviceId);
  request.then(
    () => {
      notify(desired ? 'Saved to wishlist' : 'Removed from wishlist');
      finish();
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list });
    },
    () => {
      queryClient.setQueryData(wishlistKeys.list, entry.snapshot);
      notify("Couldn't update wishlist. Try again.");
      finish();
      queryClient.invalidateQueries({ queryKey: wishlistKeys.list });
    },
  );
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const [isSyncing, setSyncing] = useState(false);

  const toggle = useCallback((serviceId) => {
    queryClient.cancelQueries({ queryKey: wishlistKeys.list });
    let entry = pending.get(serviceId);
    if (!entry) {
      entry = {
        timer: null,
        snapshot: queryClient.getQueryData(wishlistKeys.list),
        seq: 0,
        done: [],
      };
      pending.set(serviceId, entry);
    }
    entry.seq += 1;
    // Instant flip — every tap counts, nothing is blocked.
    const saved = cachedSaved(queryClient, serviceId);
    queryClient.setQueryData(wishlistKeys.list, (old) => {
      const list = Array.isArray(old) ? old : [];
      return saved
        ? list.filter((s) => s?.id !== serviceId)
        : [...list, { id: serviceId }];
    });
    clearTimeout(entry.timer);
    setSyncing(true);
    entry.done.push(() => setSyncing(false));
    entry.timer = setTimeout(() => flush(queryClient, serviceId), SYNC_DELAY_MS);
  }, [queryClient]);

  return { toggle, isSyncing };
}
