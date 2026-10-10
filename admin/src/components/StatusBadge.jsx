const COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-green-100 text-green-800',
  DISABLED: 'bg-red-100 text-red-800',
  DRAFT: 'bg-gray-200 text-gray-700',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-700',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        COLORS[status] ?? 'bg-gray-200 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}
