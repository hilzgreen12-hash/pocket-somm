// Compare two dotted version strings ("1.5.7" vs "1.4.6"). Returns a negative
// number if a < b, 0 if equal, positive if a > b. Non-numeric parts count as 0,
// and missing trailing parts are treated as 0 ("1.5" === "1.5.0").
export function compareVersions(a: string, b: string): number {
  const pa = String(a ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b ?? '').split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}
