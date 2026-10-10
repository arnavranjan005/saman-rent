import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useSetVendorStatus, useVendors } from '../hooks/useAdmin';
import { useAuth } from '../lib/auth';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'DISABLED'];

function useDebounced(value, ms) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function Vendors() {
  const { handleApiError } = useAuth();
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search, 400);

  const query = useVendors({
    status: status === 'ALL' ? undefined : status,
    search: debouncedSearch || undefined,
    page,
  });
  const mutation = useSetVendorStatus();

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error, handleApiError]);

  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const act = (id, name, next) => {
    if (!window.confirm(`${next === 'APPROVED' ? 'Approve' : 'Disable'} vendor "${name}"?`)) return;
    mutation.mutate({ id, status: next });
  };

  const data = query.data;

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold">Vendors</h1>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded px-3 py-1 text-sm font-medium ${
              status === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
        <input
          type="search"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded border border-gray-300 bg-white px-3 py-1 text-sm"
        />
      </div>

      {mutation.error && (
        <p className="mb-3 text-sm text-red-600">{mutation.error.message}</p>
      )}

      {query.isLoading && <LoadingState label="Loading vendors…" />}
      {query.error && (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      )}
      {data && data.items.length === 0 && <EmptyState label="No vendors found." />}
      {data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Services</th>
                <th className="px-4 py-2">Bookings</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 font-medium">{v.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {v.email ?? '—'}
                    <br />
                    <span className="text-xs">{v.phone ?? ''}</span>
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-2">{v.serviceCount}</td>
                  <td className="px-4 py-2">{v.bookingCount}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {v.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => act(v.id, v.name, 'APPROVED')}
                          className="rounded bg-green-600 px-2.5 py-1 text-xs font-semibold text-white"
                        >
                          Approve
                        </button>
                      )}
                      {v.status !== 'DISABLED' && (
                        <button
                          type="button"
                          onClick={() => act(v.id, v.name, 'DISABLED')}
                          className="rounded bg-red-600 px-2.5 py-1 text-xs font-semibold text-white"
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </Layout>
  );
}
