import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { importCellarDocument, prepareImageBase64, parseCellarImport, parseCellarPdf, type ImportedCellarWine, type CellarImportWine } from '../../src/api/label';
import { fileToSheets, type ImportSheet } from '../../src/utils/cellarImportDecode';
import { parseKnownSource } from '../../src/utils/cellarImportProfiles';
import { addCellarWine, getCellarWines, updateCellarWine } from '../../src/api/cellar';
import { saveManualChosenWine } from '../../src/api/chosenWines';
import { parseVivinoReviews, type VivinoReview } from '../../src/utils/vivinoCsv';
import { fetchStorageLocations, createStorageLocation, createStorageCase, assignWineToCase } from '../../src/api/storageLocations';
import type { CellarWine, StorageLocation } from '../../src/types/wine';
import { bottleSizeCl } from '../../src/components/BottleSizePicker';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'sheets' | 'analyzing' | 'review' | 'location' | 'adding' | 'done' | 'reviews-done';

// The review + save now work on the rich CellarImportWine (carrying the case
// structure). The photo/screenshot path returns the simpler bottle shape, so
// lift it into a loose CellarImportWine.
function fromImported(w: ImportedCellarWine): CellarImportWine {
  return {
    producer: w.producer || null,
    wineName: w.wine_name || null,
    vintage: w.vintage ?? null,
    region: w.region || null,
    country: null,
    colour: null,
    bottleSizeMl: w.bottle_size_ml ?? 750,
    totalBottles: Number.isFinite(w.quantity) && w.quantity > 0 ? w.quantity : 1,
    packaging: 'loose',
    bottlesPerCase: null,
    cases: null,
    looseBottles: w.quantity,
    drinkingWindowFrom: null,
    drinkingWindowTo: null,
    purchasePricePerBottle: w.purchase_price ?? null,
    currency: w.currency ?? null,
    notes: null,
  };
}

// True when a holding is a real case (a complete case of >1 bottle) — a single
// bottle sold "as a case" of 1 is treated as loose.
function isCased(w: CellarImportWine): boolean {
  return (w.packaging === 'owc' || w.packaging === 'non_owc') && (w.bottlesPerCase ?? 0) > 1;
}
function caseSummary(w: CellarImportWine, cl: (ml: number) => string): string {
  const kind = w.packaging === 'non_owc' ? 'Non-OWC' : 'OWC';
  const prefix = w.cases && w.cases > 1 ? `${w.cases} × ` : '';
  return `${prefix}${kind} of ${w.bottlesPerCase} · ${cl(w.bottleSizeMl)}cl`;
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
    hint: 'Choose an Excel spreadsheet (.xlsx, .xls), a CSV, or a storage invoice / reserves statement (PDF). Exported from Numbers or Google Sheets? Save it as Excel or CSV first. Vinster reads the columns wherever they are, as long as the top row names them.',
    steps: null,
    hasLabelImages: false,
  },
};

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
// Case-insensitive identity key. Producer + name are combined into one string
// so a wine whose full name sits in `producer` (merchant lists) still matches
// the same wine held as producer + wine_name (cellar rows / cuvée splits).
function wineKey(w: { producer?: string | null; wineName?: string | null; wine_name?: string | null; vintage?: string | number | null }): string {
  const name = [w.producer, w.wineName ?? w.wine_name].map(norm).filter(Boolean).join(' ');
  return `${name}|${String(w.vintage ?? '').trim()}`;
}

