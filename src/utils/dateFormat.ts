// Locale-aware date INPUT formatting. Dates are stored as ISO (YYYY-MM-DD)
// everywhere; only what the user TYPES/READS in a date field is localised:
//   • United States & Canada → MM/DD/YYYY (month first)
//   • United Kingdom & everywhere else → DD/MM/YYYY (day first)
//
// The device locale's region decides (SDK 54 Hermes has full Intl), falling
// back to the user's currency (USD/CAD) and finally to day-first.

function deviceRegion(): string | null {
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale || '';
    const parts = loc.split('-');
    const region = parts[parts.length - 1];
    return /^[A-Za-z]{2}$/.test(region) ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}

export function isMonthFirst(currency?: string | null): boolean {
  const region = deviceRegion();
  if (region === 'US' || region === 'CA') return true;
  if (region) return false; // a known non-US/CA region → day first
  const c = (currency ?? '').toUpperCase();
  return c === 'USD' || c === 'CAD';
}

export function dateInputPlaceholder(currency?: string | null): string {
  return isMonthFirst(currency) ? 'MM/DD/YYYY' : 'DD/MM/YYYY';
}

// ISO 'YYYY-MM-DD' → localised 'DD/MM/YYYY' or 'MM/DD/YYYY' for display in a
// date field. Anything that isn't a clean ISO date is returned unchanged.
export function isoToDateInput(iso: string | null | undefined, currency?: string | null): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((iso ?? '').trim());
  if (!m) return iso ?? '';
  const [, y, mo, d] = m;
  return isMonthFirst(currency) ? `${mo}/${d}/${y}` : `${d}/${mo}/${y}`;
}

// Localised 'DD/MM/YYYY' | 'MM/DD/YYYY' → ISO 'YYYY-MM-DD'. Returns '' until the
// three parts form a valid date, so callers can treat '' as "not yet complete".
export function dateInputToIso(input: string, currency?: string | null): string {
  const parts = (input ?? '').split('/');
  if (parts.length !== 3) return '';
  let d: string, mo: string, y: string;
  if (isMonthFirst(currency)) { mo = parts[0]; d = parts[1]; y = parts[2]; }
  else { d = parts[0]; mo = parts[1]; y = parts[2]; }
  d = d.trim(); mo = mo.trim(); y = y.trim();
  if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(mo) || !/^\d{4}$/.test(y)) return '';
  const dn = Number(d), mn = Number(mo);
  if (dn < 1 || dn > 31 || mn < 1 || mn > 12) return '';
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// Keep only digits and slashes as the user types a date.
export function sanitizeDateInput(text: string): string {
  return text.replace(/[^0-9/]/g, '').slice(0, 10);
}
