import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useBookings } from '../hooks/useAdmin';
import { useAuth } from '../lib/auth';

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

export default function Bookings() {
  const { handleApiError } = useAuth();
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const query = useBookings({ status: status === 'ALL' ? undefined : status, page });

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error, handleApiError]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const data = query.data;

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold">Bookings</h1>
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
      </div>

      {query.isLoading && <LoadingState label="Loading bookings…" />}
      {query.error && (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      )}
      {data && data.items.length === 0 && <EmptyState label="No bookings found." />}
      {data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">
                    {b.date} {b.startTime}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {b.customer.name ?? b.customer.phone}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {b.service.name}{' '}
                    <span className="text-xs text-gray-400">({b.service.vendor.name})</span>
                  </td>
                  <td className="px-4 py-2">₹{b.total}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={b.status} />
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
