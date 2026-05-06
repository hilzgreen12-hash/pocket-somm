export interface Currency {
  code: string;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£',  label: 'British Pound (£)' },
  { code: 'USD', symbol: '$',  label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€',  label: 'Euro (€)' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { code: 'NZD', symbol: 'NZ$',label: 'New Zealand Dollar (NZ$)' },
  { code: 'JPY', symbol: '¥',  label: 'Japanese Yen (¥)' },
  { code: 'CHF', symbol: 'Fr', label: 'Swiss Franc (Fr)' },
  { code: 'HKD', symbol: 'HK$',label: 'Hong Kong Dollar (HK$)' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar (S$)' },
];

export const DEFAULT_CURRENCY = 'GBP';

// ISO 3166-1 alpha-2 country code → currency code.
// Covers all currencies in CURRENCIES plus the eurozone. Anything not listed
// falls back to the user's profile currency (no auto-prompt fired).
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  GB: 'GBP',
  US: 'USD',
  AU: 'AUD',
  CA: 'CAD',
  NZ: 'NZD',
  JP: 'JPY',
  CH: 'CHF', LI: 'CHF',
  HK: 'HKD',
  SG: 'SGD',
  // Eurozone members
  AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR',
  FR: 'EUR', DE: 'EUR', GR: 'EUR', IE: 'EUR', IT: 'EUR',
  LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR',
  PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR', HR: 'EUR',
  AD: 'EUR', MC: 'EUR', SM: 'EUR', VA: 'EUR',
};

export function currencySymbol(code: string | null | undefined): string {
  const c = CURRENCIES.find((x) => x.code === (code ?? DEFAULT_CURRENCY).toUpperCase());
  return c?.symbol ?? '£';
}

export function formatCurrency(amount: number | null | undefined, code: string | null | undefined, opts: { decimals?: 0 | 2 } = {}): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  const decimals = opts.decimals ?? 2;
  const sym = currencySymbol(code);
  const fixed = decimals === 0 ? Math.round(amount).toLocaleString('en-GB') : Number(amount).toFixed(2);
  return `${sym}${fixed}`;
}
