import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions, ActivityIndicator, Modal, Keyboard, Animated } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { showAlert } from '../../../src/components/AppAlert';
import { detectPlacementMismatch, placementWarningBody } from '../../../src/components/BottleSizePicker';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { useRack, useRacks } from '../../../src/hooks/useRacks';
import { useRackStore } from '../../../src/stores/rackStore';
import { useLineupStore } from '../../../src/stores/lineupStore';
import { useCellar } from '../../../src/hooks/useCellar';
import { useCustomFilters } from '../../../src/hooks/useCustomFilters';
import { assignSlot, assignSlots, clearSlot, clearWineFromRacks, removeSlotsForWine } from '../../../src/api/racks';
import { addCellarWineRemoval, addCellarWine } from '../../../src/api/cellar';
import { supabase } from '../../../src/api/supabase';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { prepareImageBase64, scanLabel } from '../../../src/api/label';
import { useLabelStore } from '../../../src/stores/labelStore';
import { CellarWinePicker } from '../../../src/components/CellarWinePicker';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { effectiveMaturity } from '../../../src/utils/maturity';
import { RenameModal } from '../../../src/components/RenameModal';
import { LabelThumb } from '../../../src/components/LabelThumb';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { RackSlot, CellarWine } from '../../../src/types/wine';
import * as ScreenOrientation from 'expo-screen-orientation';

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// Lets the rack search match a wine's drinking-window status as well as its
// producer / name / region / vintage. Each status maps to the words a user
// might type for it.
const STATUS_SEARCH: { status: string; terms: string[] }[] = [
  { status: 'too_young', terms: ['too young', 'young', 'hold'] },
  { status: 'approaching', terms: ['approaching', 'approach'] },
  { status: 'peak', terms: ['peak', 'drinking now', 'drink now', 'ready', 'drinking'] },
  { status: 'declining', terms: ['declining', 'decline', 'fading', 'past peak'] },
];

// Readiness-for-drinking options for the Maturity filter chip.
const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'too_young', label: 'Too Young' },
  { value: 'approaching', label: 'Approaching' },
  { value: 'peak', label: 'Peak' },
  { value: 'declining', label: 'Declining' },
];

