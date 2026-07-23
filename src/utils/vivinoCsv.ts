import type { ImportedCellarWine } from '../api/label';

// Parse a Vivino "export your cellar" CSV into cellar wines (and, for the later
// reviews-import feature, the user's rating + tasting note per row).
//
// Vivino's exact header names have shifted over the years and vary by locale, so
// columns are matched by SYNONYM rather than a fixed schema — this keeps working
// across export variants and is trivial to extend when we see a new header.

// RFC-4180-ish CSV: quoted fields, doubled quotes ("" → "), CRLF or LF breaks.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, ''); // strip a leading BOM
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false;
      } else cell += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cell); cell = '';
    } else if (c === '\n') {
      row.push(cell); rows.push(row); row = []; cell = '';
    } else if (c !== '\r') {
      cell += c;
    }
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const SYNONYMS = {
  producer: ['winery', 'producer', 'domaine', 'estate', 'wine maker', 'winemaker'],
  wine: ['wine name', 'wine', 'name', 'full name', 'wine full name', 'label'],
  vintage: ['vintage', 'year'],
  region: ['region', 'appellation', 'sub-region', 'subregion', 'area'],
  quantity: ['count', 'quantity', 'qty', 'bottles', 'number of bottles', 'bottle count', 'inventory'],
  price: ['price paid', 'purchase price', 'price', 'bottle price', 'cost'],
  currency: ['currency'],
  rating: ['your rating', 'my rating', 'rating', 'score', 'personal rating'],
  note: ['your review', 'tasting note', 'personal note', 'note', 'notes', 'review', 'comment'],
} as const;

function findCol(header: string[], synonyms: readonly string[]): number {
  const norm = header.map((h) => h.trim().toLowerCase());
  for (const syn of synonyms) { const i = norm.indexOf(syn); if (i >= 0) return i; }
  // Fall back to a substring match ("Your rating (1-5)", "Price paid (GBP)"…).
  for (let i = 0; i < norm.length; i++) {
    if (synonyms.some((syn) => norm[i].includes(syn))) return i;
  }
  return -1;
}

export interface VivinoReviewRow {
  producer: string;
  wineName: string;
  vintage: string | null;
  rating: number | null; // Vivino stars (typically 1–5)
  note: string | null;
}

export interface VivinoParseResult {
  wines: ImportedCellarWine[];
  reviews: VivinoReviewRow[]; // parsed now, applied by the later reviews-import
  rowCount: number;
  matchedColumns: string[]; // which fields we recognised in the header
}

export function parseVivinoCsv(text: string): VivinoParseResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { wines: [], reviews: [], rowCount: 0, matchedColumns: [] };
  const header = rows[0];
  const col = {
    producer: findCol(header, SYNONYMS.producer),
    wine: findCol(header, SYNONYMS.wine),
    vintage: findCol(header, SYNONYMS.vintage),
    region: findCol(header, SYNONYMS.region),
    quantity: findCol(header, SYNONYMS.quantity),
    price: findCol(header, SYNONYMS.price),
    currency: findCol(header, SYNONYMS.currency),
    rating: findCol(header, SYNONYMS.rating),
    note: findCol(header, SYNONYMS.note),
  };
  const cell = (r: string[], i: number) => (i >= 0 && i < r.length ? (r[i] ?? '').trim() : '');

  const wines: ImportedCellarWine[] = [];
  const reviews: VivinoReviewRow[] = [];
  for (let ri = 1; ri < rows.length; ri++) {
    const r = rows[ri];
    const producer = cell(r, col.producer);
    const wineName = cell(r, col.wine) || producer;
    if (!producer && !wineName) continue;

    const vintageRaw = cell(r, col.vintage);
    const vintage = vintageRaw ? vintageRaw.replace(/[^0-9A-Za-z]/g, '') || null : null;
    const qty = parseInt(cell(r, col.quantity).replace(/[^0-9]/g, ''), 10);
    const priceRaw = cell(r, col.price).replace(/[^0-9.]/g, '');
    const price = priceRaw ? parseFloat(priceRaw) : NaN;
    const ratingRaw = cell(r, col.rating).replace(/[^0-9.]/g, '');
    const rating = ratingRaw ? parseFloat(ratingRaw) : NaN;

    wines.push({
      producer,
      wine_name: wineName,
      region: cell(r, col.region),
      vintage,
      quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
      bottle_size_ml: 750,
      purchase_price: Number.isFinite(price) ? price : null,
      currency: cell(r, col.currency) || null,
    });
    reviews.push({
      producer,
      wineName,
      vintage,
      rating: Number.isFinite(rating) ? rating : null,
      note: cell(r, col.note) || null,
    });
  }

  const matchedColumns = Object.entries(col).filter(([, i]) => i >= 0).map(([k]) => k);
  return { wines, reviews, rowCount: rows.length - 1, matchedColumns };
}
