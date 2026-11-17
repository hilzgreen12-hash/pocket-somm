// "17 Nov 2026" from a yyyy-mm-dd date or an ISO timestamp ('' when missing).
export function fmtDay(d: string | null | undefined): string {
  if (!d) return '';
  const dt = new Date(d.length === 10 ? `${d}T00:00:00` : d);
  return Number.isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function bottlesLabel(n: number): string {
  return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}
