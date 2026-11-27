import { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { invalidateCellarViews } from '../../src/hooks/useCellar';
import { importCellarDocument, prepareImageBase64, parseCellarImport, parseCellarPdf, type ImportedCellarWine, type CellarImportWine, type CellarListRead } from '../../src/api/label';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { fileToSheets, sheetChunks, type ImportSheet } from '../../src/utils/cellarImportDecode';
import { cuveeName, parseKnownSource } from '../../src/utils/cellarImportProfiles';
import { wineNameKey } from '../../src/utils/wineIdentity';
import { addCellarWines, getCellarWineById, getCellarWines, updateCellarWine, type NewCellarWine } from '../../src/api/cellar';
import { bulkCreateChosenReviews } from '../../src/api/chosenWines';
import { createLibraryFilter } from '../../src/api/libraryFilters';
import { parseVivinoReviews, isMonthFirstCurrency, type VivinoReview } from '../../src/utils/vivinoCsv';
import { fetchStorageLocations, createStorageLocation, createStorageCases, deleteStorageCases } from '../../src/api/storageLocations';
import { addLocationPlacement, fetchPlacementsForWines, insertLocationPlacements } from '../../src/api/placements';
import type { CellarWine, StorageLocation } from '../../src/types/wine';
import { bottleSizeCl } from '../../src/components/BottleSizePicker';
import { formatCurrency } from '../../src/constants/currency';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import { launchCamera, launchImageLibrary } from '../../src/utils/imagePicker';
import { useCommunityMember } from '../../src/hooks/useCommunityMember';
import { confirmBulkShare } from '../../src/services/communityShare';
import { GATHER_LOCKED, GATHER_LOCKED_OPACITY } from '../../src/constants/features';

type Stage = 'capture' | 'sheets' | 'analyzing' | 'review' | 'location' | 'adding' | 'done' | 'reviews-done';

// New cellar lines are written this many at a time.
const INSERT_BATCH = 200;
// Screenshots read at once: enough to be quick, few enough not to swamp a
// mobile connection with large uploads.
const SCREENSHOT_READS_AT_ONCE = 3;
// Parts of a long spreadsheet read at once.
const PARTS_READ_AT_ONCE = 3;
// This many parts failing in a row (offline, over the usage limit) means the
// rest would fail the same way, so they aren't tried.
const MAX_FAILED_PARTS_IN_A_ROW = 3;
// A storage statement PDF is a few hundred KB; the server refuses ~10 MB+.
const MAX_PDF_BYTES = 10_000_000;

// A holding's bottle count, never less than one.
function bottlesOf(w: CellarImportWine): number {
  return Number.isFinite(w.totalBottles) && w.totalBottles > 0 ? Math.round(w.totalBottles) : 1;
}

// The review + save work on the rich CellarImportWine (carrying the case
// structure). The photo/screenshot path returns the simpler bottle shape, so
// lift it into a loose CellarImportWine.
function fromImported(w: ImportedCellarWine): CellarImportWine {
  const quantity = Number.isFinite(w.quantity) && w.quantity > 0 ? Math.round(w.quantity) : 1;
  const producer = w.producer || w.wine_name || null;
  return {
    producer,
    // The reader often repeats the producer as the wine name.
    wineName: cuveeName(producer, w.wine_name || null),
    vintage: w.vintage ?? null,
    region: w.region || null,
    country: null,
    colour: null,
    bottleSizeMl: w.bottle_size_ml ?? 750,
    totalBottles: quantity,
    packaging: 'loose',
    bottlesPerCase: null,
    cases: null,
    looseBottles: quantity,
    drinkingWindowFrom: null,
    drinkingWindowTo: null,
    purchasePricePerBottle: w.purchase_price ?? null,
    marketPricePerBottle: null,
    currency: w.currency ?? null,
    notes: null,
  };
}

// True when a holding is a real case (a complete case of >1 bottle) — a single
// bottle sold "as a case" of 1 is treated as loose.
function isCased(w: CellarImportWine): boolean {
  return (w.packaging === 'owc' || w.packaging === 'non_owc') && (w.bottlesPerCase ?? 0) > 1;
}
// One case's name, e.g. "OWC of 6 · 75cl".
function caseName(w: CellarImportWine): string {
  return `${w.packaging === 'non_owc' ? 'Non-OWC' : 'OWC'} of ${w.bottlesPerCase} · ${bottleSizeCl(w.bottleSizeMl)}cl`;
}
// The holding on the review list, e.g. "2 × OWC of 6 · 75cl".
function caseSummary(w: CellarImportWine): string {
  return `${w.cases && w.cases > 1 ? `${w.cases} × ` : ''}${caseName(w)}`;
}

// The cellar line a new holding becomes. Imported values are for the bottle as
// listed, at its own size — as Vinster keeps them. added_via 'import' means no
// Wine Intel is generated for it in the background.
function newCellarRow(userId: string, id: string, w: CellarImportWine, defaultCurrency: string): NewCellarWine & { id: string } {
  const year = (s: string | null) => { const n = s ? parseInt(s, 10) : NaN; return Number.isFinite(n) ? n : null; };
  const market = w.marketPricePerBottle;
  const paid = w.purchasePricePerBottle;
  return {
    id,
    user_id: userId,
    wine_name: (w.wineName || w.producer || '').trim(),
    producer: w.wineName ? (w.producer ?? null) : null,
    region: w.region ?? null,
    // The colour column off the import sheet (Red / White / Rosé / Sparkling /
    // Fortified) — kept so Cellar Statistics' Style breakdown has it.
    style: w.colour ?? null,
    vintage: w.vintage ?? null,
    quantity: bottlesOf(w),
    date_received: new Date().toISOString().split('T')[0],
    drinking_window_from: year(w.drinkingWindowFrom),
    drinking_window_to: year(w.drinkingWindowTo),
    drinking_window_status: 'unknown',
    // A market/current value column becomes the wine's estimated value, so
    // Cellar Stats reflect it without a lookup.
    estimated_value: market ?? null,
    estimated_value_currency: market != null ? (w.currency ?? defaultCurrency) : null,
    estimated_value_at: market != null ? new Date().toISOString() : null,
    estimated_value_source: market != null ? 'imported' : null,
    purchase_price: paid ?? null,
    purchase_price_currency: paid != null ? (w.currency ?? defaultCurrency) : null,
    bottle_size_ml: w.bottleSizeMl ?? 750,
    added_via: 'import',
  };
}

// Run `task` over every item, at most `limit` at a time, keeping each outcome:
// one failure doesn't throw away the others.
async function settleLimited<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try { results[i] = { status: 'fulfilled', value: await task(items[i]) }; } catch (reason) { results[i] = { status: 'rejected', reason }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// "1, 2 and 4".
function listJoin(n: number[]): string {
  return n.length < 2 ? String(n[0] ?? '') : `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`;
}

// Why a row is pre-unticked: it already exists in the cellar, or it repeats an
// earlier row in this same import. null = a fresh wine, ticked by default.
type DupFlag = 'cellar' | 'import' | null;

type CsvSource = 'vivino' | 'cellartracker' | 'file';

// Per-source copy for the shared CSV/spreadsheet import flow. `steps` is null for
// a generic file upload (no vendor to instruct). `note` shows in the steps popup.
const CSV_SOURCES: Record<CsvSource, {
  name: string;
  lead: string;
  hint: string;
  steps: string | null;
  stepsNote?: string;
  hasLabelImages: boolean; // whether the source stores label photos (none do today)
}> = {
  vivino: {
    name: 'Vivino',
    lead: 'Bring your Vivino cellar across.',
    hint: 'Vivino only exports on the web. Once the file is on your phone, choose it below.',
    steps:
      '1.  Sign in at vivino.com.\n\n' +
      '2.  Go to Settings → Account Management.\n\n' +
      '3.  Tap "Export Your Data".\n\n' +
      '4.  Wait for your download link, then download the file — it contains your cellar as a CSV. Come back here and upload it.',
    stepsNote: 'It can take quite some time for your Vivino document to prep.',
    hasLabelImages: false,
  },
  cellartracker: {
    name: 'CellarTracker',
    lead: 'Bring your CellarTracker cellar across.',
    hint: 'CellarTracker only exports from the full desktop website. Once the file is on your phone, choose it below.',
    steps:
      '1.  Sign in at cellartracker.com on a computer.\n\n' +
      '2.  Open "My Cellar" and choose the "Wines" view so your bottle counts come across.\n\n' +
      '3.  Click "Export" (top-right).\n\n' +
      '4.  Choose CSV as the format and download the file — then come back here and upload it.',
    hasLabelImages: false,
  },
  file: {
    name: 'File',
    lead: 'Upload a cellar spreadsheet or statement.',
    hint: 'Choose an Excel spreadsheet (.xlsx, .xls), a CSV, or a storage invoice / reserves statement (PDF).\n\nExported from Numbers or Google Sheets? Save it as Excel or CSV first.\n\nVinster needs each column named in the top row so it can read your file directly. Please remember to include purchase prices where you can.',
    steps: null,
    hasLabelImages: false,
  },
};

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
// Identity key for spotting a wine already in the cellar or repeated in the
// import. wineNameKey matches the same words in either field, so a merchant's
// full name in `producer` meets the cellar's producer + wine_name, and accents,
// "Château" and a repeated producer don't matter.
function wineKey(w: { producer?: string | null; wineName?: string | null; wine_name?: string | null; vintage?: string | number | null; bottle_size_ml?: number | null; bottleSizeMl?: number | null }): string {
  const wineName = w.wineName ?? w.wine_name;
  // A name made only of words the key ignores ("Domaine", "Champagne") keeps
  // its plain text, so it can't match every other such wine.
  const name = wineNameKey(w.producer, wineName) || norm(`${w.producer ?? ''} ${wineName ?? ''}`);
  // Bottle SIZE is part of identity: the same wine + vintage in a different format
  // (75cl vs a 600cl large format vs magnum) is a DISTINCT bottling, not a
  // duplicate. Only same wine + vintage + size counts as a repeat.
  const size = w.bottle_size_ml ?? w.bottleSizeMl ?? 750;
  return `${name}|${norm(String(w.vintage ?? ''))}|${size}`;
}

// A wine that reached the cellar but couldn't be filed in the import location,
// kept so "File the rest now" can retry just the filing. `merged`: its bottles
// joined an existing cellar line.
interface UnfiledLine { id: string; wine: CellarImportWine; locationId: string; merged: boolean }

export default function ImportCellarScreen() {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const defaultCurrency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  // Entry source from the "Upload Cellar Document" chooser: camera / library
  // (photo → OCR) or vivino (a Vivino CSV export → parse).
  const { source } = useLocalSearchParams<{ source?: 'camera' | 'library' | 'vivino' | 'cellartracker' | 'file' | 'vivino-reviews' | 'review-spreadsheet' }>();
  const isReviewImport = source === 'vivino-reviews' || source === 'review-spreadsheet';
  // The three CSV/spreadsheet sources share one flow; only the on-screen copy
  // (name, export steps, label-image caveat) differs — driven by CSV_SOURCES.
  const csv = source && source in CSV_SOURCES ? CSV_SOURCES[source as CsvSource] : null;
  const isCsv = csv !== null;

  const [stage, setStage] = useState<Stage>('capture');
  const [wines, setWines] = useState<CellarImportWine[]>([]);
  // Each row's cellar id, chosen up front so retrying an interrupted import
  // can't add the same row twice (see addCellarWines).
  const [rowIds, setRowIds] = useState<string[]>([]);
  const [keep, setKeep] = useState<boolean[]>([]);
  const [dupFlags, setDupFlags] = useState<DupFlag[]>([]);
  // Leave out rows already in the cellar, so importing an updated list again
  // doesn't double what's there. Off: their bottles join the existing line.
  const [skipExisting, setSkipExisting] = useState(true);
  // Part of the list couldn't be read (shown above the review list).
  const [readWarning, setReadWarning] = useState<string | null>(null);
  // "N of M" while a long list is read or added.
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [addedCount, setAddedCount] = useState(0);
  // How many bottles were merged into wines already in the cellar (for the
  // done-screen summary). Set on a successful import.
  const [mergedBottles, setMergedBottles] = useState(0);
  // Per-wine merge detail for the done screen: which existing wines gained bottles.
  const [mergedList, setMergedList] = useState<Array<{ name: string; added: number; base: number }>>([]);
  // Wines that were added but couldn't be filed in the chosen location.
  const [unfiled, setUnfiled] = useState<UnfiledLine[]>([]);
  const [filingRest, setFilingRest] = useState(false);
  // The location this import was filed into (for the done-screen "view it here" line).
  const [importedLocationName, setImportedLocationName] = useState<string | null>(null);
  // Existing cellar wines keyed by identity, so a 'cellar' duplicate can be
  // skipped or merged into its existing row rather than spawning a parallel line.
  const existingByKey = useRef<Map<string, CellarWine>>(new Map());
  // Multi-sheet workbooks (e.g. a portfolio spanning several accounts) let the
  // user choose which lists to import before parsing.
  const [sheets, setSheets] = useState<ImportSheet[]>([]);
  const [sheetKeep, setSheetKeep] = useState<boolean[]>([]);
  // Storage location the import is filed into (cased holdings become OWC cases
  // there; loose bottles are filed to it; "unplaced" skips it entirely).
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [newLocationName, setNewLocationName] = useState('');
  // Whether a NEW import location is stored externally (offsite) vs at home — so it
  // files under "All Wines Stored Externally" vs "All Wines At Home" in the list.
  const [newLocationExternal, setNewLocationExternal] = useState(false);
  // Where an external cellar is ("Octavian, Corsham") — required for external.
  const [newLocationStoredAt, setNewLocationStoredAt] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  // Reviews import summary: reviews added, across how many wines, and exact
  // duplicates skipped.
  const [reviewSummary, setReviewSummary] = useState<{ reviews: number; wines: number; skipped: number } | null>(null);
  // The reviews just imported, for sharing them to the Community in one go.
  const [importedReviewIds, setImportedReviewIds] = useState<string[]>([]);
  const [sharedImport, setSharedImport] = useState(false);
  const community = useCommunityMember();

  // Set when the screen is left, so a long read or import stops instead of
  // carrying on paying for reads and writing wines nobody is waiting for.
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; };
  }, []);

  // True while an import (or its filing) runs. A ref, not state: a quick
  // second tap lands before a re-render could disable the button.
  const busy = useRef(false);
  async function once(task: () => Promise<void>) {
    if (busy.current) return;
    busy.current = true;
    try { await task(); } finally { busy.current = false; }
  }

  // Auto-open the right picker so the chooser → this screen → picker feels like
  // one action. Vivino stays on the instructions screen (the user needs to have
  // exported the CSV first). Runs once.
  const didAuto = useRef(false);
  useEffect(() => {
    if (didAuto.current) return;
    didAuto.current = true;
    if (source === 'camera') void pick('camera');
    else if (source === 'library') void pick('library');
    else if (source === 'vivino-reviews' || source === 'review-spreadsheet') void pickReviewsFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  async function pick(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1, allowsMultipleSelection: source === 'library' };
      const result = source === 'camera'
        ? await launchCamera(opts)
        : await launchImageLibrary(opts);
      if (result.canceled || !result.assets.length) return;
      await analyze(result.assets.map((a) => a.uri));
    } catch (err) {
      showAlert({ title: 'Could not open picker', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Read each screenshot (cellar lists often span several screens) and merge
  // the wines. A screenshot that fails doesn't lose the ones that were read.
  async function analyze(uris: string[]) {
    if (!(await ensureConnectionForUpload())) return;
    setStage('analyzing');
    const total = uris.length;
    let done = 0;
    if (total > 1) setProgress({ done, total });
    const results = await settleLimited(uris, SCREENSHOT_READS_AT_ONCE, async (uri) => {
      if (cancelled.current) return [];
      const { wines: read } = await importCellarDocument(await prepareImageBase64(uri));
      if (total > 1) setProgress({ done: ++done, total });
      return read ?? [];
    });
    if (cancelled.current) return;
    setProgress(null);
    const failed = results.flatMap((r, i) => (r.status === 'rejected' ? [i + 1] : []));
    if (failed.length === total) {
      const reason = (results[0] as PromiseRejectedResult).reason;
      showAlert({ title: 'Could not read the screenshot', body: reason instanceof Error ? reason.message : 'Please try again.' });
      setStage('capture');
      return;
    }
    const read = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    if (read.length === 0) {
      showAlert({
        title: 'No wines found',
        body: `Vinster couldn't find any wines in ${total > 1 ? 'those photos' : 'that photo'}. Try a clearer photo or screenshot that shows the wine names.`,
      });
      setStage('capture');
      return;
    }
    await presentWines(read.map(fromImported), 'photo', failed.length
      ? `Screenshot${failed.length > 1 ? 's' : ''} ${listJoin(failed)} couldn't be read, so ${failed.length > 1 ? 'their' : 'its'} wines aren't listed below. You can carry on with these and import the rest again.`
      : null);
  }

  // Pre-tick logic shared by every import source. Everything is ticked by
  // default. Wines already in the cellar are flagged 'cellar' — skipped while
  // "Skip wines already in your cellar" is on, otherwise their bottles are
  // MERGED into the existing listing. Wines repeated within this same import
  // are pre-unticked ('import') so we don't double-count the same row twice.
  // `from`: a file, or photos/screenshots (the alerts are worded to match).
  // `warning`: part of the file couldn't be read.
  async function presentWines(all: CellarImportWine[], from: 'file' | 'photo', warning: string | null = null) {
    // Vintage is core identity — a file with NO vintages at all can't be imported
    // reliably. Block and send the user back to fix the file. The stage changes
    // first so closing the alert any way (back, tapping outside) leaves no spinner.
    if (all.length && !all.some((w) => (w.vintage ?? '').toString().trim() !== '')) {
      setStage('capture');
      showAlert({
        title: 'Vintages needed',
        body: from === 'photo'
          ? "Vinster can't import wines without vintages. Please choose a photo or screenshot that shows each wine's vintage."
          : "Vinster can't import a file without vintages. Please add a vintage column to your file and upload it again.",
        buttons: [{ text: 'OK' }],
      });
      return;
    }
    // No bottle format on some rows → default to 1×75cl (single 75cl bottle) and
    // flag it below. The parser returns null when the file gave no size.
    const noFormatCount = all.filter((w) => (w.bottleSizeMl as number | null) == null).length;
    if (noFormatCount > 0) {
      all = all.map((w) => ((w.bottleSizeMl as number | null) == null ? { ...w, bottleSizeMl: 750 } : w));
    }
    const map = new Map<string, CellarWine>();
    const userId = session?.user.id;
    if (userId) {
      try {
        const existing = await getCellarWines(userId);
        for (const e of existing) { const k = wineKey(e); if (!map.has(k)) map.set(k, e); }
      } catch { /* best-effort — don't block the import if the cellar can't be read */ }
    }
    if (cancelled.current) return;
    existingByKey.current = map;
    const seen = new Set<string>();
    const flags: DupFlag[] = [];
    const initialKeep: boolean[] = [];
    for (const w of all) {
      const k = wineKey(w);
      const flag: DupFlag = map.has(k) ? 'cellar' : seen.has(k) ? 'import' : null;
      seen.add(k);
      flags.push(flag);
      // Tick new wines and cellar matches; untick within-import repeats.
      initialKeep.push(flag !== 'import');
    }
    setWines(all);
    setRowIds(all.map(() => Crypto.randomUUID()));
    setDupFlags(flags);
    setKeep(initialKeep);
    setSkipExisting(true);
    setReadWarning(warning);
    setStage('review');
    // Flag what the user needs to know about, combined into one alert.
    const notes = [
      noFormatCount > 0
        ? `${noFormatCount} wine${noFormatCount === 1 ? '' : 's'} had no bottle format, so ${noFormatCount === 1 ? 'it was' : 'they were'} set to 1×75cl (single 75cl bottles). You can change a wine's format later.`
        : null,
      warning,
    ].filter(Boolean).map((n) => `\n\n${n}`).join('');
    const hasPurchase = all.some((w) => w.purchasePricePerBottle != null);
    const hasMarket = all.some((w) => w.marketPricePerBottle != null);
    if (!hasPurchase && hasMarket) {
      // No purchase prices, but the doc carried market/current values — those are
      // applied as each wine's estimated value, so the user can proceed.
      showAlert({
        title: 'Market values found',
        body: `No purchase prices in your file, but Vinster found market/current values and will apply them as each wine's estimated value. Add purchase prices too for the most accurate Cellar Stats.${notes}`,
        buttons: [
          { text: 'Add purchase prices', onPress: () => setStage('capture') },
          { text: 'Continue' },
        ],
      });
    } else if (!hasPurchase) {
      // No purchase prices anywhere → stats need them. Offer to go back or proceed.
      showAlert({
        title: 'No purchase prices found',
        body: from === 'photo'
          ? `Vinster can't see purchase prices in your photo, and therefore won't be able to generate accurate Cellar Stats. Please go back and choose a photo or screenshot that shows what you paid.${notes}`
          : `Vinster can't see purchase prices in your file, and therefore won't be able to generate accurate Cellar Stats. Please go back and add a column with purchase prices.${notes}`,
        buttons: [
          { text: 'Go back', onPress: () => setStage('capture') },
          { text: 'Skip purchase prices' },
        ],
      });
    } else if (notes) {
      showAlert({ title: warning ? "Some wines weren't read" : 'No bottle format found', body: notes.trim(), buttons: [{ text: 'OK' }] });
    }
  }

  // Pick the CSV/spreadsheet the user exported and parse it (reviews are captured
  // too, for the later reviews-import feature). Shared by Vivino, CellarTracker
  // and generic file uploads — the parser is format-agnostic.
  async function pickCsvFile() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv', 'text/comma-separated-values', 'text/tab-separated-values', 'text/plain',
          'application/vnd.ms-excel', // .xls (and, on Windows, some .csv)
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/vnd.oasis.opendocument.spreadsheet', // .ods
          'application/pdf', // storage invoices / reserves statements
          '*/*',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      setStage('analyzing');
      const asset = res.assets[0];
      const name = (asset.name ?? '').toLowerCase();
      const bytes = await new File(asset.uri).bytes();
      // A PDF (storage invoice / reserves statement) is read directly by Claude
      // rather than decoded — no rows to split, so no sheet picker.
      const isPdf = /\.pdf$/.test(name) || (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46); // %PDF
      if (isPdf) {
        if (bytes.length > MAX_PDF_BYTES) {
          showAlert({ title: 'That PDF is too large', body: 'Vinster can read statements up to about 10 MB. Try a smaller file, or a spreadsheet export instead.' });
          setStage('capture');
          return;
        }
        if (!(await ensureConnectionForUpload())) { setStage('capture'); return; }
        const read = await parseCellarPdf(await new File(asset.uri).base64(), asset.name ?? 'PDF');
        if (cancelled.current) return;
        if (read.wines.length === 0) {
          showAlert({ title: "Couldn't read that PDF", body: "Vinster couldn't find any wine holdings in that document. If it's a scanned image, try a clearer copy or a spreadsheet export instead." });
          setStage('capture');
          return;
        }
        await presentWines(read.wines, 'file', read.truncated
          ? "This document was too long to read in full, so some wines may be missing below. You can carry on with these, or import a spreadsheet export instead."
          : null);
        return;
      }
      // Decode the spreadsheet (Excel / CSV, any encoding) into clean per-sheet
      // rows. Excel (.xlsx/.xls/.ods) is read from base64 — SheetJS's array path
      // hits the bundler's empty stream/fs stubs and throws (see fileToSheets).
      const base64 = await new File(asset.uri).base64();
      const parsedSheets = fileToSheets(bytes, asset.name ?? 'file', base64);
      if (parsedSheets.length === 0) {
        showAlert({
          title: "Couldn't read that file",
          body: "We couldn't find any rows in that file. If you exported it from Numbers, a CSV reads most reliably — File → Export To → CSV, then import that. Make sure the top row names the columns.",
        });
        setStage('capture');
        return;
      }
      // One sheet → parse it now; several → let the user choose which lists.
      if (parsedSheets.length === 1) { await processSheets([parsedSheets[0]]); return; }
      setSheets(parsedSheets);
      setSheetKeep(parsedSheets.map(() => true));
      setStage('sheets');
    } catch (err) {
      showAlert({ title: 'Could not read the file', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  // Import Vivino RATINGS + TASTING NOTES (not stock). Pick the full wine list,
  // extract every rated/reviewed wine, and save each as a review in Your Wine
  // Reviews, grouped in a dated Import folder.
  async function pickReviewsFile() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/tab-separated-values', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      // CSV only — xlsx/xls text mangles when read on-device (mojibake), so we
      // reject spreadsheets up front and ask for a CSV re-save.
      if (/\.(xlsx|xls|ods)$/i.test(asset.name ?? '')) {
        showAlert({ title: 'Please upload a CSV', body: 'Vinster can only read reviews from a CSV file. In Excel/Numbers/Sheets choose File → Save As (or Export) → CSV, then upload that.' });
        setStage('capture');
        return;
      }
      if (/\.zip$/i.test(asset.name ?? '')) {
        showAlert({ title: 'Please upload a CSV', body: "That's a zip file — unzip it and choose full_wine_list.csv" });
        setStage('capture');
        return;
      }
      setStage('analyzing');
      const bytes = await new File(asset.uri).bytes();
      const base64 = await new File(asset.uri).base64();
      const parsedSheets = fileToSheets(bytes, asset.name ?? 'file', base64);
      const reviews = parseVivinoReviews(parsedSheets[0]?.rows ?? [], !isMonthFirstCurrency(defaultCurrency));
      if (reviews.length === 0) {
        showAlert({ title: 'No reviews found', body: 'This file has no wines with a rating, review or note. Make sure you exported your full Vivino wine list (not just the cellar).' });
        setStage('capture');
        return;
      }
      await importReviews(reviews);
    } catch (err) {
      showAlert({ title: 'Could not read the file', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  async function importReviews(reviews: VivinoReview[]) {
    const userId = session?.user.id;
    if (!userId) return;
    setStage('adding');
    try {
      // Drop only TRULY identical rows (same wine AND same review text/note/score
      // /date) — a real duplicate. DISTINCT reviews of the same wine (different
      // tasting occasions) are all kept: they share a review_group_id so they
      // collapse into ONE review card with dated entries. No intel generated now
      // (on demand when a wine is opened).
      const groupIds = new Map<string, string>(); // wine+vintage -> shared review_group_id
      const seenIdentical = new Set<string>();
      let trueDupes = 0;
      const items = reviews
        .filter((rv) => {
          const identical = `${wineKey({ producer: rv.producer, wineName: rv.wineName, vintage: rv.vintage })}|${norm(rv.reviewNote)}|${norm(rv.personalNote)}|${rv.score ?? ''}|${rv.date ?? ''}`;
          if (seenIdentical.has(identical)) { trueDupes++; return false; }
          seenIdentical.add(identical);
          return true;
        })
        .map((rv) => {
          const wk = wineKey({ producer: rv.producer, wineName: rv.wineName, vintage: rv.vintage });
          let gid = groupIds.get(wk);
          if (!gid) { gid = Crypto.randomUUID(); groupIds.set(wk, gid); }
          return {
            producer: rv.producer,
            wineName: rv.wineName || rv.producer,
            vintage: rv.vintage ? (parseInt(rv.vintage, 10) || null) : null,
            region: rv.region,
            style: rv.colour,
            userScore: rv.score,
            tastingNote: rv.reviewNote,
            otherObservations: rv.personalNote,
            location: rv.location,
            reviewDate: rv.date,
            labelImagePath: rv.labelImageUrl,
            reviewGroupId: gid,
          };
        });
      const ids = await bulkCreateChosenReviews(userId, items);
      // Group this batch under a dated "Import" folder on the Wine Reviews carousel.
      const folderName = `Import — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      if (ids.length > 0) await createLibraryFilter(userId, 'wine-review', folderName, ids);
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      qc.invalidateQueries({ queryKey: ['library-filters'] });
      setReviewSummary({ reviews: ids.length, wines: groupIds.size, skipped: trueDupes });
      setImportedReviewIds(ids);
      setStage('reviews-done');
    } catch (err) {
      showAlert({ title: 'Could not import reviews', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  // Parse the chosen sheets: a recognised merchant or cellar-app export maps
  // exactly on the phone; anything else is read by the intelligent (Claude)
  // parser in parts of ~40 rows, a few at a time. A part that fails is tried
  // once more; one that still fails or comes back incomplete is reported, and
  // the user can carry on with the rest.
  async function processSheets(selected: ImportSheet[]) {
    setStage('analyzing');
    try {
      const plan = selected.map((sheet) => {
        const known = parseKnownSource(sheet.rows);
        return { sheet, known, parts: known ? [] : sheetChunks(sheet) };
      });
      const reads = plan.flatMap(({ sheet, parts }) => parts.map((text) => ({ text, source: sheet.name })));
      const total = reads.length;
      let done = 0;
      let failedInARow = 0;
      let lastError: unknown = null;
      const readPart = async (text: string, source: string): Promise<CellarListRead> => {
        for (let attempt = 1; ; attempt++) {
          // Not tried at all once the screen is left or too many have failed.
          if (cancelled.current || failedInARow >= MAX_FAILED_PARTS_IN_A_ROW) throw new Error('Not read');
          try {
            const read = await parseCellarImport(text, source);
            failedInARow = 0;
            return read;
          } catch (err) {
            lastError = err;
            if (attempt === 2) { failedInARow++; throw err; }
          }
        }
      };
      if (total > 1) setProgress({ done, total });
      const results = await settleLimited(reads, PARTS_READ_AT_ONCE, async ({ text, source }) => {
        try {
          return await readPart(text, source);
        } finally {
          if (total > 1) setProgress({ done: ++done, total });
        }
      });
      if (cancelled.current) return;
      setProgress(null);
      // Wines in file order: each sheet's known-source rows, or its parts in turn.
      let next = 0;
      const all = plan.flatMap(({ known, parts }) => known ? known.wines : parts.flatMap(() => {
        const r = results[next++];
        return r.status === 'fulfilled' ? r.value.wines : [];
      }));
      const unread = results.filter((r) => r.status === 'rejected' || r.value.truncated).length;
      if (all.length === 0) {
        showAlert(lastError
          ? { title: 'Could not read the list', body: lastError instanceof Error ? lastError.message : 'Please try again.' }
          : {
            title: "Couldn't read that list",
            body: "We couldn't find any wines. If this was an Excel file exported from Numbers, try a CSV instead — File → Export To → CSV — which reads most reliably. Make sure the top row names the columns (producer, wine, vintage, quantity…).",
          });
        setStage('capture');
        return;
      }
      await presentWines(all, 'file', unread
        ? `Part of your file couldn't be read${total > 1 ? ` (${unread} of ${total} parts)` : ''}, so some wines may be missing below. You can carry on with these and import the rest again.`
        : null);
    } catch (err) {
      if (cancelled.current) return;
      setProgress(null);
      showAlert({ title: 'Could not read the list', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  // Whether a row goes into the cellar: ticked, and not a wine already there
  // while those are being skipped.
  const included = (i: number) => keep[i] && !(skipExisting && dupFlags[i] === 'cellar');
  const keptCount = wines.reduce((n, _, i) => n + (included(i) ? 1 : 0), 0);
  // What the review rows read besides each wine, so the list redraws on a change.
  const reviewListState = useMemo(() => ({ keep, skipExisting }), [keep, skipExisting]);
  const cellarMatches = dupFlags.filter((f) => f === 'cellar').length;
  const unfiledBottles = unfiled.reduce((n, u) => n + bottlesOf(u.wine), 0);

  async function loadLocations() {
    const userId = session?.user.id;
    if (!userId) return;
    try { setLocations(await fetchStorageLocations(userId)); } catch { /* offer create-new only */ }
  }

  // Move from the review to the location step (fetches existing locations first).
  function goToLocationStep() {
    if (keptCount === 0) return;
    setNewLocationName('');
    setNewLocationStoredAt('');
    void loadLocations();
    setStage('location');
  }

  // Create a new storage location, then import into it. Run through once().
  async function createLocationAndImport() {
    const userId = session?.user.id;
    const name = newLocationName.trim();
    if (!userId || !name || (newLocationExternal && !newLocationStoredAt.trim())) return;
    setSavingLocation(true);
    try {
      const loc = await createStorageLocation(userId, name, newLocationExternal, newLocationExternal ? newLocationStoredAt : null);
      await confirmImport(loc);
    } catch (err) {
      showAlert({ title: 'Could not create location', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingLocation(false);
    }
  }

  // File a batch of new lines in the import location: each full case becomes
  // its own case there, the remaining bottles sit loose. A line that landed on
  // an earlier, interrupted attempt (not in `added`) may already be filed, so
  // those are checked first. Returns the lines that couldn't be filed.
  async function fileNewLines(userId: string, locationId: string, items: { id: string; wine: CellarImportWine }[], added: Set<string>): Promise<UnfiledLine[]> {
    let toFile = items;
    try {
      const earlier = items.filter((x) => !added.has(x.id)).map((x) => x.id);
      const filed = new Set(earlier.length ? (await fetchPlacementsForWines(earlier)).map((p) => p.cellar_wine_id) : []);
      toFile = items.filter((x) => !filed.has(x.id));
      const cases: { id: string; storageLocationId: string; name: string }[] = [];
      const placements: { wineId: string; locationId: string; caseId: string | null; quantity: number }[] = [];
      for (const { id, wine } of toFile) {
        const qty = bottlesOf(wine);
        const perCase = wine.bottlesPerCase ?? 0;
        const caseCount = isCased(wine) ? Math.min(wine.cases ?? Infinity, Math.floor(qty / perCase)) : 0;
        for (let c = 0; c < caseCount; c++) {
          const caseId = Crypto.randomUUID();
          cases.push({ id: caseId, storageLocationId: locationId, name: caseName(wine) });
          placements.push({ wineId: id, locationId, caseId, quantity: perCase });
        }
        const loose = qty - caseCount * perCase;
        if (loose > 0) placements.push({ wineId: id, locationId, caseId: null, quantity: loose });
      }
      await createStorageCases(userId, cases);
      try {
        await insertLocationPlacements(placements);
      } catch (err) {
        // Don't leave empty cases behind for bottles that aren't in them. Best
        // effort: the filing failure is what gets reported.
        await deleteStorageCases(cases.map((c) => c.id)).catch(() => undefined);
        throw err;
      }
      return [];
    } catch {
      return toFile.map(({ id, wine }) => ({ id, wine, locationId, merged: false }));
    }
  }

  // "File the rest now": file again only the wines that couldn't be filed.
  async function fileTheRest() {
    const userId = session?.user.id;
    if (!userId || unfiled.length === 0) return;
    setFilingRest(true);
    const still: UnfiledLine[] = [];
    for (const locationId of new Set(unfiled.map((u) => u.locationId))) {
      const here = unfiled.filter((u) => u.locationId === locationId);
      still.push(...await fileNewLines(userId, locationId, here.filter((u) => !u.merged), new Set()));
      for (const u of here.filter((x) => x.merged)) {
        try { await addLocationPlacement(u.id, locationId, null, bottlesOf(u.wine)); } catch { still.push(u); }
      }
    }
    invalidateCellarViews(qc);
    setUnfiled(still);
    setFilingRest(false);
    if (still.length) showAlert({ title: "Couldn't file them yet", body: 'Those bottles are still in Your Full Cellar List, unplaced. Please try again in a moment.' });
  }

  // Materialize the import. `location` null → wines land unplaced; otherwise
  // every wine is filed into that location, its full cases as cases there.
  // Run through once(). Leaving the screen stops it between writes.
  async function confirmImport(location: StorageLocation | null) {
    const userId = session?.user.id;
    if (!userId || keptCount === 0) return;
    setStage('adding');
    const locationId = location?.id ?? null;
    // Work over ORIGINAL indices so that if a write throws partway we can drop
    // exactly the rows already committed, and a retry only adds the remainder.
    const keptIndices = wines.map((_, i) => i).filter(included);
    const succeeded: number[] = [];
    let bottlesAdded = 0;
    let mergedBottlesRun = 0;
    const unfiledRun: UnfiledLine[] = [];
    // Per existing-wine merge detail (name, bottles added this import, prior count).
    const mergedInfo = new Map<string, { name: string; added: number; base: number }>();
    setProgress({ done: 0, total: keptIndices.length });
    try {
      // Bottles of a wine already in the cellar join its line, one wine at a
      // time: the line's current count is re-read just before writing, so
      // bottles added meanwhile (or by an earlier row of this import) are kept.
      // A line archived or deleted since the review is added afresh.
      const fresh: number[] = [];
      for (const i of keptIndices) {
        if (cancelled.current) return;
        const match = dupFlags[i] === 'cellar' ? existingByKey.current.get(wineKey(wines[i])) : undefined;
        const live = match ? await getCellarWineById(match.id) : null;
        if (!live || live.archived_at) { fresh.push(i); continue; }
        const qty = bottlesOf(wines[i]);
        await updateCellarWine(live.id, { quantity: (live.quantity ?? 0) + qty });
        if (locationId) {
          try {
            await addLocationPlacement(live.id, locationId, null, qty);
          } catch {
            unfiledRun.push({ id: live.id, wine: wines[i], locationId, merged: true });
          }
        }
        const info = mergedInfo.get(live.id);
        mergedInfo.set(live.id, {
          name: [live.producer, live.wine_name, live.vintage].filter(Boolean).join(' '),
          added: (info?.added ?? 0) + qty,
          base: info?.base ?? (live.quantity ?? 0),
        });
        succeeded.push(i);
        bottlesAdded += qty;
        mergedBottlesRun += qty;
        setProgress({ done: succeeded.length, total: keptIndices.length });
      }
      // New lines, a batch at a time. No Wine Intel or price lookups here — an
      // import can be thousands of wines; intel is generated on demand later.
      for (let b = 0; b < fresh.length; b += INSERT_BATCH) {
        if (cancelled.current) return;
        const batch = fresh.slice(b, b + INSERT_BATCH);
        const added = new Set(await addCellarWines(batch.map((i) => newCellarRow(userId, rowIds[i], wines[i], defaultCurrency))));
        if (locationId) unfiledRun.push(...await fileNewLines(userId, locationId, batch.map((i) => ({ id: rowIds[i], wine: wines[i] })), added));
        succeeded.push(...batch);
        bottlesAdded += batch.reduce((n, i) => n + bottlesOf(wines[i]), 0);
        setProgress({ done: succeeded.length, total: keptIndices.length });
      }
      invalidateCellarViews(qc);
      setAddedCount((prev) => prev + bottlesAdded);
      setMergedBottles((prev) => prev + mergedBottlesRun);
      setMergedList(Array.from(mergedInfo.values()));
      setUnfiled((prev) => [...prev, ...unfiledRun]);
      setImportedLocationName(location?.name ?? null);
      setStage('done');
    } catch (err) {
      if (cancelled.current) return;
      console.warn('import-cellar: partial failure after', succeeded.length, 'of', keptIndices.length, err);
      // Drop the rows we already committed so a retry only adds the remainder.
      if (succeeded.length) {
        const done = new Set(succeeded);
        const remaining = <T,>(prev: T[]) => prev.filter((_, i) => !done.has(i));
        setWines(remaining);
        setRowIds(remaining);
        setKeep(remaining);
        setDupFlags(remaining);
        setAddedCount((prev) => prev + bottlesAdded);
        setMergedBottles((prev) => prev + mergedBottlesRun);
        setUnfiled((prev) => [...prev, ...unfiledRun]);
        invalidateCellarViews(qc);
      }
      showAlert({
        title: succeeded.length ? 'Imported some, then hit a snag' : 'Could not import',
        body: `${succeeded.length ? `${bottlesAdded} bottle${bottlesAdded === 1 ? '' : 's'} added. The rest are still listed — tap Continue to retry them. ` : ''}${err instanceof Error ? err.message : 'Please try again.'}`,
      });
      setStage('review');
    } finally {
      setProgress(null);
    }
  }

  // One row of the review list.
  function renderReviewRow(w: CellarImportWine, i: number) {
    const flag = dupFlags[i];
    // A wine already in the cellar can't be ticked while those are skipped.
    const skipped = skipExisting && flag === 'cellar';
    const on = included(i);
    const qty = bottlesOf(w);
    const label = [w.vintage, w.producer, w.wineName].filter(Boolean).join(' ');
    // quantity x format, matching the cellar list (e.g. 1x75, 2x150).
    const qtyFormat = `${qty}x${bottleSizeCl(w.bottleSizeMl)}`;
    // Purchase and/or market price per bottle (when the file gave them)
    // — shown in gold next to the format so the user can confirm prices
    // were read. Market value is labelled so it's clear it's not cost.
    const priceStr = [
      w.purchasePricePerBottle != null ? `${formatCurrency(w.purchasePricePerBottle, w.currency ?? defaultCurrency, { decimals: 0 })}/btl` : null,
      w.marketPricePerBottle != null ? `${formatCurrency(w.marketPricePerBottle, w.currency ?? defaultCurrency, { decimals: 0 })}/btl mkt` : null,
    ].filter(Boolean).join('  ·  ') || null;
    const tag = flag === 'cellar'
      ? (skipped ? 'Already in your cellar · skipped' : `Already in cellar · +${qty} to existing`)
      : flag === 'import' ? 'Duplicate · tap to include' : null;
    return (
      <TouchableOpacity
        style={[styles.row, !on && styles.rowOff]}
        onPress={() => setKeep((prev) => prev.map((v, j) => (j === i ? !v : v)))}
        disabled={skipped}
        activeOpacity={0.7}
      >
        <Text style={[styles.checkbox, on && styles.checkboxOn]}>{on ? '☑' : '☐'}</Text>
        <View style={styles.rowText}>
          <Text style={styles.rowName} numberOfLines={2}>{label || 'Unnamed wine'}</Text>
          {/* Format + purchase price on one gold line below the name
              (format listed once; price shows only when the file gave one). */}
          <Text style={styles.qtyFormat} numberOfLines={1}>
            {isCased(w) ? caseSummary(w) : qtyFormat}{priceStr ? `  ·  ${priceStr}` : ''}
          </Text>
          <View style={styles.rowMetaRow}>
            {w.region ? <Text style={styles.rowMeta} numberOfLines={1}>{w.region}</Text> : null}
            {tag ? <Text style={styles.rowTag}>{tag}</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const reviewHeader = (
    <>
      <Text style={styles.sectionLabel}>Found {wines.length} wine{wines.length === 1 ? '' : 's'} — tap to include or skip</Text>
      {readWarning ? <Text style={styles.readWarning}>{readWarning}</Text> : null}
      {cellarMatches > 0 ? (
        <>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Skip wines already in your cellar</Text>
            <Switch
              value={skipExisting}
              onValueChange={setSkipExisting}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.dedupNote}>
            {skipExisting
              ? `${cellarMatches} wine${cellarMatches === 1 ? ' is' : 's are'} already in your cellar and will be left out, so importing a list again doesn't double your bottles.`
              : 'Wines already in your cellar add their bottles to your existing listing, not a new one.'}
          </Text>
        </>
      ) : null}
      {dupFlags.includes('import') ? (
        <Text style={styles.dedupNote}>Wines repeated within this import are unticked to avoid double-counting. Tap any row to change it.</Text>
      ) : null}
    </>
  );

  const reviewFooter = (
    <>
      <TouchableOpacity
        style={[styles.primaryBtn, keptCount === 0 && styles.primaryBtnDisabled]}
        onPress={goToLocationStep}
        disabled={keptCount === 0}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>
          {keptCount === 0 ? 'Nothing selected' : `Continue with ${keptCount} wine${keptCount === 1 ? '' : 's'}`}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStage('capture')} activeOpacity={0.85}>
        <Text style={styles.secondaryBtnText}>{isCsv ? 'Choose another file' : 'Choose another image'}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{csv ? `Import from ${csv.name}` : 'Import a Cellar'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stage === 'capture' ? (
        <ScrollView contentContainerStyle={styles.content}>
          {isReviewImport ? (
            <>
              <Text style={styles.lead}>{source === 'vivino-reviews' ? 'Import your Vivino reviews' : 'Import reviews from a spreadsheet'}. Each rated wine becomes a review in Your Wine Reviews, grouped in a dated Import folder — no bottles are added to your cellar. CSV files only.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => void pickReviewsFile()} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Choose your CSV file</Text>
              </TouchableOpacity>
            </>
          ) : csv ? (
            <>
              <Text style={styles.lead}>{csv.lead}</Text>
              <Text style={styles.hint}>{csv.hint}</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => void pickCsvFile()} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>{csv.name === 'File' ? 'Choose a file' : `Choose ${csv.name} export file`}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.lead}>Import an existing cellar from a photo or screenshot of a wine list.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => void pick('library')} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Upload Screenshot</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => void pick('camera')} activeOpacity={0.85}>
                <Text style={styles.secondaryBtnText}>Take Photo</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      ) : stage === 'sheets' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>This file has {sheets.length} lists — choose which to import</Text>
          <Text style={styles.dedupNote}>Workbooks can hold several lists (and sometimes other people's). Tick the ones that are yours.</Text>
          {sheets.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.row, !sheetKeep[i] && styles.rowOff]}
              onPress={() => setSheetKeep((prev) => prev.map((v, j) => (j === i ? !v : v)))}
              activeOpacity={0.7}
            >
              <Text style={[styles.checkbox, sheetKeep[i] && styles.checkboxOn]}>{sheetKeep[i] ? '☑' : '☐'}</Text>
              <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>{s.name || `List ${i + 1}`}</Text>
                <Text style={styles.rowMeta}>{s.rowCount} row{s.rowCount === 1 ? '' : 's'}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.primaryBtn, !sheetKeep.some(Boolean) && styles.primaryBtnDisabled]}
            disabled={!sheetKeep.some(Boolean)}
            onPress={() => processSheets(sheets.filter((_, i) => sheetKeep[i]))}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {sheetKeep.some(Boolean) ? `Import ${sheetKeep.filter(Boolean).length} list${sheetKeep.filter(Boolean).length === 1 ? '' : 's'}` : 'Nothing selected'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStage('capture')} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Choose another file</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : stage === 'analyzing' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>
            Vinster is reading your cellar list…{progress ? `\n${progress.done} of ${progress.total} read` : ''}
          </Text>
        </View>
      ) : stage === 'location' ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>Where are these stored?</Text>
          {locations.map((loc) => (
            <TouchableOpacity key={loc.id} style={styles.locRow} onPress={() => once(() => confirmImport(loc))} activeOpacity={0.7}>
              <Text style={styles.locName} numberOfLines={1}>{loc.name}</Text>
              <Text style={styles.locChevron}>›</Text>
            </TouchableOpacity>
          ))}
          <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>New location</Text>
          <TextInput
            style={styles.newLocInput}
            value={newLocationName}
            onChangeText={setNewLocationName}
            placeholder="e.g. Octavian Bond"
            placeholderTextColor={colors.textMuted}
          />
          {/* Home vs external so the new folder sits under the right group. */}
          <View style={styles.homeExtRow}>
            <TouchableOpacity
              style={[styles.homeExtBtn, !newLocationExternal && styles.homeExtBtnOn]}
              onPress={() => setNewLocationExternal(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.homeExtText, !newLocationExternal && styles.homeExtTextOn]}>Stored at home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.homeExtBtn, newLocationExternal && styles.homeExtBtnOn]}
              onPress={() => setNewLocationExternal(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.homeExtText, newLocationExternal && styles.homeExtTextOn]}>Stored externally</Text>
            </TouchableOpacity>
          </View>
          {/* An external cellar also says where it is — shown on each wine
              card as "Stored at …". */}
          {newLocationExternal ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: spacing.md }]}>Where is it stored?</Text>
              <TextInput
                style={styles.newLocInput}
                value={newLocationStoredAt}
                onChangeText={setNewLocationStoredAt}
                placeholder="e.g. Octavian, Corsham"
                placeholderTextColor={colors.textMuted}
              />
            </>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryBtn, (!newLocationName.trim() || (newLocationExternal && !newLocationStoredAt.trim()) || savingLocation) && styles.primaryBtnDisabled]}
            onPress={() => once(createLocationAndImport)}
            disabled={!newLocationName.trim() || (newLocationExternal && !newLocationStoredAt.trim()) || savingLocation}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{savingLocation ? 'Creating…' : 'Create & import here'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => once(() => confirmImport(null))} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Import unplaced</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => setStage('review')} activeOpacity={0.7}>
            <Text style={styles.backLinkText}>← Back to review</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : stage === 'adding' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>
            {progress && progress.total > 1 ? `Adding ${progress.done} of ${progress.total} wines…` : 'Adding your wines…'}
          </Text>
        </View>
      ) : stage === 'done' ? (
        <View style={styles.centerBlock}>
          <Text style={styles.doneTitle}>Cellar imported</Text>
          <Text style={styles.hint}>
            {addedCount} bottle{addedCount === 1 ? '' : 's'} added{mergedBottles > 0 ? ` — ${mergedBottles} of them merged into wines already in your cellar` : ''}.{'\n\n'}This import can be viewed in Your Full Cellar List{importedLocationName ? ` in your ${importedLocationName} folder` : ''}.
            {unfiledBottles > 0 ? `\n\n${unfiledBottles} bottle${unfiledBottles === 1 ? '' : 's'} couldn't be filed in ${importedLocationName ?? 'that location'} — ${unfiledBottles === 1 ? "it's" : "they're"} in Your Full Cellar List, unplaced.` : ''}
          </Text>
          {unfiledBottles > 0 ? (
            <TouchableOpacity
              style={[styles.doneBtn, filingRest && styles.primaryBtnDisabled]}
              onPress={() => once(fileTheRest)}
              disabled={filingRest}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>{filingRest ? 'Filing…' : 'File the rest now'}</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={styles.doneIntelNudge}>
            Please update intel on these wines so that prices and scores are included in your cellar statistics — you can do this from the Full Cellar List screen.
          </Text>
          {mergedList.length > 0 ? (
            <View style={styles.mergedBlock}>
              {mergedList.map((m, i) => (
                <Text key={i} style={styles.mergedLine} numberOfLines={2}>
                  {m.name} — {m.added} bottle{m.added === 1 ? '' : 's'} added to {m.base} in your cellar
                </Text>
              ))}
            </View>
          ) : null}
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/cellar/list')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>View Full Cellar List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)/cellar')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : stage === 'reviews-done' ? (
        <View style={styles.centerBlock}>
          <Text style={styles.doneTitle}>Reviews imported</Text>
          <Text style={styles.hint}>
            {reviewSummary
              ? `${reviewSummary.reviews} review${reviewSummary.reviews === 1 ? '' : 's'} across ${reviewSummary.wines} wine${reviewSummary.wines === 1 ? '' : 's'} imported into a new dated Import folder in Your Wine Reviews${reviewSummary.skipped > 0 ? `. ${reviewSummary.skipped} exact duplicate${reviewSummary.skipped === 1 ? ' was' : 's were'} skipped` : ''}. Open Pair · Wine Reviews, then the Import folder, to see them.`
              : 'Your reviews have been imported.'}
          </Text>
          {community.enabled && importedReviewIds.length > 0 ? (
            <TouchableOpacity
              style={[styles.doneBtn, sharedImport && { opacity: 0.5 }, GATHER_LOCKED && { opacity: GATHER_LOCKED_OPACITY }]}
              onPress={() => confirmBulkShare(importedReviewIds, community.member, () => { setSharedImport(true); community.refreshShares(); })}
              disabled={sharedImport || GATHER_LOCKED}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>{sharedImport ? '✓ Shared to Community' : 'Share These Reviews to Community'}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/wines/chosen')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>View Wine Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)/cellar')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // review — a FlatList, so a list of thousands of wines stays smooth.
        <FlatList
          data={wines}
          keyExtractor={(_, i) => rowIds[i] ?? String(i)}
          renderItem={({ item, index }) => renderReviewRow(item, index)}
          extraData={reviewListState}
          ListHeaderComponent={reviewHeader}
          ListFooterComponent={reviewFooter}
          contentContainerStyle={styles.content}
          initialNumToRender={30}
          windowSize={11}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 44 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  content: { padding: spacing.xl, paddingBottom: 60 },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  lead: { fontSize: 17, fontFamily: fonts.headingRegular, color: colors.text, lineHeight: 24, textAlign: 'center', marginBottom: spacing.sm },
  hint: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },

  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm },
  doneTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center' },
  // Yellow nudge prompting the user to run intel updates after a cellar import.
  doneIntelNudge: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  mergedBlock: { alignSelf: 'stretch', gap: spacing.xs, marginTop: spacing.xs },
  mergedLine: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text, textAlign: 'center', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowOff: { opacity: 0.4 },
  checkbox: { fontSize: 22, color: colors.textMuted },
  checkboxOn: { color: colors.gold },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  // quantity x format token after the wine name (e.g. 2x150).
  qtyFormat: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  rowMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: 2 },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted },
  // Small pill explaining why a row was pre-unticked (dup of cellar / import).
  rowTag: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },

  dedupNote: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.md },
  readWarning: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, lineHeight: 18, marginBottom: spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 4, marginBottom: spacing.xs },
  toggleLabel: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  // Storage-location step.
  locRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: spacing.sm },
  locName: { flex: 1, fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  locChevron: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.gold },
  newLocInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: spacing.md },
  homeExtRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  homeExtBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  homeExtBtnOn: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  homeExtText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted },
  homeExtTextOn: { color: colors.gold },
  backLink: { alignItems: 'center', paddingTop: spacing.md },
  backLinkText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
