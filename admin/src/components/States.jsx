export function LoadingState({ label = 'Loading…' }) {
  return <div className="rounded bg-white p-8 text-center text-sm text-gray-500">{label}</div>;
}

export function EmptyState({ label = 'No rows found.' }) {
  return <div className="rounded bg-white p-8 text-center text-sm text-gray-500">{label}</div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">{message ?? 'Something went wrong.'}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded border border-red-300 bg-white px-3 py-1 text-sm text-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}