export default function ImportCellarScreen() {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const defaultCurrency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  // Entry source from the "Upload Cellar Document" chooser: camera / library
  // (photo → OCR) or vivino (a Vivino CSV export → parse).
  const { source } = useLocalSearchParams<{ source?: 'camera' | 'library' | 'vivino' | 'cellartracker' | 'file' }>();
  // The three CSV/spreadsheet sources share one flow; only the on-screen copy
  // (name, export steps, label-image caveat) differs — driven by CSV_SOURCES.
  const csv = source && source in CSV_SOURCES ? CSV_SOURCES[source as CsvSource] : null;
  const isCsv = csv !== null;

  const [stage, setStage] = useState<Stage>('capture');
  const [wines, setWines] = useState<CellarImportWine[]>([]);
  const [keep, setKeep] = useState<boolean[]>([]);
  const [dupFlags, setDupFlags] = useState<DupFlag[]>([]);
  const [addedCount, setAddedCount] = useState(0);
  // How many bottles were merged into wines already in the cellar (for the
  // done-screen summary). Set on a successful import.
  const [mergedBottles, setMergedBottles] = useState(0);
  // Existing cellar wines keyed by identity, so a 'cellar' duplicate can be
  // merged into its existing row (bottle count += imported qty) rather than
  // spawning a parallel cellar line.
  const existingByKey = useRef<Map<string, CellarWine>>(new Map());
  // Multi-sheet workbooks (e.g. a portfolio spanning several accounts) let the
  // user choose which lists to import before parsing.
  const [sheets, setSheets] = useState<ImportSheet[]>([]);
  const [sheetKeep, setSheetKeep] = useState<boolean[]>([]);
  // Storage location the import is filed into (cased holdings become OWC cases
  // there; loose bottles are filed to it; "unplaced" skips it entirely).
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [newLocationName, setNewLocationName] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  // Vivino reviews import summary (matched onto cellar wines vs added as
  // standalone "other" reviews vs skipped because already reviewed).
  const [reviewSummary, setReviewSummary] = useState<{ matched: number; added: number; skipped: number } | null>(null);

  // Auto-open the right picker so the chooser → this screen → picker feels like
  // one action. Vivino stays on the instructions screen (the user needs to have
  // exported the CSV first). Runs once.
  const didAuto = useRef(false);
  useEffect(() => {
    if (didAuto.current) return;
    didAuto.current = true;
    if (source === 'camera') void pick('camera');
    else if (source === 'library') void pick('library');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  async function pick(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1, allowsMultipleSelection: source === 'library' };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      await analyze(result.assets.map((a) => a.uri));
    } catch (err) {
      showAlert({ title: 'Could not open picker', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function analyze(uris: string[]) {
    setStage('analyzing');
    try {
      // Read each screenshot in parallel; merge the extracted wines (cellar
      // lists often span several screens).
      const results = await Promise.all(uris.map(async (uri) => {
        const base64 = await prepareImageBase64(uri);
        const { wines: w } = await importCellarDocument(base64);
        return w ?? [];
      }));
      const all = results.flat();
      await presentWines(all.map(fromImported));
    } catch (err) {
      showAlert({ title: 'Could not read the screenshot', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  // Pre-tick logic shared by every import source. Everything is ticked by
  // default. Wines already in the cellar stay ticked but are flagged 'cellar' —
  // on confirm their bottles are MERGED into the existing listing rather than
  // creating a parallel line. Wines repeated within this same import are
  // pre-unticked ('import') so we don't double-count the same row twice.
  async function presentWines(all: CellarImportWine[]) {
    const map = new Map<string, CellarWine>();
    const userId = session?.user.id;
    if (userId) {
      try {
        const existing = await getCellarWines(userId);
        for (const e of existing) { const k = wineKey(e); if (!map.has(k)) map.set(k, e); }
      } catch { /* best-effort — don't block the import if the cellar can't be read */ }
    }
    existingByKey.current = map;
    const seen = new Set<string>();
    const flags: DupFlag[] = [];
    const initialKeep: boolean[] = [];
    for (const w of all) {
      const k = wineKey(w);
      const flag: DupFlag = map.has(k) ? 'cellar' : seen.has(k) ? 'import' : null;
      seen.add(k);
      flags.push(flag);
      // Tick new wines and cellar-merges; untick within-import repeats.
      initialKeep.push(flag !== 'import');
    }
    setWines(all);
    setDupFlags(flags);
    setKeep(initialKeep);
    setStage('review');
  }

  // "How to import from {source}" — the exact export steps for the current CSV
  // source. Vivino's route (Settings → Account Management → Export Your Data)
  // works on the free tier; CellarTracker's is My Cellar → Export on desktop.
  function showCsvSteps() {
    if (!csv?.steps) return;
    showAlert({
      title: `How to import from ${csv.name}`,
      body: csv.steps,
      note: csv.stepsNote,
      buttons: [{ text: 'Got it' }],
    });
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
        const wines = await parseCellarPdf(await new File(asset.uri).base64(), asset.name ?? 'PDF');
        if (wines.length === 0) {
          showAlert({ title: "Couldn't read that PDF", body: "Vinster couldn't find any wine holdings in that document. If it's a scanned image, try a clearer copy or a spreadsheet export instead." });
          setStage('capture');
          return;
        }
        await presentWines(wines);
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
          body: "We couldn't find any rows in that file. Make sure it's an Excel or CSV spreadsheet with a header row naming the columns, and try again.",
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
  // extract every rated/reviewed wine, and either write the review onto the
  // matching cellar wine or keep it as a standalone "other" review so nothing's
  // lost. Never clobbers a review already written in Vinster.
  async function pickReviewsFile() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/tab-separated-values', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      setStage('analyzing');
      const asset = res.assets[0];
      const bytes = await new File(asset.uri).bytes();
      const base64 = await new File(asset.uri).base64();
      const parsedSheets = fileToSheets(bytes, asset.name ?? 'file', base64);
      const reviews = parseVivinoReviews(parsedSheets[0]?.rows ?? []);
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
      const cellar = await getCellarWines(userId);
      const byKey = new Map<string, CellarWine>();
      for (const w of cellar) { const k = wineKey(w); if (!byKey.has(k)) byKey.set(k, w); }
      let matched = 0, added = 0, skipped = 0;
      for (const rv of reviews) {
        const existing = byKey.get(wineKey({ producer: rv.producer, wineName: rv.wineName, vintage: rv.vintage }));
        if (existing) {
          // Don't overwrite a review the user has already written in Vinster.
          if (existing.review_score != null || (existing.review_note && existing.review_note.trim())) { skipped++; continue; }
          await updateCellarWine(existing.id, {
            review_score: rv.score,
            review_note: rv.reviewNote,
            user_notes: rv.personalNote,
            review_location: rv.location,
            review_date: rv.date,
          });
          matched++;
        } else {
          await saveManualChosenWine(userId, {
            wineName: rv.wineName || rv.producer,
            producer: rv.producer,
            region: '',
            vintage: rv.vintage ? (parseInt(rv.vintage, 10) || null) : null,
            restaurantName: '',
            city: rv.location ?? '',
            listPrice: null,
            currency: defaultCurrency,
            tastingNote: rv.reviewNote ?? '',
            otherObservations: rv.personalNote ?? '',
            userScore: rv.score,
            isFavourite: false,
            source: 'other',
            reviewDate: rv.date,
          });
          added++;
        }
      }
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      setReviewSummary({ matched, added, skipped });
      setStage('reviews-done');
    } catch (err) {
      showAlert({ title: 'Could not import reviews', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  // Parse the chosen sheets: a recognised merchant export maps exactly in code;
  // anything else goes to the intelligent (Claude) parser. Both return the same
  // wine shape, which we fold into the shared review list.
  async function processSheets(selected: ImportSheet[]) {
    setStage('analyzing');
    try {
      const all: CellarImportWine[] = [];
      for (const sheet of selected) {
        const known = parseKnownSource(sheet.rows);
        const wines = known ? known.wines : await parseCellarImport(sheet.tsv, sheet.name);
        all.push(...wines);
      }
      if (all.length === 0) {
        showAlert({
          title: "Couldn't read that list",
          body: "We couldn't find any wines. Make sure the sheet has a header row naming the columns (producer, wine, vintage, quantity…) and try again.",
        });
        setStage('capture');
        return;
      }
      await presentWines(all);
    } catch (err) {
      showAlert({ title: 'Could not read the list', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  const keptCount = keep.filter(Boolean).length;
  // Whether any kept wine is a real case — drives whether the location step is
  // worth showing (loose-only imports can just go unplaced).
  const keptHasCase = wines.some((w, i) => keep[i] && isCased(w));

  async function loadLocations() {
    const userId = session?.user.id;
    if (!userId) return;
    try { setLocations(await fetchStorageLocations(userId)); } catch { /* offer create-new only */ }
  }

  // Move from the review to the location step (fetches existing locations first).
  function goToLocationStep() {
    if (keptCount === 0) return;
    setNewLocationName('');
    void loadLocations();
    setStage('location');
  }

  // Create a new storage location, then import into it.
  async function createLocationAndImport() {
    const userId = session?.user.id;
    const name = newLocationName.trim();
    if (!userId || !name || savingLocation) return;
    setSavingLocation(true);
    try {
      const loc = await createStorageLocation(userId, name);
      await confirmImport(loc.id);
    } catch (err) {
      showAlert({ title: 'Could not create location', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingLocation(false);
    }
  }

  // Materialize the import. `locationId` null → wines land unplaced (loose, no
  // location); otherwise every wine is filed into that location and each cased
  // holding also becomes an OWC / non-OWC case there.
  async function confirmImport(locationId: string | null) {
    if (!session?.user.id || keptCount === 0) return;
    setStage('adding');
    const userId = session.user.id;
    // Work over ORIGINAL indices so that if an insert throws partway we can drop
    // exactly the rows already committed. Without this, a mid-loop failure left
    // the full kept list intact, so re-tapping "Add" re-inserted everything that
    // had already landed → duplicate cellar lines.
    const keptIndices = wines.map((_, i) => i).filter((i) => keep[i]);
    const succeeded: number[] = [];
    let bottlesAdded = 0;
    let mergedBottlesRun = 0;
    // Running per-existing-wine target quantity, so several imported rows that
    // map to the same cellar wine accumulate instead of clobbering each other.
    const mergeTotals = new Map<string, number>();
    try {
      // Bulk add identity + quantity + price. No per-wine AI enrichment here —
      // a cellar import can be dozens of wines; the user can generate intel on
      // any wine later from its card.
      for (const i of keptIndices) {
        const w = wines[i];
        const qty = Number.isFinite(w.totalBottles) && w.totalBottles > 0 ? Math.round(w.totalBottles) : 1;
        // Duplicate of an existing cellar wine → add these bottles to that
        // listing rather than creating a new one.
        const existing = dupFlags[i] === 'cellar' ? existingByKey.current.get(wineKey(w)) : undefined;
        if (existing) {
          const base = mergeTotals.get(existing.id) ?? (existing.quantity ?? 0);
          const next = base + qty;
          mergeTotals.set(existing.id, next);
          await updateCellarWine(existing.id, { quantity: next });
          succeeded.push(i);
          bottlesAdded += qty;
          mergedBottlesRun += qty;
          continue;
        }
        const dwFrom = w.drinkingWindowFrom ? parseInt(w.drinkingWindowFrom, 10) : null;
        const dwTo = w.drinkingWindowTo ? parseInt(w.drinkingWindowTo, 10) : null;
        const saved = await addCellarWine({
          user_id: userId,
          wine_name: (w.wineName || w.producer || '').trim(),
          producer: w.wineName ? (w.producer ?? null) : null,
          region: w.region ?? null,
          vintage: w.vintage ?? null,
          quantity: qty,
          storage_location: null,
          storage_location_id: locationId ?? null,
          date_received: new Date().toISOString().split('T')[0],
          critic_score: null,
          critic_score_note: null,
          drinking_window_from: Number.isFinite(dwFrom as number) ? dwFrom : null,
          drinking_window_to: Number.isFinite(dwTo as number) ? dwTo : null,
          drinking_window_status: 'unknown',
          tasting_notes: null,
          grape_variety: null,
          label_image_path: null,
          user_notes: null,
          is_wishlist: false,
          estimated_value: null,
          estimated_value_currency: null,
          estimated_value_at: null,
          purchase_price: w.purchasePricePerBottle ?? null,
          purchase_price_currency: w.purchasePricePerBottle != null ? (w.currency ?? defaultCurrency) : null,
          bottle_size_ml: w.bottleSizeMl ?? 750,
        } as any);
        // Cased holding + a chosen location → create the OWC/non-OWC case and
        // file the wine into it. Non-fatal: a failure still leaves the wine
        // filed loose in the location.
        if (locationId && isCased(w)) {
          try {
            const kind = w.packaging === 'non_owc' ? 'non_owc' : 'owc';
            const name = caseSummary(w, bottleSizeCl);
            const created = await createStorageCase(userId, { storageLocationId: locationId, name, kind });
            await assignWineToCase(saved.id, created.id);
          } catch { /* wine stays loose in the location */ }
        }
        succeeded.push(i);
        bottlesAdded += qty;
      }
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      if (locationId) {
        qc.invalidateQueries({ queryKey: ['storage-location-wines', locationId] });
        qc.invalidateQueries({ queryKey: ['storage-location-cases', locationId] });
        qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
      }
      setAddedCount((prev) => prev + bottlesAdded);
      setMergedBottles((prev) => prev + mergedBottlesRun);
      setStage('done');
    } catch (err) {
      console.warn('import-cellar: partial failure after', succeeded.length, 'of', keptIndices.length, err);
      // Drop the rows we already committed so a retry only adds the remainder.
      if (succeeded.length) {
        const done = new Set(succeeded);
        setWines((prev) => prev.filter((_, i) => !done.has(i)));
        setKeep((prev) => prev.filter((_, i) => !done.has(i)));
        setDupFlags((prev) => prev.filter((_, i) => !done.has(i)));
        setAddedCount((prev) => prev + bottlesAdded);
        setMergedBottles((prev) => prev + mergedBottlesRun);
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
      }
      showAlert({
        title: succeeded.length ? 'Imported some, then hit a snag' : 'Could not import',
        body: `${succeeded.length ? `${bottlesAdded} bottle${bottlesAdded === 1 ? '' : 's'} added. The rest are still listed — tap Add to retry them. ` : ''}${err instanceof Error ? err.message : 'Please try again.'}`,
      });
      setStage('review');
    }
  }

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
        csv ? (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.lead}>{csv.lead}</Text>
            <Text style={styles.hint}>{csv.hint}</Text>
            {csv.steps ? (
              <TouchableOpacity onPress={showCsvSteps} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.howToLink}>How to import from {csv.name}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.primaryBtn} onPress={pickCsvFile} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>{csv.name === 'File' ? 'Choose a file' : `Choose ${csv.name} export file`}</Text>
            </TouchableOpacity>
            {source === 'vivino' ? (
              <>
                <TouchableOpacity style={styles.secondaryBtn} onPress={pickReviewsFile} activeOpacity={0.85}>
                  <Text style={styles.secondaryBtnText}>Import my ratings & reviews</Text>
                </TouchableOpacity>
                <Text style={styles.footnote}>Your Vivino ratings and tasting notes come across too — use "Import my ratings & reviews" and choose your full wine list. Reviews are matched to your cellar wines; the rest are kept as Other reviews.</Text>
              </>
            ) : null}
            {!csv.hasLabelImages ? (
              <Text style={styles.footnote}>As {csv.name === 'File' ? 'spreadsheets do' : `${csv.name} does`} not save label images you will have to update your labels in Vinster later.</Text>
            ) : null}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.lead}>
              Vinster can upload cellar lists from invoices, storage certificates, or wine apps, as
              long as they are clear screenshots or photos.
            </Text>
            <Text style={styles.hint}>Pick several screenshots at once if your list spans more than one screen.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => pick('library')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Upload Screenshot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => pick('camera')} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Take Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        )
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
          <Text style={styles.hint}>Vinster is reading your cellar list…</Text>
        </View>
      ) : stage === 'location' ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>Where are these stored?</Text>
          <Text style={styles.dedupNote}>
            {keptHasCase
              ? 'Filed into this location — full cases become OWC cases here, loose bottles are filed alongside. Or import them unplaced and organise later.'
              : 'File these into a storage location, or import them unplaced and organise later.'}
          </Text>
          {locations.map((loc) => (
            <TouchableOpacity key={loc.id} style={styles.locRow} onPress={() => confirmImport(loc.id)} activeOpacity={0.7}>
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
          <TouchableOpacity
            style={[styles.primaryBtn, (!newLocationName.trim() || savingLocation) && styles.primaryBtnDisabled]}
            onPress={createLocationAndImport}
            disabled={!newLocationName.trim() || savingLocation}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>{savingLocation ? 'Creating…' : 'Create & import here'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => confirmImport(null)} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Import unplaced</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => setStage('review')} activeOpacity={0.7}>
            <Text style={styles.backLinkText}>← Back to review</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : stage === 'adding' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Adding your wines…</Text>
        </View>
      ) : stage === 'done' ? (
        <View style={styles.centerBlock}>
          <Text style={styles.doneTitle}>Cellar imported</Text>
          <Text style={styles.hint}>
            {addedCount} bottle{addedCount === 1 ? '' : 's'} added{mergedBottles > 0 ? ` — ${mergedBottles} of them merged into wines already in your cellar` : ''}. Open each wine in your Cellar List to place the wines, or add them to a Location filter.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/cellar/list')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>View Cellar List</Text>
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
              ? `${reviewSummary.matched} review${reviewSummary.matched === 1 ? '' : 's'} added to wines in your cellar${reviewSummary.added > 0 ? `, ${reviewSummary.added} kept as Other reviews` : ''}${reviewSummary.skipped > 0 ? `. ${reviewSummary.skipped} were skipped (already reviewed in Vinster)` : ''}. Find them on each wine card and in Dine · Wine Reviews.`
              : 'Your reviews have been imported.'}
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/wines/chosen')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>View Wine Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)/cellar')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // review
        <ScrollView contentContainerStyle={styles.content}>
          {wines.length === 0 ? (
            <Text style={styles.hint}>Vinster couldn't read any wines from that image. Try a clearer screenshot showing the wine names.</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Found {wines.length} wine{wines.length === 1 ? '' : 's'} — tap to include or skip</Text>
              {dupFlags.some(Boolean) ? (
                <Text style={styles.dedupNote}>
                  Wines already in your cellar stay ticked — their bottles are added to your existing listing, not duplicated. Wines repeated within this import are unticked to avoid double-counting. Tap any row to change it.
                </Text>
              ) : null}
              {wines.map((w, i) => {
                const on = keep[i];
                const flag = dupFlags[i];
                const qty = Number.isFinite(w.totalBottles) && w.totalBottles > 0 ? Math.round(w.totalBottles) : 1;
                const label = [w.vintage, w.producer, w.wineName].filter(Boolean).join(' ');
                // quantity x format, matching the cellar list (e.g. 1x75, 2x150).
                const qtyFormat = `${qty}x${bottleSizeCl(w.bottleSizeMl)}`;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.row, !on && styles.rowOff]}
                    onPress={() => setKeep((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.checkbox, on && styles.checkboxOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>{label || 'Unnamed wine'}  <Text style={styles.qtyFormat}>{qtyFormat}</Text></Text>
                      <View style={styles.rowMetaRow}>
                        {isCased(w) ? <Text style={styles.rowCase}>{caseSummary(w, bottleSizeCl)}</Text> : null}
                        {w.region ? <Text style={styles.rowMeta} numberOfLines={1}>{w.region}</Text> : null}
                        {flag ? <Text style={styles.rowTag}>{flag === 'cellar' ? `Already in cellar · +${qty} to existing` : 'Repeated above'}</Text> : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

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
        </ScrollView>
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
  howToLink: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center', marginBottom: spacing.md },
  footnote: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginTop: spacing.lg },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm },
  doneTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center' },
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
  // Case breakdown line under a wine on the review screen.
  rowCase: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold },
  dedupNote: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.md },
  // Storage-location step.
  locRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginBottom: spacing.sm },
  locName: { flex: 1, fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  locChevron: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.gold },
  newLocInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: spacing.md },
  backLink: { alignItems: 'center', paddingTop: spacing.md },
  backLinkText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
