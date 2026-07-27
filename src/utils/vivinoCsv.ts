import * as XLSX from 'xlsx';
import type { ImportedCellarWine } from '../api/label';

// Parse a Vivino "export your cellar" CSV into cellar wines (and, for the later
// reviews-import feature, the user's rating + tasting note per row).
//
// Vivino's exact header names have shifted over the years and vary by locale, so
// columns are matched by SYNONYM rather than a fixed schema — this keeps working
// across export variants and is trivial to extend when we see a new header.

// Repair UTF-8-read-as-Latin-1 mojibake (e.g. "Château" → "ChÃ¢teau"). This
// happens when the spreadsheet reader (SheetJS) runs on Hermes without a Buffer
// to decode UTF-8, so accented cells come back as their raw bytes. We only touch
// strings carrying the tell-tale byte signature (a UTF-8 lead byte followed by a
// continuation byte, 0x80–0xBF) and re-decode those bytes as UTF-8 — correctly
// decoded text never matches the signature, so this is a safe no-op there.
const MOJIBAKE_SIGNATURE = /[\xC2-\xF4][\x80-\xBF]/;
function fixMojibake(s: string): string {
  if (!s || !MOJIBAKE_SIGNATURE.test(s)) return s;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const c = s.charCodeAt(i) & 0xff;
    if (c < 0x80) { out += s[i]; i += 1; continue; }
    const d = s.charCodeAt(i + 1) & 0xff;
    if (c >= 0xc2 && c < 0xe0 && d >= 0x80 && d < 0xc0) {
      out += String.fromCharCode(((c & 0x1f) << 6) | (d & 0x3f)); i += 2; continue;
    }
    const e = s.charCodeAt(i + 2) & 0xff;
    if (c >= 0xe0 && c < 0xf0 && d >= 0x80 && d < 0xc0 && e >= 0x80 && e < 0xc0) {
      out += String.fromCharCode(((c & 0x0f) << 12) | ((d & 0x3f) << 6) | (e & 0x3f)); i += 3; continue;
    }
    const f = s.charCodeAt(i + 3) & 0xff;
    if (c >= 0xf0 && d >= 0x80 && d < 0xc0 && e >= 0x80 && e < 0xc0 && f >= 0x80 && f < 0xc0) {
      const w = (((c & 0x07) << 18) | ((d & 0x3f) << 12) | ((e & 0x3f) << 6) | (f & 0x3f)) - 0x10000;
      out += String.fromCharCode(0xd800 + ((w >>> 10) & 0x3ff), 0xdc00 + (w & 0x3ff)); i += 4; continue;
    }
    out += s[i]; i += 1; // not a valid sequence — leave as-is
  }
  return out;
}

// Sniff the field delimiter from the header line so we handle comma-CSV,
// tab-delimited (CellarTracker "text" export, Excel "Save As Tab"), and the
// semicolon CSVs some locales produce — whichever appears most, outside quotes.
function detectDelimiter(text: string): string {
  const firstLine = text.replace(/^﻿/, '').split(/\r?\n/)[0] ?? '';
  const counts: Record<string, number> = { '\t': 0, ';': 0, ',': 0 };
  let inQuotes = false;
  for (const c of firstLine) {
    if (c === '"') inQuotes = !inQuotes;
    else if (!inQuotes && c in counts) counts[c]++;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : ',';
}

// RFC-4180-ish CSV: quoted fields, doubled quotes ("" → "), CRLF or LF breaks.
// Delimiter is auto-detected (comma / tab / semicolon).
function parseCsv(text: string): string[][] {
  const delim = detectDelimiter(text);
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
    } else if (c === delim) {
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
  // "User cellar count" is Vivino's own bottle count. Specific phrases lead so
  // they win the exact-match pass before the bare-'count' substring fallback.
  quantity: ['user cellar count', 'cellar count', 'bottles in cellar', 'count', 'quantity', 'qty', 'bottles', 'number of bottles', 'bottle count', 'inventory'],
  price: ['price paid', 'purchase price', 'price', 'bottle price', 'cost'],
  currency: ['currency'],
  rating: ['your rating', 'my rating', 'rating', 'score', 'personal rating'],
  note: ['your review', 'tasting note', 'personal note', 'note', 'notes', 'review', 'comment'],
} as const;

// Community-stat columns that must never be mistaken for a per-user bottle count
// or the user's own rating — e.g. Vivino's "Average rating" and "Wine ratings
// count" both contain substrings our synonyms would otherwise grab.
const QTY_EXCLUDE = /average|rating|review/;
const RATING_EXCLUDE = /average|count/;

function findCol(header: string[], synonyms: readonly string[], exclude?: RegExp): number {
  const norm = header.map((h) => h.trim().toLowerCase());
  const ok = (i: number) => !exclude || !exclude.test(norm[i]);
  for (const syn of synonyms) { const i = norm.indexOf(syn); if (i >= 0 && ok(i)) return i; }
  // Fall back to a substring match ("Your rating (1-5)", "Price paid (GBP)"…).
  for (let i = 0; i < norm.length; i++) {
    if (ok(i) && synonyms.some((syn) => norm[i].includes(syn))) return i;
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

// Named for Vivino historically, but the synonym-based matching is format-
// agnostic — it also handles CellarTracker and generic cellar CSV exports.
export function parseCellarCsv(text: string): VivinoParseResult {
  return parseCellarRows(parseCsv(text));
}

// Parse an Excel / OpenDocument spreadsheet (.xlsx, .xls, .ods) supplied as
// base64. Excel files are binary (a zipped bundle of XML), so they can't be read
// as text like a CSV — SheetJS decodes the workbook into rows, which then go
// through the exact same synonym-based column matching as a CSV. Uses the first
// sheet that has a header + at least one data row.
export function parseCellarSpreadsheet(base64: string): VivinoParseResult {
  const wb = XLSX.read(base64, { type: 'base64' });
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    // header:1 → array-of-arrays; raw:false formats dates/numbers as display
    // strings so vintages and quantities read like they do in a CSV export.
    const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '', blankrows: false });
    const rows = raw
      .map((r) => (Array.isArray(r) ? r.map((c) => (c == null ? '' : String(c))) : []))
      .filter((r) => r.some((c) => c.trim() !== ''));
    if (rows.length >= 2) return parseCellarRows(rows);
  }
  return { wines: [], reviews: [], rowCount: 0, matchedColumns: [] };
}

// Map already-parsed rows (from a CSV or a spreadsheet) onto cellar wines. The
// first row is the header; columns are matched by synonym so the same logic
// serves every source and format.
export function parseCellarRows(rawRows: string[][]): VivinoParseResult {
  // Repair any UTF-8-as-Latin-1 mojibake up front so headers match and names
  // store correctly. No-op on already-correct text.
  const rows = rawRows.map((r) => r.map(fixMojibake));
  if (rows.length < 2) return { wines: [], reviews: [], rowCount: 0, matchedColumns: [] };
  const header = rows[0];
  const col = {
    producer: findCol(header, SYNONYMS.producer),
    wine: findCol(header, SYNONYMS.wine),
    vintage: findCol(header, SYNONYMS.vintage),
    region: findCol(header, SYNONYMS.region),
    quantity: findCol(header, SYNONYMS.quantity, QTY_EXCLUDE),
    price: findCol(header, SYNONYMS.price),
    currency: findCol(header, SYNONYMS.currency),
    rating: findCol(header, SYNONYMS.rating, RATING_EXCLUDE),
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
