import * as XLSX from 'xlsx';
import { fixMojibake, parseCsv } from './vivinoCsv';

// Turn a picked cellar document into one or more sheets of clean, tab-separated
// text ready for the parse-cellar-import engine. This is the deterministic half
// of the import: it fixes the encodings we've actually seen in real exports
// (Excel mojibake, UTF-16 CellarTracker, UTF-8 BOM Berry Bros) and splits a
// multi-sheet workbook into separate lists, so the intelligent parser only ever
// sees clean rows.

export interface ImportSheet {
  name: string;       // sheet name (workbook) or file name (single CSV)
  rows: string[][];   // clean rows (empty rows dropped) for deterministic profiles
  tsv: string;        // same rows as tab/newline text for the Claude fallback
  rowCount: number;
}

// Decode raw file bytes to a JS string, honouring a byte-order mark. Hermes has
// no dependable TextDecoder, so UTF-16 and UTF-8 are decoded by hand.
function decodeText(bytes: Uint8Array): string {
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return utf16(bytes, 2, true);
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return utf16(bytes, 2, false);
  const start = bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf ? 3 : 0;
  // No BOM: distinguish UTF-8 from Latin-1/Windows-1252 (some merchant CSVs,
  // e.g. Nexus, are Latin-1). A file that isn't valid UTF-8 is decoded as
  // Latin-1 so accents survive rather than being mangled by the UTF-8 reader.
  return isLikelyUtf8(bytes, start) ? utf8(bytes, start) : latin1(bytes, start);
}

// Validate that the bytes form well-formed UTF-8 (every lead byte followed by
// the right number of 0x80–0xBF continuation bytes).
function isLikelyUtf8(b: Uint8Array, offset: number): boolean {
  let i = offset;
  while (i < b.length) {
    const c = b[i];
    if (c < 0x80) { i += 1; continue; }
    const n = c >= 0xf0 ? 3 : c >= 0xe0 ? 2 : c >= 0xc2 ? 1 : -1;
    if (n < 0) return false;
    for (let k = 1; k <= n; k++) { if (i + k >= b.length || (b[i + k] & 0xc0) !== 0x80) return false; }
    i += n + 1;
  }
  return true;
}

function latin1(b: Uint8Array, offset: number): string {
  let out = '';
  for (let i = offset; i < b.length; i++) out += String.fromCharCode(b[i]);
  return out;
}

function utf16(b: Uint8Array, offset: number, littleEndian: boolean): string {
  let out = '';
  for (let i = offset; i + 1 < b.length; i += 2) {
    out += String.fromCharCode(littleEndian ? b[i] | (b[i + 1] << 8) : (b[i] << 8) | b[i + 1]);
  }
  return out;
}

function utf8(b: Uint8Array, offset: number): string {
  let out = '';
  let i = offset;
  while (i < b.length) {
    const c = b[i];
    if (c < 0x80) { out += String.fromCharCode(c); i += 1; continue; }
    if (c >= 0xc2 && c < 0xe0 && i + 1 < b.length) {
      out += String.fromCharCode(((c & 0x1f) << 6) | (b[i + 1] & 0x3f)); i += 2; continue;
    }
    if (c >= 0xe0 && c < 0xf0 && i + 2 < b.length) {
      out += String.fromCharCode(((c & 0x0f) << 12) | ((b[i + 1] & 0x3f) << 6) | (b[i + 2] & 0x3f)); i += 3; continue;
    }
    if (c >= 0xf0 && i + 3 < b.length) {
      const w = (((c & 0x07) << 18) | ((b[i + 1] & 0x3f) << 12) | ((b[i + 2] & 0x3f) << 6) | (b[i + 3] & 0x3f)) - 0x10000;
      out += String.fromCharCode(0xd800 + ((w >>> 10) & 0x3ff), 0xdc00 + (w & 0x3ff)); i += 4; continue;
    }
    out += String.fromCharCode(c); i += 1; // lone byte — keep it
  }
  return out;
}

// Rows → TSV. Cells are trimmed and any embedded tabs/newlines flattened so a
// row stays one line (the parser reads one row per line).
function toTsv(rows: string[][]): string {
  return rows
    .map((r) => r.map((c) => (c ?? '').replace(/[\t\r\n]+/g, ' ').trim()).join('\t'))
    .join('\n');
}

function nonEmpty(rows: string[][]): string[][] {
  return rows.map((r) => (Array.isArray(r) ? r.map(fixMojibake) : [])).filter((r) => r.some((c) => c.trim() !== ''));
}

export function fileToSheets(bytes: Uint8Array, fileName: string, base64?: string): ImportSheet[] {
  const name = (fileName || '').toLowerCase();
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // PK — xlsx/ods
  const isCfb = bytes[0] === 0xd0 && bytes[1] === 0xcf; // xls
  const looksSpreadsheet = /\.(xlsx|xls|ods)$/.test(name) || isZip || isCfb;

  if (looksSpreadsheet) {
    // SheetJS MUST be fed base64 here. metro.config.js maps xlsx's Node
    // `stream`/`fs` requires to empty modules on the strength of "we only ever
    // hand XLSX base64" — the `type: 'array'` read path reaches into those now-
    // empty stubs and throws at runtime (Excel imports silently failing while
    // CSVs worked). base64 comes from the Expo File API at the call site; the
    // array fall-back only covers a legacy caller that didn't pass it.
    const wb = base64 != null
      ? XLSX.read(base64, { type: 'base64' })
      : XLSX.read(bytes, { type: 'array' });
    return wb.SheetNames
      .map((sn) => {
        const sheet = wb.Sheets[sn];
        if (!sheet) return null;
        const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '', blankrows: false });
        const rows = nonEmpty(raw.map((r) => (Array.isArray(r) ? r.map((c) => (c == null ? '' : String(c))) : [])));
        return rows.length ? { name: sn, rows, tsv: toTsv(rows), rowCount: rows.length } : null;
      })
      .filter((s): s is ImportSheet => s !== null);
  }

  // CSV / TSV / plain text — decode by encoding, parse with the shared
  // delimiter-sniffing reader, then re-serialize to clean TSV.
  const rows = nonEmpty(parseCsv(decodeText(bytes)));
  return rows.length ? [{ name: fileName || 'File', rows, tsv: toTsv(rows), rowCount: rows.length }] : [];
}
