import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useServices, useSetServiceStatus } from '../hooks/useAdmin';
import { useAuth } from '../lib/auth';

const STATUSES = ['ALL', 'PENDING_APPROVAL', 'ACTIVE', 'DISABLED', 'DRAFT'];

export default function Services() {
  const { handleApiError } = useAuth();
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const query = useServices({ status: status === 'ALL' ? undefined : status, page });
  const mutation = useSetServiceStatus();

  useEffect(() => {
    if (query.error) handleApiError(query.error);
  }, [query.error, handleApiError]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const act = (id, name, next) => {
    if (
      !window.confirm(
        `${next === 'ACTIVE' ? 'Approve (go live)' : 'Disable'} service "${name}"?`,
      )
    )
      return;
    mutation.mutate({ id, status: next });
  };

  const data = query.data;

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-xl font-bold">Services</h1>
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

      {mutation.error && (
        <p className="mb-3 text-sm text-red-600">{mutation.error.message}</p>
      )}

      {query.isLoading && <LoadingState label="Loading services…" />}
      {query.error && (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      )}
      {data && data.items.length === 0 && <EmptyState label="No services found." />}
      {data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Vendor</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {s.vendor.name}{' '}
                    <span className="text-xs text-gray-400">({s.vendor.status})</span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{s.category.name}</td>
                  <td className="px-4 py-2">₹{s.price}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {s.status !== 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => act(s.id, s.name, 'ACTIVE')}
                          className="rounded bg-green-600 px-2.5 py-1 text-xs font-semibold text-white"
                        >
                          Approve
                        </button>
                      )}
                      {s.status !== 'DISABLED' && (
                        <button
                          type="button"
                          onClick={() => act(s.id, s.name, 'DISABLED')}
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
