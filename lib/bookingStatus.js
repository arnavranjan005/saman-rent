const POSITIVE = ['CONFIRMED', 'COMPLETED'];

export function statusPillBg(status) {
  if (POSITIVE.includes(status)) return 'bg-[#DCFCE7]';
  if (status === 'PENDING') return 'bg-[#FEF3C7]';
  return 'bg-[#FEE2E2]';
}

export function statusPillText(status) {
  if (POSITIVE.includes(status)) return 'text-leaf';
  if (status === 'PENDING') return 'text-amber';
  return 'text-danger';
}

export function statusPillClass(status) {
  return `text-[11px] font-extrabold px-2.5 py-1 rounded-full overflow-hidden ${statusPillBg(status)} ${statusPillText(status)}`;
}