export default function RackGridScreen() {
  const { rackId, highlight, lineup } = useLocalSearchParams<{ rackId: string; highlight?: string; lineup?: string }>();
  const navigation = useNavigation();
  const { session } = useAuth();
  const { slots, isLoading, assign } = useRack(rackId);
  const { racks, remove: removeRack, rename: renameRackMutation, wipe: wipeRackMutation } = useRacks();
  // useCellar gives us access to updateWine so we can bump the wine's
  // quantity when the user places multiple bottles from this screen.
  const { wines, updateWine } = useCellar();
  const { width, height } = useWindowDimensions();
  const qc = useQueryClient();

  const { pendingSlot, setPendingSlot, pendingSlots, setPendingSlots, pendingWineId, setPendingWineId, pendingAddMode, setPendingAddMode, pendingMove, setPendingMove } = useRackStore();
  const { customFilters, create: createFilter, setWines: setFilterWines, rename: renameFilter, remove: removeFilter } = useCustomFilters(rackId);
  const [highlightedWineId, setHighlightedWineId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Custom filters (named collections of wines) — now surfaced as chips in the
  // filter carousel, plus the create flow.
  const [activeCustomFilterId, setActiveCustomFilterId] = useState<string | null>(null);
  const [createFilterOpen, setCreateFilterOpen] = useState(false);
  // Non-null when the create/edit modal is editing an existing filter rather
  // than creating a new one — drives the save branch + modal title/button.
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  // Maturity (readiness-for-drinking) filter chip + its dropdown.
  const [maturityHighlight, setMaturityHighlight] = useState<string>('');
  const [maturityOpen, setMaturityOpen] = useState(false);
  const [filterNameDraft, setFilterNameDraft] = useState('');
  // Standalone "Rename Filter" sheet (separate from the Add/Remove Wines editor).
  const [renameFilterTarget, setRenameFilterTarget] = useState<{ id: string; name: string } | null>(null);
  const [renamingFilter, setRenamingFilter] = useState(false);
  const [selectedWineIds, setSelectedWineIds] = useState<Set<string>>(new Set());
  // Snapshot of the wines selected when the editor opened — used only to order
  // the picker (already-in-filter wines first), so rows don't jump as the user
  // ticks/unticks. Live ticks go to selectedWineIds.
  const [pickerInitialSelected, setPickerInitialSelected] = useState<Set<string>>(new Set());
  const [savingFilter, setSavingFilter] = useState(false);
  const [bottleListOpen, setBottleListOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  // The in-progress move lives in the rack store (see rackStore) so it
  // survives navigating to another rack — pick up on rack A, drop on rack B.
  const moving = pendingMove;
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  // "Archive Wine" on a multi-bottle wine → ask how many (or Archive All).
  const [archiveModal, setArchiveModal] = useState<{ wineId: string; wineName: string; qty: number } | null>(null);
  const [archiveCount, setArchiveCount] = useState('1');
  const [archiving, setArchiving] = useState(false);
  // "Delete Wine (Permanent)" on a multi-bottle wine → ask how many (or Delete All).
  const [deleteModal, setDeleteModal] = useState<{ wineId: string; wineName: string; qty: number } | null>(null);
  const [deleteCount, setDeleteCount] = useState('1');
  const [deleting, setDeleting] = useState(false);
  // Placement modal — shown when the user taps an empty slot with a
  // pending wine. Asks how many bottles and (when > 1) orientation.
  const [placingAt, setPlacingAt] = useState<{ row: number; col: number; wineId: string } | null>(null);
  const [placeCount, setPlaceCount] = useState('1');
  const [placeOrientation, setPlaceOrientation] = useState<'Vertical' | 'Horizontal'>('Vertical');
  const [placing, setPlacing] = useState(false);
  // "Add More Bottles" asks how many UP FRONT (one pop-up), then a single tap
  // places that many — no second modal after the tap. addMoreUpfront drives the
  // upfront pop-up; placePrechosen flags that the count's already chosen so the
  // slot tap places straight away.
  const [addMoreUpfront, setAddMoreUpfront] = useState<{ wineId: string; wineName: string } | null>(null);
  const [placePrechosen, setPlacePrechosen] = useState(false);
  // Empty-slot "what would you like to add?" chooser + the cellar-wine picker
  // and the upload-in-progress spinner it can open.
  const { setImage, setWineDetails, setError: setLabelError } = useLabelStore();
  const [slotChooser, setSlotChooser] = useState<{ row: number; col: number } | null>(null);
  // Multi-slot placement: long-press an empty slot to start selecting a set of
  // slots, then place the SAME wine into all of them. Keys are "row,col".
  const [multiSlots, setMultiSlots] = useState<Set<string>>(new Set());
  const multiSelectMode = multiSlots.size > 0;
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [slotUploading, setSlotUploading] = useState(false);
  // "Add a Lineup" setup: pick the start slot + orientation before scanning.
  const [lineupSetup, setLineupSetup] = useState(false);
  const [lineupOrientation, setLineupOrientation] = useState<'Vertical' | 'Horizontal'>('Vertical');
  // Edit-rack modal — Wipe Contents / Rename / Delete.
  const [editOpen, setEditOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');

  // Auto-clear the "Wine saved to rack" confirmation after a few seconds.
  useEffect(() => {
    if (!savedMsg) return;
    const t = setTimeout(() => setSavedMsg(null), 3000);
    return () => clearTimeout(t);
  }, [savedMsg]);


  // Unlock landscape for this screen; restore portrait on leave
  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});
    const sub = ScreenOrientation.addOrientationChangeListener((e) => {
      const landscape = e.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        e.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsLandscape(landscape);
    });
    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  const rack = racks.find((r) => r.id === rackId);

  // Arrived via "Add a Lineup" from the Cellar List (?lineup=1) — auto-enter the
  // slot/orientation setup once the rack has loaded (once per mount).
  const lineupParamHandled = useRef(false);
  useEffect(() => {
    if (lineup === '1' && rack && !lineupParamHandled.current) {
      lineupParamHandled.current = true;
      setLineupOrientation(rack.storage_type === 'fridge' ? 'Horizontal' : 'Vertical');
      setLineupSetup(true);
    }
  }, [lineup, rack]);

  // Inter-rack swipe — mirrors the pattern in TabSwipeView: horizontal
  // pan with 30px activation threshold, fails on >30px vertical so the
  // inner vertical ScrollView still gets its turn. Tap-targets on the
  // arrow row provide a fallback for wide racks whose horizontal grid
  // scroll competes with the gesture, and for accessibility.
  const currentIndex = racks.findIndex((r) => r.id === rackId);
  const prevRack = currentIndex > 0 ? racks[currentIndex - 1] : null;
  const nextRack = currentIndex >= 0 && currentIndex < racks.length - 1 ? racks[currentIndex + 1] : null;
  // Clear search + highlight when the user swipes to another rack so
  // they don't carry over a stale query from the previous one.
  useEffect(() => {
    setSearchQuery('');
    setActiveCustomFilterId(null);
    setMaturityHighlight('');
    setMaturityOpen(false);
    setBottleListOpen(false);
    // Highlight the bottle the user came in to find (e.g. from a wine card's
    // "In {rack} →" link), otherwise clear any carried-over highlight when
    // swiping to another rack.
    setHighlightedWineId(highlight ?? null);
    // Don't reset moving/pending placement state — those are global
    // workflows (Wish List → place in rack) that should survive a
    // sideways navigation.
  }, [rackId, highlight]);

  // ---- In-place pinch zoom ----
  // The inline rack grid pinch-zooms and pans within its clipped viewport,
  // like a photo in the phone gallery — no separate window. While zoomed, the
  // swipe-between-racks gesture AND the page scroll are disabled so a
  // one-finger drag pans the grid in any direction. RN Animated on the JS
  // thread via runOnJS (no Reanimated). zBase = committed at gesture start;
  // zCur = live.
  const [isZoomed, setIsZoomed] = useState(false);
  const zScale = useRef(new Animated.Value(1)).current;
  const zTx = useRef(new Animated.Value(0)).current;
  const zTy = useRef(new Animated.Value(0)).current;
  const zBase = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const zCur = useRef({ scale: 1, tx: 0, ty: 0 }).current;

  function resetZoom() {
    zBase.scale = 1; zCur.scale = 1; zBase.tx = 0; zBase.ty = 0; zCur.tx = 0; zCur.ty = 0;
    Animated.parallel([
      Animated.timing(zScale, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.timing(zTx, { toValue: 0, duration: 180, useNativeDriver: false }),
      Animated.timing(zTy, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start();
    setIsZoomed(false);
  }

  // Cream-box (viewport) + grid (content) sizes, captured on layout. Used to
  // clamp the pan so the grid can never be dragged past its own edges and
  // out of the clipped box (which left only the cream surround visible).
  const vpSize = useRef({ w: 0, h: 0 });
  const contentSize = useRef({ w: 0, h: 0 });
  function clampPan(tx: number, ty: number, scale: number) {
    const maxX = Math.max(0, (contentSize.current.w * scale - vpSize.current.w) / 2);
    const maxY = Math.max(0, (contentSize.current.h * scale - vpSize.current.h) / 2);
    return {
      tx: Math.min(maxX, Math.max(-maxX, tx)),
      ty: Math.min(maxY, Math.max(-maxY, ty)),
    };
  }

  // Swipe between racks — only at rest; disabled while zoomed.
  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isZoomed)
        .activeOffsetX([-30, 30])
        .failOffsetY([-30, 30])
        .runOnJS(true)
        .onEnd((e) => {
          if (e.translationX < -80 && nextRack) {
            router.replace(`/cellar/rack/${nextRack.id}` as any);
          } else if (e.translationX > 80 && prevRack) {
            router.replace(`/cellar/rack/${prevRack.id}` as any);
          }
        }),
    [prevRack?.id, nextRack?.id, isZoomed],
  );

  // Inline grid zoom: pinch (any time) + one-finger pan (only when zoomed).
  const inlineZoomGesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => {
        let s = zBase.scale * e.scale;
        if (s < 1) s = 1;
        if (s > 5) s = 5;
        zCur.scale = s;
        zScale.setValue(s);
        // Keep the pan within the new scale's bounds (zooming out shrinks them).
        const c = clampPan(zCur.tx, zCur.ty, s);
        zCur.tx = c.tx; zCur.ty = c.ty;
        zTx.setValue(c.tx); zTy.setValue(c.ty);
      })
      .onEnd(() => {
        zBase.scale = zCur.scale;
        zBase.tx = zCur.tx; zBase.ty = zCur.ty;
        if (zCur.scale <= 1.02) resetZoom();
        // A firm pinch (past ~1.5x) breaks the rack out into the full-screen
        // overlay; a gentler pinch just zooms within the inline box.
        else if (zCur.scale >= 1.5) openFullScreen(zCur.scale);
        else if (!isZoomed) setIsZoomed(true);
      });
    const pan = Gesture.Pan()
      .enabled(isZoomed)
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        const c = clampPan(zBase.tx + e.translationX, zBase.ty + e.translationY, zCur.scale);
        zCur.tx = c.tx; zCur.ty = c.ty;
        zTx.setValue(c.tx);
        zTy.setValue(c.ty);
      })
      .onEnd(() => { zBase.tx = zCur.tx; zBase.ty = zCur.ty; });
    return Gesture.Simultaneous(pinch, pan);
  }, [isZoomed]);

  // ---- Full-screen zoom ----
  // A hard pinch on the inline rack (past the threshold in the inline onEnd)
  // promotes into a full-screen overlay where the grid can zoom/pan to the
  // screen edges — the inline box clips, this doesn't. Pinch back to ~1x to
  // drop back to the inline rack. Separate animated values from the inline
  // zoom so the two never interfere.
  const [fullScreen, setFullScreen] = useState(false);
  const fsScale = useRef(new Animated.Value(1)).current;
  const fsTx = useRef(new Animated.Value(0)).current;
  const fsTy = useRef(new Animated.Value(0)).current;
  const fsBase = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const fsCur = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const fsContent = useRef({ w: 0, h: 0 });

  function clampPanFS(tx: number, ty: number, scale: number) {
    const maxX = Math.max(0, (fsContent.current.w * scale - width) / 2);
    const maxY = Math.max(0, (fsContent.current.h * scale - height) / 2);
    return { tx: Math.min(maxX, Math.max(-maxX, tx)), ty: Math.min(maxY, Math.max(-maxY, ty)) };
  }

  function openFullScreen(startScale: number) {
    const s = Math.min(5, Math.max(1.6, startScale));
    fsBase.scale = s; fsCur.scale = s; fsBase.tx = 0; fsBase.ty = 0; fsCur.tx = 0; fsCur.ty = 0;
    fsScale.setValue(s); fsTx.setValue(0); fsTy.setValue(0);
    setFullScreen(true);
    resetZoom(); // collapse the inline rack sitting behind the overlay
  }

  function closeFullScreen() {
    fsBase.scale = 1; fsCur.scale = 1; fsBase.tx = 0; fsBase.ty = 0; fsCur.tx = 0; fsCur.ty = 0;
    fsScale.setValue(1); fsTx.setValue(0); fsTy.setValue(0);
    setFullScreen(false);
  }

  const fsZoomGesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => {
        let s = fsBase.scale * e.scale;
        if (s < 1) s = 1;
        if (s > 6) s = 6;
        fsCur.scale = s;
        fsScale.setValue(s);
        const c = clampPanFS(fsCur.tx, fsCur.ty, s);
        fsCur.tx = c.tx; fsCur.ty = c.ty;
        fsTx.setValue(c.tx); fsTy.setValue(c.ty);
      })
      .onEnd(() => {
        fsBase.scale = fsCur.scale; fsBase.tx = fsCur.tx; fsBase.ty = fsCur.ty;
        if (fsCur.scale <= 1.05) closeFullScreen();
      });
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        const c = clampPanFS(fsBase.tx + e.translationX, fsBase.ty + e.translationY, fsCur.scale);
        fsCur.tx = c.tx; fsCur.ty = c.ty;
        fsTx.setValue(c.tx); fsTy.setValue(c.ty);
      })
      .onEnd(() => { fsBase.tx = fsCur.tx; fsBase.ty = fsCur.ty; });
    return Gesture.Simultaneous(pinch, pan);
  }, [width, height]);

  // Back navigation. A rack can be reached two ways:
  //   1. Cellar → Racks → Rack (or via the Camera → Detect scanner flow),
  //      where the Racks landing page sits below us in the stack.
  //   2. Directly from a wine detail / cellar list (router.push), where
  //      there is NO Racks page in the stack at all.
  // dismissTo('/cellar/racks') is right for (1) — it collapses any scanner
  // screens and lands on the existing Racks page. But in case (2) dismissTo
  // falls back to PUSHING a fresh Racks page; its Back then returns here,
  // and our Back pushes Racks again — an infinite loop. So we only dismissTo
  // when a Racks route actually exists in the stack, otherwise plain back().
  function handleBack() {
    const state = navigation.getState?.();
    const hasRacks = state?.routes?.some((r) => r.name === 'cellar/racks') ?? false;
    if (hasRacks) {
      router.dismissTo('/cellar/racks');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/cellar');
    }
  }

  const slotMap = useMemo(() => {
    const map: Record<string, RackSlot> = {};
    slots.forEach((s) => { map[`${s.row_index},${s.col_index}`] = s; });
    return map;
  }, [slots]);

  // Build unique wine list from slots — used by the search list below the
  // grid. Wine names live in the slot cells themselves now (font scales to
  // slot size), so the list just carries name / region / bottle count.
  const winesInRack = useMemo(() => {
    const map = new Map<string, { wine: CellarWine; count: number }>();
    slots.forEach((s) => {
      const wine = s.wine as CellarWine | null | undefined;
      if (wine && s.cellar_wine_id) {
        const existing = map.get(s.cellar_wine_id);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(s.cellar_wine_id, { wine, count: 1 });
        }
      }
    });
    // Default order is recency — most recently added wines first — to match the
    // Full Cellar List and every other list view.
    return Array.from(map.values()).sort((a, b) =>
      new Date(b.wine.created_at).getTime() - new Date(a.wine.created_at).getTime()
    );
  }, [slots]);
  // Total bottles = occupied slots (each slot is one bottle).
  const rackBottleCount = useMemo(() => winesInRack.reduce((sum, w) => sum + w.count, 0), [winesInRack]);

  // Order for the filter wine-picker: wines already in the filter (when the
  // editor opened) first, then the rest — each group keeps the recency order
  // of winesInRack. Uses the open-time snapshot so rows don't reshuffle as the
  // user ticks.
  const pickerWines = useMemo(() => {
    const inFilter: typeof winesInRack = [];
    const rest: typeof winesInRack = [];
    for (const w of winesInRack) {
      (pickerInitialSelected.has(w.wine.id) ? inFilter : rest).push(w);
    }
    return [...inFilter, ...rest];
  }, [winesInRack, pickerInitialSelected]);

  const PADDING = spacing.xl * 2;
  const GAP = 4;
  const cols = rack?.cols ?? 1;
  // Natural size fills the screen width; minimum 20pt so slots remain tappable.
  // For wide racks the grid scrolls horizontally — no overflow clipping.
  const naturalSlotSize = Math.floor((width - PADDING - GAP * (cols - 1)) / cols);
  // Fit the whole rack to the screen width at rest; pinch-zoom lets the user
  // lean in to read individual labels. Tiny floor keeps slots non-zero.
  const slotSize = Math.max(16, naturalSlotSize);
  // Build the rows the grid will render. The optional large-format row
  // is row_index = -1 and sits above the standard rows; its slots take
  // up the same total width as the standard grid, so fewer slots means
  // each is proportionally wider.
  const standardTotalWidth = cols * slotSize + (cols - 1) * GAP;
  const largeFormatCols = rack?.large_format_cols ?? null;
  const largeFormatSlotSize = largeFormatCols && largeFormatCols > 0
    ? Math.floor((standardTotalWidth - GAP * (largeFormatCols - 1)) / largeFormatCols)
    : 0;
  const gridRows: Array<{ rowIndex: number; cols: number; slotWidth: number }> = [];
  if (largeFormatCols && largeFormatCols > 0) {
    gridRows.push({ rowIndex: -1, cols: largeFormatCols, slotWidth: largeFormatSlotSize });
  }
  for (let r = 0; r < (rack?.rows ?? 0); r++) {
    gridRows.push({ rowIndex: r, cols, slotWidth: slotSize });
  }
  // Slot font sizing scales with the slot — same clamp formula in both
  // the standard grid and the (typically wider) large-format row.
  function fontForSlot(size: number) {
    const fontSize = Math.max(8, Math.min(18, Math.floor(size * 0.22)));
    return { fontSize, lineHeight: fontSize + 2, maxChars: Math.max(10, Math.floor(size / 3.5)) };
  }

  // Long-press a slot: an occupied slot opens its action sheet (add-more /
  // move / archive); an empty slot starts (or extends) a multi-slot selection.
  function onLongPressSlot(row: number, col: number) {
    if (lineupSetup || moving) return;
    const slot = slotMap[`${row},${col}`];
    if (slot?.cellar_wine_id) { pickUpSlot(row, col); return; }
    setMultiSlots((prev) => {
      const next = new Set(prev);
      next.add(`${row},${col}`);
      return next;
    });
  }

  function toggleMultiSlot(row: number, col: number) {
    const slot = slotMap[`${row},${col}`];
    if (slot?.cellar_wine_id) return; // can only multi-select empty slots
    setMultiSlots((prev) => {
      const next = new Set(prev);
      const key = `${row},${col}`;
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // "Place a wine" from the multi-select bar: freeze the chosen slots into the
  // store (pendingSlots drives the placement screens) and open the source chooser.
  function placeIntoSelected() {
    if (!rack || multiSlots.size === 0) return;
    const slots = Array.from(multiSlots)
      .map((k) => { const [r, c] = k.split(',').map(Number); return { row: r, col: c }; })
      .sort((a, b) => (a.row - b.row) || (a.col - b.col));
    const first = slots[0];
    setPendingSlot({ rackId, row: first.row, col: first.col, rows: rack.rows, cols: rack.cols, largeFormatCols: rack.large_format_cols, largeFormatBottleSizeMl: rack.large_format_bottle_size_ml });
    setPendingSlots(slots);
    setMultiSlots(new Set());
    setSlotChooser(first);
  }

  function cancelMultiSelect() {
    setMultiSlots(new Set());
    setPendingSlots(null);
  }

  function openSlot(row: number, col: number) {
    // Multi-select in progress: taps toggle empty slots in/out of the set
    // rather than opening or navigating.
    if (multiSelectMode) { toggleMultiSlot(row, col); return; }
    // Lineup setup: the user is choosing the starting slot for "Add a Lineup".
    // Only an empty slot can be the start; record it + the orientation, then go
    // to scan/upload — which places the whole lineup from here.
    if (lineupSetup) {
      if (slotMap[`${row},${col}`]) return; // occupied — must start on a free slot
      useLineupStore.getState().start(rackId);
      useLineupStore.getState().setPlacement({ row, col }, lineupOrientation);
      setLineupSetup(false);
      router.push('/cellar/scan-lineup');
      return;
    }
    // If we're in the middle of a move, treat this tap as the drop target.
    if (moving) {
      // Tapping the source slot (on its own rack) cancels the move.
      if (moving.sourceRackId === rackId && moving.row === row && moving.col === col) {
        setPendingMove(null);
        return;
      }
      handleDrop(row, col);
      return;
    }
    const slot = slotMap[`${row},${col}`];
    const wine = slot?.wine as CellarWine | null | undefined;
    if (wine) {
      // Navigate to the same wine detail card that Cellar List uses, so
      // there's a single source of truth for the wine UI. The from=rack
      // hint tells the wine card to hide the "In {rack} →" affordance
      // (which would just point back to where we came from).
      router.push(`/cellar/${wine.id}?from=rack` as any);
    } else if (pendingWineId) {
      if (placePrechosen) {
        // "Add More Bottles" already asked how many up front — place straight
        // away at the tapped slot, no second pop-up.
        confirmPlacement({ row, col, wineId: pendingWineId });
      } else {
        // Ask the user how many bottles to place at this slot. The wine was
        // saved with quantity = 1 by default; if they place more here we'll
        // also bump the wine's quantity to match.
        setPlacingAt({ row, col, wineId: pendingWineId });
        setPlaceCount('1');
        setPlaceOrientation('Vertical');
      }
    } else {
      // Empty slot, nothing pending — offer the user a choice instead of
      // jumping straight to the camera. pendingSlot is set now so the scan /
      // upload / manual paths place into this slot automatically.
      setPendingSlot({ rackId, row, col, rows: rack.rows, cols: rack.cols, largeFormatCols: rack.large_format_cols, largeFormatBottleSizeMl: rack.large_format_bottle_size_ml });
      setSlotChooser({ row, col });
    }
  }

  // Upload a label screenshot to fill the tapped slot — mirrors the Cellar tab's
  // upload, then routes to Confirm (where pendingSlot drives placement).
  async function handleUploadForSlot() {
    if (!(await ensureMediaPermission('library'))) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets[0]) return;
      setSlotUploading(true);
      const uri = result.assets[0].uri;
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
    } catch (err) {
      setLabelError(err instanceof Error ? err.message : 'Failed to scan label');
    } finally {
      setSlotUploading(false);
    }
    router.push('/label/confirm?context=place');
  }

  // Place an EXISTING cellar wine (chosen in the picker) straight into the
  // tapped slot — or into every slot the user hand-picked in multi-select.
  async function placeExistingWine(wine: CellarWine) {
    if (!pendingSlot) return;
    const { rackId: rid, row, col } = pendingSlot;
    const targets = pendingSlots && pendingSlots.length > 0 ? pendingSlots : [{ row, col }];
    try {
      await assignSlots(rid, targets, wine.id);
      qc.invalidateQueries({ queryKey: ['rack-slots', rid] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      showAlert({
        title: targets.length > 1 ? `Placed in ${targets.length} slots` : 'Placed in this rack',
        body: `${wine.wine_name} is already in your Full Cellar List — it's now mapped to ${targets.length > 1 ? `${targets.length} slots` : 'a slot'} here too.`,
        buttons: [{ text: 'Done', style: 'cancel' }],
      });
    } catch (err) {
      showAlert({ title: 'Could not place wine', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setCellarPickerOpen(false);
      setPendingSlot(null);
      setPendingSlots(null);
    }
  }

  function computePlacementSlots(startRow: number, startCol: number, count: number, orient: 'Vertical' | 'Horizontal') {
    const result: Array<{ row: number; col: number }> = [];
    // Large-format row (row_index = -1) is a one-row band above the
    // standard grid. Cap placement to that row's width — magnums must
    // stay in their slots and never spill into 750ml slots below.
    if (startRow === -1) {
      const lfCols = rack?.large_format_cols ?? 0;
      let col = startCol;
      for (let i = 0; i < count; i++) {
        if (col >= lfCols) break;
        result.push({ row: -1, col });
        col++;
      }
      return result;
    }
    let row = startRow;
    let col = startCol;
    for (let i = 0; i < count; i++) {
      if (row >= rack!.rows || col >= rack!.cols) break;
      result.push({ row, col });
      if (orient === 'Horizontal') {
        col++;
        if (col >= rack!.cols) { col = 0; row++; }
      } else {
        row++;
        if (row >= rack!.rows) { row = 0; col++; }
      }
    }
    return result;
  }

  // `at` defaults to the placingAt modal's slot, but the upfront Add-More flow
  // passes the just-tapped slot directly (count already chosen, no modal).
  async function confirmPlacement(at: { row: number; col: number; wineId: string } | null = placingAt) {
    if (!at) return;
    Keyboard.dismiss();
    // Soft warning when the bottle's size doesn't match the slot's
    // expected size. Fires once before the placement runs — user can
    // continue and place anyway, or cancel back to the modal.
    const wineForCheck = wines.find((w) => w.id === at.wineId);
    if (wineForCheck && rack) {
      const mismatch = detectPlacementMismatch(
        wineForCheck.bottle_size_ml,
        at.row,
        rack.large_format_bottle_size_ml,
      );
      if (mismatch) {
        showAlert({
          title: 'Bottle size mismatch',
          body: placementWarningBody(mismatch),
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Place anyway', onPress: () => { void runPlacement(at); } },
          ],
        });
        return;
      }
    }
    void runPlacement(at);
  }

  async function runPlacement(at: { row: number; col: number; wineId: string } | null = placingAt) {
    if (!at) return;
    const requested = Math.max(1, parseInt(placeCount, 10) || 1);
    setPlacing(true);
    try {
      const slots = computePlacementSlots(at.row, at.col, requested, placeOrientation);
      // Skip any slots that are already occupied — assign one at a time
      // so an existing wine in the path doesn't blow up the whole batch.
      const freeSlots = slots.filter((s) => !slotMap[`${s.row},${s.col}`]?.cellar_wine_id);
      if (freeSlots.length === 0) {
        showAlert({ title: 'No empty slots', body: 'The next slots are already in use. Try a different starting position or orientation.' });
        setPlacing(false);
        return;
      }
      await assignSlots(rackId, freeSlots, at.wineId);

      const wine = wines.find((w) => w.id === at.wineId);
      if (pendingAddMode && wine) {
        // "+ Add bottles" flow — the wine already exists with N bottles,
        // we're adding M more. Increment quantity by the placed count.
        await updateWine.mutateAsync({ id: wine.id, updates: { quantity: wine.quantity + freeSlots.length } });
      } else if (wine && freeSlots.length > wine.quantity) {
        // First-time placement of a newly-added wine — the wine was saved
        // at qty=1 in the Add Wine modal, so a multi-bottle placement here
        // effectively backfills the count.
        await updateWine.mutateAsync({ id: wine.id, updates: { quantity: freeSlots.length } });
      }

      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setPendingWineId(null);
      setPlacingAt(null);
      setPlacePrechosen(false);

      const placed = freeSlots.length;
      if (pendingAddMode) {
        // "+ Add bottles" flow: confirm with a popup, then STAY on the live rack
        // so the user sees the bottles they just placed. (Previously this
        // router.dismiss(2)'d back, which over-popped to the Cellar tab when the
        // flow was started from the rack's own long-press — the stack only had
        // [Cellar tab, rack], so dismissing two routes skipped past the rack.)
        setPendingAddMode(false);
        showAlert({
          title: 'Your bottle has been added',
          body: placed === 1
            ? `Added to ${rack?.name ?? 'your rack'} — and in your Full Cellar List.`
            : `${placed} bottles added to ${rack?.name ?? 'your rack'} — and in your Full Cellar List.`,
          buttons: [
            { text: 'View in Full Cellar List', onPress: () => router.replace('/cellar/list') },
            { text: 'Done', style: 'cancel' },
          ],
        });
      } else {
        setSavedMsg(placed === 1 ? 'Saved to rack & Cellar List' : `${placed} bottles saved to rack & Cellar List`);
      }
    } catch (err) {
      showAlert({ title: 'Could not place', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setPlacing(false);
    }
  }

  // Confirm the upfront "how many?" for Add More Bottles → enter placement mode
  // with the count locked in, so the next slot tap places straight away.
  function startAddMorePlacement() {
    if (!addMoreUpfront) return;
    setPendingWineId(addMoreUpfront.wineId);
    setPendingAddMode(true);
    setPlacePrechosen(true);
    setAddMoreUpfront(null);
  }

  function pickUpSlot(row: number, col: number) {
    const slot = slotMap[`${row},${col}`];
    const wine = slot?.wine as CellarWine | null | undefined;
    if (!wine || !slot?.cellar_wine_id) return;
    const wineId = slot.cellar_wine_id;
    const qty = wine.quantity ?? 1;
    // Long-press now opens an action sheet rather than dropping straight
    // into move-mode — this is also the user-facing entry point for
    // removing a wine directly from the rack grid.
    const buttons: { text: string; style?: 'destructive' | 'cancel'; onPress?: () => void }[] = [
      {
        // Primary action: add more of this same wine into the rack. Reuses the
        // existing place-into-rack mode (banner → tap an empty slot → choose
        // how many), which bumps the wine's quantity to match.
        text: 'Add More Bottles',
        onPress: () => {
          // Ask how many up front (one pop-up); the tap that follows places
          // them straight away — no second modal.
          setPlaceCount('1');
          setPlaceOrientation('Vertical');
          setAddMoreUpfront({ wineId, wineName: wine.wine_name });
        },
      },
      {
        text: 'Move to another slot or rack',
        onPress: () => {
          setPendingMove({ sourceRackId: rackId, row, col, wineId, wineName: wine.wine_name });
        },
      },
      {
        // Archive keeps the wine in the user's records (Cellar Archive) but
        // takes it out of the live Cellar List and this rack.
        text: 'Archive Wine',
        onPress: () => {
          // Multiple bottles → ask how many (with an Archive All option).
          // Single bottle → the simple confirm is enough.
          if (qty > 1) { setArchiveCount('1'); setArchiveModal({ wineId, wineName: wine.wine_name, qty }); }
          else confirmArchiveWine(wineId, wine.wine_name, qty);
        },
      },
    ];
    // Delete — same shape as Archive: ask how many to permanently remove when
    // there's more than one bottle (with a "Delete all" option); a single bottle
    // just confirms.
    buttons.push({
      text: 'Delete Wine (Permanent)',
      style: 'destructive',
      onPress: () => {
        if (qty > 1) { setDeleteCount('1'); setDeleteModal({ wineId, wineName: wine.wine_name, qty }); }
        else confirmDeleteWine(wineId, wine.wine_name, qty);
      },
    });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    showAlert({
      title: wine.wine_name + (wine.vintage ? ` ${wine.vintage}` : ''),
      body: 'What would you like to do?',
      buttons,
    });
  }

  // Archive the whole listing from the rack long-press: log the removal, mark
  // the row archived, and pull it out of the live cellar + every rack slot. The
  // wine stays in the Cellar Archive (and Removal History). Mirrors the wine
  // card's full-archive branch, scoped to the entire quantity.
  function confirmArchiveWine(wineId: string, wineName: string, qty: number) {
    const today = new Date().toISOString().slice(0, 10);
    showAlert({
      title: qty > 1 ? `Archive all ${qty} bottles?` : 'Archive wine?',
      body: qty > 1
        ? `Move all ${qty} bottles of ${wineName} to your Cellar Archive. They'll leave the Cellar List and this rack but stay in your records.`
        : `Move ${wineName} to your Cellar Archive. It'll leave the Cellar List and this rack but stay in your records.`,
      buttons: [
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await addCellarWineRemoval({ cellarWineId: wineId, removedAt: today, count: qty });
              await updateWine.mutateAsync({
                id: wineId,
                updates: { quantity: qty, archived_at: `${today}T12:00:00.000Z` },
              });
              await clearWineFromRacks(wineId);
              if (session?.user.id) {
                qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) =>
                  (old ?? []).filter((w) => w.id !== wineId));
                qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
                qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
              }
              qc.invalidateQueries({ queryKey: ['cellar-removals', wineId] });
              qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
              qc.invalidateQueries({ queryKey: ['slot-assignments'] });
            } catch (err) {
              showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Archive from the multi-bottle modal. `archiveAll` archives the whole
  // listing; otherwise it archives the entered count, decrementing the live
  // row and cloning an archive row for the removed bottles (mirrors the wine
  // card's partial-archive so the "Bottles in My Archive" stat stays correct).
  async function handleRackArchive(archiveAll: boolean) {
    if (!archiveModal || archiving) return;
    const { wineId, qty } = archiveModal;
    const count = archiveAll ? qty : (parseInt(archiveCount, 10) || 0);
    if (count < 1 || count > qty) {
      showAlert({ title: 'Invalid', body: `Enter between 1 and ${qty} bottles.` });
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const wine = wines.find((w) => w.id === wineId);
    setArchiving(true);
    try {
      await addCellarWineRemoval({ cellarWineId: wineId, removedAt: today, count });
      qc.invalidateQueries({ queryKey: ['cellar-removals', wineId] });

      if (count === qty) {
        // Full archive — mark the row archived and clear all its slots.
        await updateWine.mutateAsync({ id: wineId, updates: { quantity: qty, archived_at: `${today}T12:00:00.000Z` } });
        await clearWineFromRacks(wineId);
        if (session?.user.id) {
          qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) => (old ?? []).filter((w) => w.id !== wineId));
          qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        }
      } else {
        // Partial — decrement the live row, clone an archive row for the
        // removed bottles, and free exactly `count` of its slots.
        await updateWine.mutateAsync({ id: wineId, updates: { quantity: qty - count } });
        if (wine) {
          const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = wine;
          await addCellarWine({ ...rest, quantity: count, archived_at: `${today}T12:00:00.000Z`, is_wishlist: false });
        }
        await removeSlotsForWine(wineId, count);
        if (session?.user.id) qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      setArchiveModal(null);
      setSavedMsg(count === qty ? 'Wine archived' : `${count} bottle${count === 1 ? '' : 's'} archived`);
    } catch (err) {
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setArchiving(false);
    }
  }

  function confirmDeleteWine(wineId: string, wineName: string, qty: number) {
    showAlert({
      title: qty > 1 ? `Delete all ${qty} bottles?` : 'Delete wine?',
      body: qty > 1
        ? `Permanently remove all ${qty} bottles of ${wineName} from your records. This can't be undone.`
        : `Permanently remove ${wineName} from your records. This can't be undone.`,
      buttons: [
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWineFromRacks(wineId);
              const { error } = await supabase.from('cellar_wines').delete().eq('id', wineId);
              if (error) throw error;
              // Prune from the cellar cache immediately so the deleted wine
              // can't linger (and falsely match a fresh add) if the refetch
              // below is slow or fails — same pattern as the wine card.
              if (session?.user.id) {
                qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) =>
                  (old ?? []).filter((w) => w.id !== wineId));
              }
              qc.invalidateQueries({ queryKey: ['cellar'] });
              qc.invalidateQueries({ queryKey: ['cellar-archive'] });
              qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
              qc.invalidateQueries({ queryKey: ['slot-assignments'] });
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Delete from the multi-bottle modal. `deleteAll` removes the whole listing
  // (row + all slots). Otherwise it permanently removes the entered count:
  // decrement the live row and free exactly that many slots. No archive clone —
  // this is a permanent delete, not an archive.
  async function handleRackDelete(deleteAll: boolean) {
    if (!deleteModal || deleting) return;
    const { wineId, qty } = deleteModal;
    const count = deleteAll ? qty : (parseInt(deleteCount, 10) || 0);
    if (count < 1 || count > qty) {
      showAlert({ title: 'Invalid', body: `Enter between 1 and ${qty} bottles.` });
      return;
    }
    setDeleting(true);
    try {
      if (count === qty) {
        // Full delete — remove the row and clear all its slots.
        await clearWineFromRacks(wineId);
        const { error } = await supabase.from('cellar_wines').delete().eq('id', wineId);
        if (error) throw error;
        if (session?.user.id) {
          qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) => (old ?? []).filter((w) => w.id !== wineId));
        }
        qc.invalidateQueries({ queryKey: ['cellar'] });
        qc.invalidateQueries({ queryKey: ['cellar-archive'] });
      } else {
        // Partial — decrement the live row and free exactly `count` of its slots.
        await updateWine.mutateAsync({ id: wineId, updates: { quantity: qty - count } });
        await removeSlotsForWine(wineId, count);
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      setDeleteModal(null);
      setSavedMsg(count === qty ? 'Wine deleted' : `${count} bottle${count === 1 ? '' : 's'} deleted`);
    } catch (err) {
      showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setDeleting(false);
    }
  }

  async function handleDrop(toRow: number, toCol: number) {
    if (!moving) return;
    const sourceWine = moving.wineId;
    const sourceRackId = moving.sourceRackId;
    const srcRow = moving.row;
    const srcCol = moving.col;
    const destSlot = slotMap[`${toRow},${toCol}`];
    const destWine = destSlot?.cellar_wine_id ?? null;
    setPendingMove(null);
    try {
      // Source slot lives on sourceRackId (which may differ from this rack);
      // the drop target is the rack we're viewing now.
      if (destWine) {
        // Swap: source slot <- dest's wine, dest slot <- source's wine.
        await assignSlot(sourceRackId, srcRow, srcCol, destWine);
        await assignSlot(rackId, toRow, toCol, sourceWine);
      } else {
        // Move into empty slot: assign the dest, clear the source.
        await assignSlot(rackId, toRow, toCol, sourceWine);
        await clearSlot(sourceRackId, srcRow, srcCol);
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      if (sourceRackId !== rackId) qc.invalidateQueries({ queryKey: ['rack-slots', sourceRackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      setSavedMsg(sourceRackId !== rackId ? 'Moved to this rack' : 'Bottle moved');
    } catch {
      showAlert({ title: 'Move failed', body: 'Could not move the wine. Please try again.' });
    }
  }

  function toggleHighlight(wineId: string) {
    setHighlightedWineId((prev) => (prev === wineId ? null : wineId));
  }

  const filteredWines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return winesInRack;
    // Match drinking-window status too ("drinking now", "declining", "too
    // young", "approaching"), alongside producer / name / region / vintage.
    const statuses = q.length >= 3
      ? STATUS_SEARCH.filter(({ terms }) => terms.some((t) => t.includes(q) || q.includes(t))).map((s) => s.status)
      : [];
    return winesInRack.filter(({ wine }) =>
      wine.wine_name.toLowerCase().includes(q) ||
      (wine.producer ?? '').toLowerCase().includes(q) ||
      (wine.region ?? '').toLowerCase().includes(q) ||
      (wine.grape_variety ?? '').toLowerCase().includes(q) ||
      (wine.vintage ?? '').toString().includes(q) ||
      statuses.includes(effectiveMaturity(wine))
    );
  }, [winesInRack, searchQuery]);

  // Bottles to highlight on the grid: every search match while searching,
  // otherwise the single bottle picked from the list / a deep link. Searching
  // a producer (or status) now lights up ALL matching bottles, not just one.
  const highlightedIds = useMemo(() => {
    if (searchQuery.trim()) return new Set(filteredWines.map(({ wine }) => wine.id));
    if (maturityHighlight) {
      return new Set(
        winesInRack.filter(({ wine }) => effectiveMaturity(wine) === maturityHighlight).map(({ wine }) => wine.id)
      );
    }
    if (activeCustomFilterId) {
      const f = customFilters.find((cf) => cf.id === activeCustomFilterId);
      return new Set(f?.wineIds ?? []);
    }
    return highlightedWineId ? new Set([highlightedWineId]) : new Set<string>();
  }, [searchQuery, filteredWines, highlightedWineId, activeCustomFilterId, customFilters, maturityHighlight, winesInRack]);

  // Pick a readiness option from the Maturity chip → highlight those bottles.
  function selectMaturity(value: string) {
    setMaturityHighlight(value);
    setHighlightedWineId(null);
    setSearchQuery('');
    setActiveCustomFilterId(null);
    setMaturityOpen(false);
  }

  // Apply a saved filter → highlight its bottles (those present in this rack).
  function applyCustomFilter(id: string) {
    setActiveCustomFilterId((prev) => (prev === id ? null : id));
    setHighlightedWineId(null);
    setSearchQuery('');
    setMaturityHighlight('');
    setMaturityOpen(false);
  }
  function openCreateFilter() {
    setEditingFilterId(null);
    setFilterNameDraft('');
    setSelectedWineIds(new Set());
    setPickerInitialSelected(new Set());
    setCreateFilterOpen(true);
  }
  // Open the same modal pre-filled to edit an existing filter's name + wines.
  function openEditFilter(filter: { id: string; name: string; wineIds: string[] }) {
    setEditingFilterId(filter.id);
    setFilterNameDraft(filter.name);
    setSelectedWineIds(new Set(filter.wineIds));
    setPickerInitialSelected(new Set(filter.wineIds));
    setCreateFilterOpen(true);
  }
  function closeFilterModal() {
    setCreateFilterOpen(false);
    setEditingFilterId(null);
  }
  function toggleWineInSelection(id: string) {
    setSelectedWineIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  async function saveCustomFilter() {
    const name = filterNameDraft.trim();
    if (!name) { setSavedMsg('Name your filter first'); return; }
    // An empty filter is allowed — users can name it now and fill it later.
    // A rack/fridge filter may only contain wines from that location, so prune
    // any stray selections (e.g. from a legacy filter saved before this rule).
    const rackWineIds = new Set(winesInRack.map(({ wine }) => wine.id));
    const wineIds = Array.from(selectedWineIds).filter((id) => rackWineIds.has(id));
    setSavingFilter(true);
    try {
      if (editingFilterId) {
        await renameFilter.mutateAsync({ filterId: editingFilterId, name });
        await setFilterWines.mutateAsync({ filterId: editingFilterId, wineIds });
        closeFilterModal();
        setSavedMsg(`"${name}" filter updated`);
      } else {
        await createFilter.mutateAsync({ name, wineIds });
        closeFilterModal();
        setSavedMsg(`"${name}" filter created`);
      }
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingFilter(false);
    }
  }
  // Long-press menu on a filter chip: rename it, change which wines it holds,
  // delete it, or cancel.
  function openFilterOptions(filter: { id: string; name: string; wineIds: string[] }) {
    showAlert({
      title: filter.name,
      body: 'Rename this filter, add or remove the wines it holds, or delete it. Your wines stay in the cellar either way.',
      buttons: [
        { text: 'Add/Remove Wines', onPress: () => openEditFilter(filter) },
        { text: 'Rename Filter', onPress: () => setRenameFilterTarget({ id: filter.id, name: filter.name }) },
        { text: 'Delete', style: 'destructive', onPress: () => {
            if (activeCustomFilterId === filter.id) setActiveCustomFilterId(null);
            removeFilter.mutate(filter.id);
          } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function saveFilterRename(name: string) {
    if (!renameFilterTarget) return;
    setRenamingFilter(true);
    try {
      await renameFilter.mutateAsync({ filterId: renameFilterTarget.id, name });
      setRenameFilterTarget(null);
      setSavedMsg(`"${name}" filter renamed`);
    } catch (err) {
      showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setRenamingFilter(false);
    }
  }

  if (isLoading || !rack) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  // "fridge" / "Fridge" vs "rack" / "Rack" so edit + delete copy matches the
  // storage type the user actually built.
  const storageNoun = rack.storage_type === 'fridge' ? 'fridge' : 'rack';
  const StorageNoun = rack.storage_type === 'fridge' ? 'Fridge' : 'Rack';
  // Total capacity = standard grid + any large-format band (not free spaces).
  const totalSlots = rack.rows * rack.cols + (rack.large_format_cols && rack.large_format_cols > 0 ? rack.large_format_cols : 0);

  // Grid rows — rendered in the inline viewport and (when zoomed) in the
  // full-screen overlay. One function so the two never drift apart.
  function renderRackRows() {
    return gridRows.map((rowDef) => {
      const isLargeFormat = rowDef.rowIndex === -1;
      const fallbackFont = Math.max(7, Math.min(12, Math.round(rowDef.slotWidth / 7)));
      return (
        <View
          key={rowDef.rowIndex}
          style={[styles.gridRow, { gap: GAP, marginBottom: GAP }, isLargeFormat && { marginBottom: GAP * 2 }]}
        >
          {Array.from({ length: rowDef.cols }, (_, col) => {
            const slot = slotMap[`${rowDef.rowIndex},${col}`];
            const wine = slot?.wine as CellarWine | null | undefined;
            const isHighlighted = !!wine && highlightedIds.has(wine.id);
            const isDimmed = highlightedIds.size > 0 && !!wine && !highlightedIds.has(wine.id);
            const isMovingSource = !!moving && moving.sourceRackId === rackId && moving.row === rowDef.rowIndex && moving.col === col;
            const isMultiSelected = multiSlots.has(`${rowDef.rowIndex},${col}`);
            return (
              <TouchableOpacity
                key={col}
                style={[
                  styles.slot,
                  { width: rowDef.slotWidth, height: rowDef.slotWidth },
                  wine ? styles.slotFilled : styles.slotEmpty,
                  isHighlighted && styles.slotHighlightRing,
                  isDimmed && styles.slotDimmed,
                  isMovingSource && styles.slotMovingSource,
                  isMultiSelected && styles.slotMultiSelected,
                ]}
                onPress={() => openSlot(rowDef.rowIndex, col)}
                onLongPress={() => onLongPressSlot(rowDef.rowIndex, col)}
                delayLongPress={400}
                activeOpacity={0.8}
              >
                {wine ? (
                  <LabelThumb
                    path={wine.label_image_path}
                    fallbackText={wine.wine_name}
                    style={styles.slotThumb}
                    radius={2}
                    frame={2}
                    fallbackFontSize={fallbackFont}
                  />
                ) : (
                  <Text style={[styles.slotPlus, isMultiSelected && styles.slotPlusSelected]}>{isMultiSelected ? '✓' : '+'}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    });
  }

  return (
    <GestureDetector gesture={swipeGesture}>
    <View style={styles.container}>
      <View style={styles.header}>
        {/* A rack can be reached at the end of a scan / rack-build flow,
            so router.back() can land on a scanner screen (or no-op).
            dismissTo pops the stack down to the existing racks landing
            page if it's already there (Cellar tab → Racks → Rack), and
            collapses the scanner stack (Cellar tab → Racks → Camera →
            Detect → Rack) the same way. Using router.navigate() here
            pushed a SECOND copy of racks onto the stack, which then
            looped the user back through the rack on the next Back. */}
        <TouchableOpacity onPress={handleBack}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleNav}>
          <TouchableOpacity
            onPress={() => prevRack && router.replace(`/cellar/rack/${prevRack.id}` as any)}
            disabled={!prevRack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 6 }}
            accessibilityLabel="Previous rack"
          >
            <Text style={[styles.navArrow, !prevRack && styles.navArrowDisabled]}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{rack.name}</Text>
          <TouchableOpacity
            onPress={() => nextRack && router.replace(`/cellar/rack/${nextRack.id}` as any)}
            disabled={!nextRack}
            hitSlop={{ top: 12, bottom: 12, left: 6, right: 12 }}
            accessibilityLabel="Next rack"
          >
            <Text style={[styles.navArrow, !nextRack && styles.navArrowDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.rotateBtn}
          onPress={() => {
            if (isLandscape) {
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
            } else {
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
            }
          }}
        >
          <Text style={styles.rotateBtnText}>{isLandscape ? '↺ Portrait' : '↻ Landscape'}</Text>
        </TouchableOpacity>
      </View>

      {/* Gold tally — distinct wines, total bottles, and total slot capacity. */}
      <Text style={styles.rackSummary}>
        {winesInRack.length} {winesInRack.length === 1 ? 'Wine' : 'Wines'} · {rackBottleCount} {rackBottleCount === 1 ? 'Bottle' : 'Bottles'} · {totalSlots} {totalSlots === 1 ? 'Slot' : 'Slots'}
      </Text>

      {lineupSetup && (
        <View style={styles.lineupBanner}>
          <Text style={styles.lineupBannerTitle}>
            {rack.storage_type === 'fridge'
              ? 'Select the slot for the first bottle of the lineup, to place in your fridge from left to right'
              : 'Select the slot for the first bottle in your rack'}
          </Text>
          {rack.storage_type !== 'fridge' && (
            <>
              <Text style={styles.lineupBannerLabel}>Lineup orientation</Text>
              <View style={styles.lineupOrientRow}>
                <TouchableOpacity
                  style={[styles.lineupOrientBtn, lineupOrientation === 'Vertical' && styles.lineupOrientBtnActive]}
                  onPress={() => setLineupOrientation('Vertical')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.lineupOrientText, lineupOrientation === 'Vertical' && styles.lineupOrientTextActive]}>Vertical</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.lineupOrientBtn, lineupOrientation === 'Horizontal' && styles.lineupOrientBtnActive]}
                  onPress={() => setLineupOrientation('Horizontal')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.lineupOrientText, lineupOrientation === 'Horizontal' && styles.lineupOrientTextActive]}>Horizontal</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          <TouchableOpacity onPress={() => setLineupSetup(false)} style={styles.lineupBannerCancel}>
            <Text style={styles.lineupBannerCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAwareScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: 60 }} bottomOffset={24} scrollEnabled={!isZoomed}>
        {/* Functionality statement — replaces the old hint + the swipe bar. */}
        <Text style={styles.rackHint}>
          Add multiple bottles by long holding a slot & selecting your placements · Add multiple bottles at once with Add a Lineup · Select a thumbnail to View Intel, long hold to edit · Pinch the rack to zoom
        </Text>

        {winesInRack.length > 0 && (
          <>
            {/* Filter carousel — mirrors the Full Cellar List chips. List opens
                the rack's bottle list, Maturity highlights by drinking readiness,
                each saved custom filter is its own chip, and + Add creates one. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterRow}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={[styles.filterChip, bottleListOpen && styles.filterChipActive]}
                onPress={() => { setBottleListOpen((v) => !v); setMaturityOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, bottleListOpen && styles.filterChipTextActive]}>List {bottleListOpen ? '▴' : '▾'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, maturityHighlight ? styles.filterChipActive : null]}
                onPress={() => { setMaturityOpen((v) => !v); setBottleListOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, maturityHighlight ? styles.filterChipTextActive : null]}>
                  {maturityHighlight ? (MATURITY_OPTIONS.find((o) => o.value === maturityHighlight)?.label ?? 'Maturity') : 'Maturity'} ▾
                </Text>
              </TouchableOpacity>

              {customFilters.map((f) => {
                const active = activeCustomFilterId === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => applyCustomFilter(f.id)}
                    onLongPress={() => openFilterOptions(f)}
                    delayLongPress={400}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, active && styles.filterChipTextActive]} numberOfLines={1}>{f.name}</Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={styles.filterChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
                <Text style={styles.filterChipAddText}>+ Add</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Maturity dropdown — readiness options highlight matching bottles. */}
            {maturityOpen && (
              <View style={styles.maturityDropdown}>
                {MATURITY_OPTIONS.map((o) => {
                  const active = maturityHighlight === o.value;
                  return (
                    <TouchableOpacity key={o.value || 'all'} style={[styles.maturityOption, active && styles.maturityOptionActive]} onPress={() => selectMaturity(o.value)} activeOpacity={0.7}>
                      <Text style={[styles.maturityOptionText, active && styles.maturityOptionTextActive]}>{o.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Search bar — subtle (background-toned), sits below the carousel. */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={(t) => { setSearchQuery(t); setActiveCustomFilterId(null); setMaturityHighlight(''); }}
                placeholder="Search producer, wine, region, vintage…"
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                  <Text style={styles.searchClearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {bottleListOpen && (
              <View style={styles.bottleList}>
                {filteredWines.length === 0 ? (
                  <Text style={styles.searchNoResults}>No wines match "{searchQuery}"</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                    {filteredWines.map(({ wine, count }) => {
                      const active = highlightedWineId === wine.id;
                      return (
                        <TouchableOpacity
                          key={wine.id}
                          style={[styles.wineRow, active && styles.wineRowActive]}
                          onPress={() => { setHighlightedWineId(wine.id); setActiveCustomFilterId(null); setSearchQuery(''); setMaturityHighlight(''); setBottleListOpen(false); }}
                          onLongPress={() => confirmDeleteWine(wine.id, wine.wine_name, wine.quantity ?? 1)}
                          delayLongPress={400}
                        >
                          <View style={styles.wineRowMain}>
                            <Text style={[styles.wineRowName, active && styles.wineRowNameActive]} numberOfLines={2}>
                              {wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}
                            </Text>
                          </View>
                          <Text style={[styles.wineRowCount, active && styles.wineRowCountActive]}>
                            {count} {count === 1 ? 'bottle' : 'bottles'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}

          </>
        )}

        {moving && (
          <View style={styles.movingBanner}>
            <Text style={styles.movingBannerText} numberOfLines={2}>
              {`Moving ${moving.wineName} — tap a slot to place${moving.sourceRackId === rackId ? ', or tap its slot to cancel' : ' (you can switch racks with the ‹ › arrows)'}`}
            </Text>
            <TouchableOpacity onPress={() => setPendingMove(null)}>
              <Text style={styles.movingCancelLink}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {pendingWineId && (() => {
          // Surface the actual wine name so the user can't lose track of
          // which bottle they're placing — common pain when coming in from
          // the Wish List and then tapping into a rack.
          const pendingWine = wines.find((w) => w.id === pendingWineId);
          const headerLine = pendingWine
            ? [pendingWine.producer, pendingWine.wine_name, pendingWine.vintage].filter(Boolean).join(' · ')
            : 'this wine';
          return (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingBannerText}>Tap an empty slot to place {headerLine}</Text>
              {/* Always offer a way out — placing a wine is optional. Without
                  this the prompt persists across every rack the user opens
                  until they place it. Dismissing leaves the wine safely in
                  the cellar, unplaced, to be racked later (or never). */}
              <TouchableOpacity
                onPress={() => { setPendingWineId(null); setPendingAddMode(false); setPlacePrechosen(false); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.pendingBannerCancel}>Not now — leave it in my cellar</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
        {savedMsg && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedBannerText}>{savedMsg} ✓</Text>
          </View>
        )}
        {/* Rack grid — pinch to zoom, drag to move when zoomed. The cream
            "boxing" is a clipped viewport the grid scales/pans inside; each
            filled slot shows the wine's label as a framed thumbnail. Swipe
            between racks stays active at rest (see swipeGesture / isZoomed). */}
        <View
          style={styles.rackViewport}
          onLayout={(e) => { vpSize.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }; }}
        >
          <GestureDetector gesture={inlineZoomGesture}>
            <Animated.View
              style={[styles.rackCanvas, { transform: [{ translateX: zTx }, { translateY: zTy }, { scale: zScale }] }]}
              onLayout={(e) => { contentSize.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }; }}
            >
            {!fullScreen && renderRackRows()}
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Add a lineup straight into this storage — photograph up to 8
            bottles and onboard them via the same flow as Add a Wine. */}
        <TouchableOpacity
          style={styles.addLineupBtn}
          onPress={() => {
            // Pick the start slot + orientation first. Fridges are always
            // horizontal, so they skip the toggle and force Horizontal.
            setLineupOrientation(rack.storage_type === 'fridge' ? 'Horizontal' : 'Vertical');
            setLineupSetup(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.addLineupBtnText}>Add A Lineup (up to 8 bottles)</Text>
        </TouchableOpacity>

        {/* Edit bubble — opens the rack-management modal (wipe / rename /
            delete). Sits at the bottom of the page so destructive actions
            stay out of the user's primary path. */}
        <TouchableOpacity
          style={styles.editRackBtn}
          onPress={() => { setRenameDraft(rack.name); setEditOpen(true); }}
          activeOpacity={0.7}
        >
          <Text style={styles.editRackBtnText}>{rack.storage_type === 'fridge' ? 'Edit Wine Fridge' : 'Edit Wine Rack'}</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>


      {/* Multi-slot selection bar — floats above the grid while the user is
          hand-picking a set of empty slots to fill with one wine. */}
      {multiSelectMode ? (
        <View style={styles.multiBar} pointerEvents="box-none">
          <View style={styles.multiBarInner}>
            <Text style={styles.multiBarText}>{multiSlots.size} {multiSlots.size === 1 ? 'slot' : 'slots'} selected — tap more empty slots</Text>
            <View style={styles.multiBarBtns}>
              <TouchableOpacity style={styles.multiBarCancel} onPress={cancelMultiSelect} activeOpacity={0.8}>
                <Text style={styles.multiBarCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.multiBarPlace} onPress={placeIntoSelected} activeOpacity={0.8}>
                <Text style={styles.multiBarPlaceText}>Place a wine →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {/* Placement modal — opens when the user taps an empty slot while a
          pending wine is set. Asks how many bottles to place; orientation
          only shown if > 1 bottle. Skips already-occupied slots so we don't
          stomp an existing wine in the path. */}
      {/* Empty-slot chooser — how to fill the tapped slot (or the selected set). */}
      <Modal visible={slotChooser !== null} transparent animationType="fade" onRequestClose={() => { setSlotChooser(null); setPendingSlot(null); setPendingSlots(null); }}>
        <TouchableOpacity style={styles.slotChooserOverlay} activeOpacity={1} onPress={() => { setSlotChooser(null); setPendingSlot(null); setPendingSlots(null); }}>
          <TouchableOpacity activeOpacity={1} style={styles.slotChooserSheet} onPress={() => {}}>
            <Text style={styles.slotChooserTitle}>{(pendingSlots?.length ?? 0) > 1 ? `Add a wine to ${pendingSlots!.length} slots` : 'Add a wine to this slot'}</Text>
            <TouchableOpacity style={styles.slotChooserBtn} onPress={() => { setSlotChooser(null); router.push('/label/camera?context=place'); }} activeOpacity={0.8}>
              <Text style={styles.slotChooserBtnText}>Scan a Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.slotChooserBtn} onPress={() => { setSlotChooser(null); setCellarPickerOpen(true); }} activeOpacity={0.8}>
              <Text style={styles.slotChooserBtnText}>Select from Cellar List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.slotChooserBtn} onPress={() => { setSlotChooser(null); handleUploadForSlot(); }} activeOpacity={0.8}>
              <Text style={styles.slotChooserBtnText}>Upload Screenshot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.slotChooserBtn} onPress={() => { setSlotChooser(null); router.push('/label/confirm?manual=1&context=place'); }} activeOpacity={0.8}>
              <Text style={styles.slotChooserBtnText}>Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.slotChooserCancel} onPress={() => { setSlotChooser(null); setPendingSlot(null); setPendingSlots(null); }}>
              <Text style={styles.slotChooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <CellarWinePicker
        visible={cellarPickerOpen}
        onClose={() => { setCellarPickerOpen(false); setPendingSlot(null); setPendingSlots(null); }}
        onSelect={placeExistingWine}
      />

      {/* OCR-in-progress overlay while an uploaded label is read. */}
      <Modal visible={slotUploading} transparent animationType="fade">
        <View style={styles.slotUploadingOverlay}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.slotUploadingText}>Reading the label…</Text>
        </View>
      </Modal>

      <Modal visible={placingAt !== null} transparent animationType="fade" onRequestClose={() => !placing && setPlacingAt(null)}>
        <KeyboardAvoidingView behavior="padding" style={styles.placeOverlay}>
          <View style={styles.placeSheet}>
            <Text style={styles.placeTitle}>How many bottles?</Text>
            <Text style={styles.placeBody}>Place your wine in the rack — one slot per bottle, starting at the tapped position.</Text>

            <TextInput
              style={styles.placeInput}
              value={placeCount}
              onChangeText={setPlaceCount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
              autoFocus
              selectTextOnFocus
            />

            {(parseInt(placeCount, 10) || 1) > 1 && (
              <>
                <Text style={styles.placeFieldLabel}>Orientation</Text>
                <View style={styles.placeOrientationRow}>
                  <TouchableOpacity
                    style={[styles.placeOrientationBtn, placeOrientation === 'Vertical' && styles.placeOrientationBtnActive]}
                    onPress={() => setPlaceOrientation('Vertical')}
                  >
                    <Text style={[styles.placeOrientationText, placeOrientation === 'Vertical' && styles.placeOrientationTextActive]}>Vertical</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.placeOrientationBtn, placeOrientation === 'Horizontal' && styles.placeOrientationBtnActive]}
                    onPress={() => setPlaceOrientation('Horizontal')}
                  >
                    <Text style={[styles.placeOrientationText, placeOrientation === 'Horizontal' && styles.placeOrientationTextActive]}>Horizontal</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.placeConfirmBtn, placing && { opacity: 0.6 }]}
              onPress={() => confirmPlacement()}
              disabled={placing}
            >
              <Text style={styles.placeConfirmText}>{placing ? 'Placing…' : 'Place in rack'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPlacingAt(null)} disabled={placing} style={styles.placeCancel}>
              <Text style={styles.placeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add More Bottles — upfront "how many?" pop-up. After Continue the user
          taps a slot and the bottles are placed straight away (no second modal). */}
      <Modal visible={!!addMoreUpfront} transparent animationType="fade" onRequestClose={() => setAddMoreUpfront(null)}>
        <KeyboardAvoidingView behavior="padding" style={styles.placeOverlay}>
          <View style={styles.placeSheet}>
            <Text style={styles.placeTitle}>How many bottles?</Text>
            <Text style={styles.placeBody}>How many bottles of {addMoreUpfront?.wineName} are you adding? Then tap a slot to place them.</Text>

            <TextInput
              style={styles.placeInput}
              value={placeCount}
              onChangeText={setPlaceCount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
              autoFocus
              selectTextOnFocus
            />

            {(parseInt(placeCount, 10) || 1) > 1 && (
              <>
                <Text style={styles.placeFieldLabel}>Orientation</Text>
                <View style={styles.placeOrientationRow}>
                  <TouchableOpacity
                    style={[styles.placeOrientationBtn, placeOrientation === 'Vertical' && styles.placeOrientationBtnActive]}
                    onPress={() => setPlaceOrientation('Vertical')}
                  >
                    <Text style={[styles.placeOrientationText, placeOrientation === 'Vertical' && styles.placeOrientationTextActive]}>Vertical</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.placeOrientationBtn, placeOrientation === 'Horizontal' && styles.placeOrientationBtnActive]}
                    onPress={() => setPlaceOrientation('Horizontal')}
                  >
                    <Text style={[styles.placeOrientationText, placeOrientation === 'Horizontal' && styles.placeOrientationTextActive]}>Horizontal</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.placeConfirmBtn} onPress={startAddMorePlacement}>
              <Text style={styles.placeConfirmText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddMoreUpfront(null)} style={styles.placeCancel}>
              <Text style={styles.placeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Rename a custom filter. */}
      <RenameModal
        visible={!!renameFilterTarget}
        initialName={renameFilterTarget?.name ?? ''}
        title="Rename filter"
        saving={renamingFilter}
        onSave={saveFilterRename}
        onClose={() => setRenameFilterTarget(null)}
      />

      {/* Archive-a-multi-bottle-wine modal — how many, or Archive All. */}
      <Modal visible={!!archiveModal} transparent animationType="fade" onRequestClose={() => !archiving && setArchiveModal(null)}>
        <KeyboardAvoidingView behavior="padding" style={styles.placeOverlay}>
          <View style={styles.placeSheet}>
            <Text style={styles.placeTitle}>Archive bottles</Text>
            <Text style={styles.placeBody}>
              How many of your {archiveModal?.qty} bottles of {archiveModal?.wineName} to move to your Cellar Archive? They leave the Cellar List and this rack but stay in your records.
            </Text>

            <TextInput
              style={styles.placeInput}
              value={archiveCount}
              onChangeText={setArchiveCount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
              selectTextOnFocus
            />

            <TouchableOpacity
              style={[styles.placeConfirmBtn, archiving && { opacity: 0.6 }]}
              onPress={() => handleRackArchive(false)}
              disabled={archiving}
            >
              <Text style={styles.placeConfirmText}>{archiving ? 'Archiving…' : `Archive ${parseInt(archiveCount, 10) || 1}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.archiveAllBtn, archiving && { opacity: 0.6 }]}
              onPress={() => handleRackArchive(true)}
              disabled={archiving}
            >
              <Text style={styles.archiveAllText}>Archive all {archiveModal?.qty}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setArchiveModal(null)} disabled={archiving} style={styles.placeCancel}>
              <Text style={styles.placeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete-a-multi-bottle-wine modal — how many to permanently remove, or Delete All. */}
      <Modal visible={!!deleteModal} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteModal(null)}>
        <KeyboardAvoidingView behavior="padding" style={styles.placeOverlay}>
          <View style={styles.placeSheet}>
            <Text style={styles.placeTitle}>Delete bottles</Text>
            <Text style={styles.placeBody}>
              How many of your {deleteModal?.qty} bottles of {deleteModal?.wineName} to permanently remove? This can't be undone.
            </Text>

            <TextInput
              style={styles.placeInput}
              value={deleteCount}
              onChangeText={setDeleteCount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
              selectTextOnFocus
            />

            <TouchableOpacity
              style={[styles.placeConfirmBtn, deleting && { opacity: 0.6 }]}
              onPress={() => handleRackDelete(false)}
              disabled={deleting}
            >
              <Text style={styles.placeConfirmText}>{deleting ? 'Deleting…' : `Delete ${parseInt(deleteCount, 10) || 1}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.archiveAllBtn, deleting && { opacity: 0.6 }]}
              onPress={() => handleRackDelete(true)}
              disabled={deleting}
            >
              <Text style={styles.archiveAllText}>Delete all {deleteModal?.qty}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteModal(null)} disabled={deleting} style={styles.placeCancel}>
              <Text style={styles.placeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Edit-rack modal — Wipe Contents / Rename / Delete. */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <KeyboardAvoidingView behavior="padding" style={styles.placeOverlay}>
          <View style={styles.placeSheet}>
            <Text style={styles.placeTitle}>{rack.storage_type === 'fridge' ? 'Edit Wine Fridge' : 'Edit Wine Rack'}</Text>

            {renaming ? (
              <>
                <Text style={styles.placeFieldLabel}>Rack name</Text>
                <TextInput
                  style={styles.placeInput}
                  value={renameDraft}
                  onChangeText={setRenameDraft}
                  placeholder="Rack name"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.placeConfirmBtn}
                  onPress={() => {
                    const name = renameDraft.trim();
                    if (!name) return;
                    renameRackMutation.mutate({ id: rackId, name }, {
                      onSuccess: () => { setRenaming(false); setEditOpen(false); },
                      onError: (err) => showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' }),
                    });
                  }}
                  disabled={renameRackMutation.isPending}
                >
                  <Text style={styles.placeConfirmText}>{renameRackMutation.isPending ? 'Saving…' : 'Save name'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRenaming(false)} style={styles.placeCancel}>
                  <Text style={styles.placeCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.editActionBtn}
                  onPress={() => { setRenameDraft(rack.name); setRenaming(true); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editActionBtnText}>Rename {StorageNoun}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editActionBtn}
                  onPress={() => {
                    showAlert({
                      title: `Wipe ${storageNoun} contents?`,
                      body: `This empties every slot in this ${storageNoun}. The wines stay in your cellar — they're just unassigned from this ${storageNoun}.`,
                      buttons: [
                        {
                          text: `Wipe ${storageNoun}`,
                          style: 'destructive',
                          onPress: () => {
                            wipeRackMutation.mutate(rackId, {
                              onSuccess: () => setEditOpen(false),
                              onError: (err) => showAlert({ title: 'Could not wipe', body: err instanceof Error ? err.message : 'Please try again.' }),
                            });
                          },
                        },
                        { text: 'Cancel', style: 'cancel' },
                      ],
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editActionBtnText}>Wipe {StorageNoun} Contents</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editActionBtn, styles.editActionBtnDanger]}
                  onPress={() => {
                    showAlert({
                      title: `Delete this ${storageNoun}?`,
                      body: `Permanently remove "${rack.name}". The wines stay in your cellar — they\'re just no longer mapped to a ${storageNoun}.`,
                      buttons: [
                        {
                          text: `Delete ${storageNoun}`,
                          style: 'destructive',
                          onPress: () => {
                            removeRack.mutate(rackId, {
                              onSuccess: () => { setEditOpen(false); router.back(); },
                              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
                            });
                          },
                        },
                        { text: 'Cancel', style: 'cancel' },
                      ],
                    });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editActionBtnTextDanger}>Delete {StorageNoun}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditOpen(false)} style={styles.placeCancel}>
                  <Text style={styles.placeCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Create a custom filter — name it, then tick the wines it holds. */}
      <Modal visible={createFilterOpen} transparent animationType="fade" onRequestClose={closeFilterModal}>
        <KeyboardAvoidingView behavior="padding" style={styles.filterModalOverlay}>
          <View style={styles.filterModalSheet}>
            <Text style={styles.filterModalTitle}>{editingFilterId ? 'Edit custom filter' : 'New custom filter'}</Text>
            <TextInput
              style={styles.filterNameInput}
              value={filterNameDraft}
              onChangeText={setFilterNameDraft}
              placeholder="Filter name (e.g. Christmas Wines)"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.filterPickHint}>Choose wines from this location for the filter (optional) — {selectedWineIds.size} selected</Text>
            <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
              {pickerWines.length === 0 ? (
                <Text style={styles.searchNoResults}>No wines placed here yet — you can name the filter now and add wines later.</Text>
              ) : pickerWines.map(({ wine: w }) => {
                const checked = selectedWineIds.has(w.id);
                return (
                  <TouchableOpacity key={w.id} style={styles.filterPickRow} onPress={() => toggleWineInSelection(w.id)} activeOpacity={0.7}>
                    <Text style={[styles.filterCheckbox, checked && styles.filterCheckboxOn]}>{checked ? '☑' : '☐'}</Text>
                    <Text style={styles.filterPickName} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.filterModalActions}>
              <TouchableOpacity onPress={closeFilterModal}>
                <Text style={styles.filterCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterSaveBtn, savingFilter && { opacity: 0.5 }]} onPress={saveCustomFilter} disabled={savingFilter}>
                <Text style={styles.filterSaveBtnText}>{savingFilter ? 'Saving…' : editingFilterId ? 'Save Changes' : 'Save Filter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Full-screen rack zoom — promoted into from a firm pinch on the inline
          rack. Fills the screen so the grid + thumbnails can expand to the
          edges; pinch back in (or tap ✕) to drop back to the inline rack. */}
      <Modal visible={fullScreen} animationType="fade" onRequestClose={closeFullScreen}>
        {/* GestureHandlerRootView is REQUIRED here: react-native-gesture-handler
            gestures do not fire inside a RN <Modal> (it renders in a separate
            native hierarchy the app-root provider doesn't cover). Without it the
            full-screen rack froze — no pan, no further zoom, no pinch-to-close. */}
        <GestureHandlerRootView style={styles.fsContainer}>
          <GestureDetector gesture={fsZoomGesture}>
            <View style={styles.fsGestureArea}>
              <Animated.View
                style={[styles.fsCanvas, { transform: [{ translateX: fsTx }, { translateY: fsTy }, { scale: fsScale }] }]}
                onLayout={(e) => { fsContent.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }; }}
              >
                {fullScreen && renderRackRows()}
              </Animated.View>
            </View>
          </GestureDetector>
          <Text style={styles.fsHint}>Pinch in to close</Text>
        </GestureHandlerRootView>
      </Modal>
    </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Empty-slot "add a wine" chooser.
  slotChooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  slotChooserSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  slotChooserTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  slotChooserBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  slotChooserBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  slotChooserCancel: { alignItems: 'center', paddingTop: spacing.sm },
  slotChooserCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  slotUploadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  slotUploadingText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: '#FFFFFF' },
  // "Add a Lineup" setup banner (pick the start slot + orientation).
  lineupBanner: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.gold, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, alignItems: 'center' },
  lineupBannerTitle: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, textAlign: 'center' },
  lineupBannerLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.sm },
  lineupOrientRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  lineupOrientBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.lg },
  lineupOrientBtnActive: { backgroundColor: colors.gold },
  lineupOrientText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  lineupOrientTextActive: { color: colors.background },
  lineupBannerCancel: { marginTop: spacing.sm },
  lineupBannerCancelText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — back/nav link
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 50 },
  // Cormorant — page header
  title: { flexShrink: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, textAlign: 'center', letterSpacing: 1 },
  // Centred nav cluster: ‹ rack name › — gold arrows hop between racks/fridges.
  titleNav: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  navArrow: { fontSize: 26, fontFamily: fonts.headingSemibold, color: colors.gold, paddingHorizontal: 2 },
  navArrowDisabled: { color: 'rgba(224,184,74,0.25)' },
  rotateBtn: { alignItems: 'flex-end', width: 80 },
  // Cormorant — button text
  rotateBtnText: { fontSize: 12, fontFamily: fonts.headingSemibold, color: colors.gold },
  // Inter-rack swipe bar — small gold arrows + count, sits directly
  // below the rack-name header so the user sees the swipe affordance
  // before they reach for the grid.
  // "Rack Bottle List" gold prompt + the list it reveals.
  bottleListLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textDecorationLine: 'underline', letterSpacing: 0.3, paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  bottleListHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Filter carousel chips (List / Maturity / custom filters / + Add).
  filterScroll: { flexGrow: 0, marginBottom: spacing.sm },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md, backgroundColor: colors.surface, maxWidth: 170 },
  filterChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  filterChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  filterChipTextActive: { color: colors.gold },
  filterChipAdd: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md },
  filterChipAddText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
  // Maturity (readiness) dropdown panel.
  maturityDropdown: { marginHorizontal: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, overflow: 'hidden' },
  maturityOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  maturityOptionActive: { backgroundColor: 'rgba(212,176,96,0.12)' },
  maturityOptionText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  maturityOptionTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  bottleList: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  createFilterRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  createFilterLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Create-custom-filter modal.
  filterModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  filterModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  filterModalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  filterNameInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
  filterPickHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs },
  filterPickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterCheckbox: { fontSize: 20, color: colors.textMuted },
  filterCheckboxOn: { color: colors.gold },
  filterPickName: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  filterModalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  filterCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  filterSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  filterSaveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  swipeBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xs, gap: spacing.sm },
  swipeSide: { flex: 1, paddingVertical: 4 },
  // Cormorant — inline swipe arrow link reads as a button
  swipeArrow: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, letterSpacing: 0.3 },
  swipeArrowDisabled: { color: colors.textMuted, opacity: 0.4 },
  // Inter — small caption
  swipeCount: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  // Inter — hint
  scrollHint: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingBottom: spacing.xs },
  placeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  placeSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  // Cormorant — place pop-up title
  placeTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Inter — pop-up body
  placeBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  // Inter — form input
  placeInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 20, fontFamily: fonts.bodySemibold, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', width: 96, alignSelf: 'center', marginBottom: spacing.md },
  archiveAllBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  archiveAllText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Inter — form label
  placeFieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  placeOrientationRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  placeOrientationBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  placeOrientationBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.15)' },
  // Cormorant — option button text
  placeOrientationText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  placeOrientationTextActive: { color: colors.gold },
  placeConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  // Cormorant — confirm button text
  placeConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  placeCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  // Inter — cancel link (not a button)
  placeCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // Add-a-lineup CTA — gold to read as a primary action, above the Edit pill.
  addLineupBtn: { alignSelf: 'center', marginTop: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 20, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  addLineupBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase' },
  editRackBtn: { alignSelf: 'center', marginTop: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  // Cormorant — button text
  editRackBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' },
  editActionBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  // Cormorant — button text
  editActionBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  editActionBtnDanger: { borderColor: colors.gold },
  editActionBtnTextDanger: { color: colors.gold },
  slotMovingSource: { borderColor: colors.gold, borderWidth: 2, opacity: 0.4 },
  movingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)' },
  // Inter — banner body
  movingBannerText: { flex: 1, fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, lineHeight: 18 },
  // Cormorant — inline cancel link reads as an action
  movingCancelLink: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, textDecorationLine: 'underline' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  // Inter — small caption
  legendText: { fontSize: 11, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  gridRow: { flexDirection: 'row' },
  slot: { borderRadius: 4, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', padding: 2, overflow: 'hidden' },
  // Filled slot — the framed label thumbnail is the visual, so drop the
  // cell's own border/padding and let the thumb fill it edge to edge.
  slotFilled: { borderWidth: 0, padding: 0, backgroundColor: 'transparent' },
  slotThumb: { width: '100%', height: '100%' },
  // Search highlight — a gold ring around the matched bottle.
  slotHighlightRing: { borderWidth: 2, borderColor: colors.gold },
  // Cream backdrop the whole rack sits on — the "boxing" that frames it.
  // Clipped cream viewport the rack grid scales/pans inside. marginHorizontal
  // (md) + padding (md) = 64 total inset, matching PADDING used for slotSize,
  // so the grid fits the width exactly at rest. overflow:hidden turns it into
  // a pan window once zoomed.
  rackViewport: { marginHorizontal: spacing.md, marginVertical: spacing.sm, padding: spacing.md, backgroundColor: colors.creamDim, borderRadius: 14, overflow: 'hidden', alignItems: 'center' },
  rackCanvas: { alignItems: 'center' },
  // Full-screen zoom overlay.
  fsContainer: { flex: 1, backgroundColor: colors.background },
  fsGestureArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fsCanvas: { alignItems: 'center' },
  fsClose: { position: 'absolute', top: 48, right: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  fsCloseText: { color: colors.gold, fontSize: 18, fontFamily: fonts.headingSemibold },
  fsHint: { position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', color: colors.textMuted, fontSize: 13, fontFamily: fonts.bodyRegular },
  zoomHint: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center', paddingTop: spacing.sm, textDecorationLine: 'underline' },
  // Full-screen zoom viewer — dark backdrop so the labels pop; tighter slots.
  zoomBackdrop: { flex: 1, backgroundColor: 'rgba(18,11,10,0.97)', alignItems: 'center', justifyContent: 'center' },
  zoomCanvas: { alignItems: 'center' },
  zoomSlot: { borderRadius: 3, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  zoomSlotEmpty: { width: '100%', height: '100%', borderRadius: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  zoomClose: { position: 'absolute', top: 52, right: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  zoomCloseText: { color: '#FFFFFF', fontSize: 20, fontFamily: fonts.bodySemibold },
  zoomViewerHint: { position: 'absolute', bottom: 48, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: fonts.bodyItalic },
  slotEmpty: { borderColor: 'rgba(87,47,43,0.20)', backgroundColor: 'rgba(255,255,255,0.35)' },
  slotHighlighted: { borderColor: '#FFFFFF', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  slotDimmed: { opacity: 0.25 },
  // Inter — tiny slot label
  slotText: { fontSize: 8, fontFamily: fonts.bodySemibold, color: colors.text, textAlign: 'center', lineHeight: 10 },
  slotTextHighlighted: { color: '#FFFFFF' },
  // Inter — slot plus glyph
  slotPlus: { fontSize: 16, color: 'rgba(87,47,43,0.40)', fontFamily: fonts.bodyRegular },
  slotPlusSelected: { color: colors.gold, fontFamily: fonts.headingBold },
  rackSummary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingTop: spacing.sm },
  slotMultiSelected: { borderColor: colors.gold, borderWidth: 2, backgroundColor: 'rgba(224,184,74,0.28)' },
  multiBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.md },
  multiBarInner: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.md, gap: spacing.sm, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  multiBarText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.text, textAlign: 'center' },
  multiBarBtns: { flexDirection: 'row', gap: spacing.sm },
  multiBarCancel: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  multiBarCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  multiBarPlace: { flex: 2, backgroundColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  multiBarPlaceText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.surface },
  wineList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  // Inter — hint
  rackHint: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md, lineHeight: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  // Inter — form input
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text },
  searchClear: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },
  searchClearText: { fontSize: 13, color: colors.textMuted },
  // Inter — body (no results message)
  searchNoResults: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  wineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowActive: { borderBottomColor: colors.gold },
  wineRowMain: { flex: 1 },
  // Inter — wine card name
  wineRowName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  wineRowNameActive: { color: colors.gold },
  // Inter — wine detail caption
  wineRowDetail: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  // Inter — count read-out
  wineRowCount: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  wineRowCountActive: { color: colors.gold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, maxHeight: '80%' },
  // Cormorant — modal pop-up title
  modalTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, marginBottom: 2 },
  // Inter — producer sub-line in modal
  modalProducer: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: 2 },
  // Inter — sub caption
  modalSub: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  // Inter — score label
  scoreLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Inter — score value read-out
  scoreValue: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.gold },
  // Inter — tasting notes body
  tastingNotes: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 20, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  // Inter — form label
  noteLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  // Inter — form input
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.background, minHeight: 72, marginBottom: spacing.md },
  saveNoteButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  // Cormorant — save button text
  saveNoteText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold },
  clearButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, alignItems: 'center', marginBottom: spacing.md },
  // Cormorant — clear button text
  clearButtonText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  cancelButton: { alignItems: 'center', marginTop: spacing.sm },
  // Inter — cancel link (not a button)
  cancelText: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // Cormorant — sub-section header
  removeHeading: { fontSize: 15, fontFamily: fonts.headingBold, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  // Inter — form label
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Inter — form input
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.background, marginBottom: spacing.md },
  // Inter — status caption
  rackRemovalMsg: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  savedBanner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, alignItems: 'center' },
  // Inter — banner body
  savedBannerText: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.gold, letterSpacing: 0.3 },
  pendingBanner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, alignItems: 'center' },
  // Inter — banner body
  pendingBannerText: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.gold, letterSpacing: 0.3 },
  pendingBannerCancel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginTop: spacing.xs, textDecorationLine: 'underline' },
});
