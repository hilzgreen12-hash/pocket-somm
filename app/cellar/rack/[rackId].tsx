import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions, ActivityIndicator, Modal, Keyboard, Animated } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../../src/components/AppAlert';
import { detectPlacementMismatch, placementWarningBody } from '../../../src/components/BottleSizePicker';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { useRack, useRacks } from '../../../src/hooks/useRacks';
import { useRackStore } from '../../../src/stores/rackStore';
import { useCellar } from '../../../src/hooks/useCellar';
import { assignSlot, assignSlots, clearSlot, clearWineFromRacks } from '../../../src/api/racks';
import { supabase } from '../../../src/api/supabase';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { LabelThumb } from '../../../src/components/LabelThumb';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { RackSlot, CellarWine } from '../../../src/types/wine';
import * as ScreenOrientation from 'expo-screen-orientation';

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default function RackGridScreen() {
  const { rackId, highlight } = useLocalSearchParams<{ rackId: string; highlight?: string }>();
  const navigation = useNavigation();
  const { session } = useAuth();
  const { slots, isLoading, assign } = useRack(rackId);
  const { racks, remove: removeRack, rename: renameRackMutation, wipe: wipeRackMutation } = useRacks();
  // useCellar gives us access to updateWine so we can bump the wine's
  // quantity when the user places multiple bottles from this screen.
  const { wines, updateWine } = useCellar();
  const { width } = useWindowDimensions();
  const qc = useQueryClient();

  const { setPendingSlot, pendingWineId, setPendingWineId, pendingAddMode, setPendingAddMode } = useRackStore();
  const [highlightedWineId, setHighlightedWineId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bottleListOpen, setBottleListOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [moving, setMoving] = useState<{ row: number; col: number; wineId: string; wineName: string } | null>(null);
  const [movingMsg, setMovingMsg] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  // Placement modal — shown when the user taps an empty slot with a
  // pending wine. Asks how many bottles and (when > 1) orientation.
  const [placingAt, setPlacingAt] = useState<{ row: number; col: number; wineId: string } | null>(null);
  const [placeCount, setPlaceCount] = useState('1');
  const [placeOrientation, setPlaceOrientation] = useState<'Vertical' | 'Horizontal'>('Vertical');
  const [placing, setPlacing] = useState(false);
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

  // How-this-works modal. Shows on EVERY rack-screen mount until the
  // user explicitly opts out via "Don't show me this again", which
  // persists the flag to AsyncStorage. Mid-mount the flag is read
  // async, so the modal stays hidden by default and flips open only
  // when the read resolves AND the flag isn't set.
  const [rackHintOpen, setRackHintOpen] = useState(false);
  const [rackHintDontShow, setRackHintDontShow] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('vinster_rack_hint_dismissed');
        if (!cancelled && flag !== '1') setRackHintOpen(true);
      } catch {
        // AsyncStorage failure — fall through and show the modal,
        // worst case the user dismisses it once per session.
        if (!cancelled) setRackHintOpen(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  async function closeRackHint() {
    if (rackHintDontShow) {
      try { await AsyncStorage.setItem('vinster_rack_hint_dismissed', '1'); } catch { /* best-effort */ }
    }
    setRackHintOpen(false);
  }

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
    // Highlight the bottle the user came in to find (e.g. from a wine card's
    // "In {rack} →" link), otherwise clear any carried-over highlight when
    // swiping to another rack.
    setHighlightedWineId(highlight ?? null);
    // Don't reset moving/pending placement state — those are global
    // workflows (Wish List → place in rack) that should survive a
    // sideways navigation.
  }, [rackId, highlight]);

  // Pinch-zoom state — when the rack is zoomed in, the swipe-between-racks
  // gesture is disabled so one-finger drags pan the grid instead of
  // navigating away.
  const [zoomOpen, setZoomOpen] = useState(false);
  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
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
    [prevRack?.id, nextRack?.id],
  );

  // ---- Full-screen rack zoom ----
  // Pinching the inline rack (or tapping the zoom hint) opens a full-screen
  // viewer where the grid pinch-zooms + pans freely against the whole screen
  // — far more controlled than scaling the small inline card. RN Animated on
  // the JS thread via runOnJS (no Reanimated worklet plugin), matching
  // swipeGesture above. zBase = value committed at gesture start; zCur = live.
  const zScale = useRef(new Animated.Value(1)).current;
  const zTx = useRef(new Animated.Value(0)).current;
  const zTy = useRef(new Animated.Value(0)).current;
  const zBase = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const zCur = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  // Open the full-screen viewer with a quick "grow-in" so it reads as the
  // rack expanding out to fill the screen, not just appearing.
  function openZoom() {
    zBase.scale = 1; zCur.scale = 1; zBase.tx = 0; zBase.ty = 0; zCur.tx = 0; zCur.ty = 0;
    zTx.setValue(0); zTy.setValue(0);
    zScale.setValue(0.65);
    setZoomOpen(true);
    Animated.timing(zScale, { toValue: 1, duration: 220, useNativeDriver: false }).start();
  }
  function closeZoom() {
    zBase.scale = 1; zCur.scale = 1; zBase.tx = 0; zBase.ty = 0; zCur.tx = 0; zCur.ty = 0;
    zScale.setValue(1); zTx.setValue(0); zTy.setValue(0);
    setZoomOpen(false);
  }
  const openZoomGesture = useMemo(
    () => Gesture.Pinch().runOnJS(true).onStart(() => openZoom()),
    [],
  );
  const zoomViewerGesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => {
        let s = zBase.scale * e.scale;
        if (s < 1) s = 1;
        if (s > 5) s = 5;
        zCur.scale = s;
        zScale.setValue(s);
      })
      .onEnd(() => { zBase.scale = zCur.scale; });
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        zCur.tx = zBase.tx + e.translationX;
        zCur.ty = zBase.ty + e.translationY;
        zTx.setValue(zCur.tx);
        zTy.setValue(zCur.ty);
      })
      .onEnd(() => { zBase.tx = zCur.tx; zBase.ty = zCur.ty; });
    return Gesture.Simultaneous(pinch, pan);
  }, []);

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
    return Array.from(map.values()).sort((a, b) =>
      a.wine.wine_name.localeCompare(b.wine.wine_name)
    );
  }, [slots]);

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

  function openSlot(row: number, col: number) {
    // If we're in the middle of a move, treat this tap as the drop target.
    if (moving) {
      // Tapping the source slot itself cancels the move.
      if (moving.row === row && moving.col === col) {
        setMoving(null);
        setMovingMsg(null);
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
      // Ask the user how many bottles to place at this slot. The wine was
      // saved with quantity = 1 by default; if they place more here we'll
      // also bump the wine's quantity to match.
      setPlacingAt({ row, col, wineId: pendingWineId });
      setPlaceCount('1');
      setPlaceOrientation('Vertical');
    } else {
      setPendingSlot({ rackId, row, col, rows: rack.rows, cols: rack.cols, largeFormatCols: rack.large_format_cols, largeFormatBottleSizeMl: rack.large_format_bottle_size_ml });
      router.push('/label/camera');
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

  async function confirmPlacement() {
    if (!placingAt) return;
    Keyboard.dismiss();
    // Soft warning when the bottle's size doesn't match the slot's
    // expected size. Fires once before the placement runs — user can
    // continue and place anyway, or cancel back to the modal.
    const wineForCheck = wines.find((w) => w.id === placingAt.wineId);
    if (wineForCheck && rack) {
      const mismatch = detectPlacementMismatch(
        wineForCheck.bottle_size_ml,
        placingAt.row,
        rack.large_format_bottle_size_ml,
      );
      if (mismatch) {
        showAlert({
          title: 'Bottle size mismatch',
          body: placementWarningBody(mismatch),
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Place anyway', onPress: () => { void runPlacement(); } },
          ],
        });
        return;
      }
    }
    void runPlacement();
  }

  async function runPlacement() {
    if (!placingAt) return;
    const requested = Math.max(1, parseInt(placeCount, 10) || 1);
    setPlacing(true);
    try {
      const slots = computePlacementSlots(placingAt.row, placingAt.col, requested, placeOrientation);
      // Skip any slots that are already occupied — assign one at a time
      // so an existing wine in the path doesn't blow up the whole batch.
      const freeSlots = slots.filter((s) => !slotMap[`${s.row},${s.col}`]?.cellar_wine_id);
      if (freeSlots.length === 0) {
        showAlert({ title: 'No empty slots', body: 'The next slots are already in use. Try a different starting position or orientation.' });
        setPlacing(false);
        return;
      }
      await assignSlots(rackId, freeSlots, placingAt.wineId);

      const wine = wines.find((w) => w.id === placingAt.wineId);
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
      setSavedMsg(freeSlots.length === 1 ? 'Wine saved to rack' : `${freeSlots.length} bottles saved to rack`);
      setPendingWineId(null);
      setPlacingAt(null);

      // "+ Add bottles" routes the user here from the wine card. After
      // they confirm placement, drop them back to the screen they were on
      // BEFORE the wine card (Full Cellar List, or whichever rack), not
      // the wine card itself — feels like a finished task.
      if (pendingAddMode) {
        setPendingAddMode(false);
        if (router.canGoBack()) {
          try { router.dismiss(2); } catch { router.back(); }
        }
      }
    } catch (err) {
      showAlert({ title: 'Could not place', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setPlacing(false);
    }
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
        text: 'Move to another slot',
        onPress: () => {
          setMoving({ row, col, wineId, wineName: wine.wine_name });
          setMovingMsg(`Moving ${wine.wine_name} — tap a slot to place, or tap the source slot to cancel`);
        },
      },
    ];
    // When more than one bottle is on record, deleting from a single slot
    // must only remove THAT bottle — not wipe the whole listing. Offer the
    // per-bottle removal as the primary destructive action, with the
    // whole-listing delete as a clearly separate, heavier option.
    if (qty > 1) {
      buttons.push({
        text: `Remove this bottle (1 of ${qty})`,
        style: 'destructive',
        onPress: () => confirmRemoveOneBottle(row, col, wineId, wine.wine_name, qty),
      });
    }
    buttons.push({
      text: qty > 1 ? `Delete all ${qty} bottles from cellar` : 'Delete wine from cellar',
      style: 'destructive',
      onPress: () => confirmDeleteWine(wineId, wine.wine_name, qty),
    });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    showAlert({
      title: wine.wine_name + (wine.vintage ? ` ${wine.vintage}` : ''),
      body: 'What would you like to do?',
      buttons,
    });
  }

  // Remove a single physical bottle from this slot: clear the slot and
  // decrement the wine's recorded quantity by one. The listing (and any
  // other bottles) stay in the cellar. Used only when qty > 1, so the
  // post-decrement quantity is always >= 1.
  function confirmRemoveOneBottle(row: number, col: number, wineId: string, wineName: string, qty: number) {
    showAlert({
      title: 'Remove this bottle?',
      body: `Permanently remove one bottle of ${wineName} from this slot. You'll have ${qty - 1} left in your cellar.`,
      buttons: [
        {
          text: 'Remove one bottle',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearSlot(rackId, row, col);
              await updateWine.mutateAsync({ id: wineId, updates: { quantity: Math.max(1, qty - 1) } });
              qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
              qc.invalidateQueries({ queryKey: ['slot-assignments'] });
            } catch (err) {
              showAlert({ title: 'Could not remove', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
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

  async function handleDrop(toRow: number, toCol: number) {
    if (!moving) return;
    const sourceWine = moving.wineId;
    const destSlot = slotMap[`${toRow},${toCol}`];
    const destWine = destSlot?.cellar_wine_id ?? null;
    setMoving(null);
    setMovingMsg(null);
    try {
      if (destWine) {
        // Swap: source <- dest's wine, dest <- source's wine
        await assignSlot(rackId, moving.row, moving.col, destWine);
        await assignSlot(rackId, toRow, toCol, sourceWine);
      } else {
        // Move into empty slot: clear source, assign dest
        await assignSlot(rackId, toRow, toCol, sourceWine);
        await clearSlot(rackId, moving.row, moving.col);
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    } catch {
      showAlert({ title: 'Move failed', body: 'Could not move the wine. Please try again.' });
    }
  }

  function toggleHighlight(wineId: string) {
    setHighlightedWineId((prev) => (prev === wineId ? null : wineId));
  }

  const filteredWines = useMemo(() => {
    if (!searchQuery.trim()) return winesInRack;
    const q = searchQuery.toLowerCase();
    return winesInRack.filter(({ wine }) =>
      wine.wine_name.toLowerCase().includes(q) ||
      (wine.producer ?? '').toLowerCase().includes(q) ||
      (wine.region ?? '').toLowerCase().includes(q) ||
      (wine.vintage ?? '').toString().includes(q)
    );
  }, [winesInRack, searchQuery]);

  // Auto-highlight when search narrows to a single result; clear when search is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHighlightedWineId(null);
    } else if (filteredWines.length === 1) {
      setHighlightedWineId(filteredWines[0].wine.id);
    }
  }, [filteredWines, searchQuery]);

  if (isLoading || !rack) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
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
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{rack.name}</Text>
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


      <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 60 }} bottomOffset={24}>
        {/* Functionality statement — replaces the old hint + the swipe bar. */}
        <Text style={styles.rackHint}>
          Pinch to zoom · Select a thumbnail to view wine intel, delete, or move a bottle · Swipe between your racks
        </Text>

        {winesInRack.length > 0 && (
          <>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search wines…"
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

            {/* "Rack Bottle List" — the rack's wine list, hidden behind this
                gold prompt. Expand it, tap a wine, and it closes + highlights
                that bottle's placement in the grid. */}
            <TouchableOpacity onPress={() => setBottleListOpen((v) => !v)} activeOpacity={0.7}>
              <Text style={styles.bottleListLink}>Rack Bottle List {bottleListOpen ? '▴' : '▾'}</Text>
            </TouchableOpacity>

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
                          onPress={() => { setHighlightedWineId(wine.id); setBottleListOpen(false); }}
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

        {moving && movingMsg && (
          <View style={styles.movingBanner}>
            <Text style={styles.movingBannerText} numberOfLines={2}>{movingMsg}</Text>
            <TouchableOpacity onPress={() => { setMoving(null); setMovingMsg(null); }}>
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
                onPress={() => { setPendingWineId(null); setPendingAddMode(false); }}
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
        <View style={styles.rackViewport}>
          <GestureDetector gesture={openZoomGesture}>
            <View style={styles.rackCanvas}>
            {gridRows.map((rowDef) => {
              const isLargeFormat = rowDef.rowIndex === -1;
              // Scale the no-photo "blank label" text to the slot size.
              const fallbackFont = Math.max(7, Math.min(12, Math.round(rowDef.slotWidth / 7)));
              return (
                <View
                  key={rowDef.rowIndex}
                  style={[
                    styles.gridRow,
                    { gap: GAP, marginBottom: GAP },
                    // Pull the large-format row away from the standard grid
                    // a touch so it visually reads as a distinct shelf.
                    isLargeFormat && { marginBottom: GAP * 2 },
                  ]}
                >
                  {Array.from({ length: rowDef.cols }, (_, col) => {
                    const slot = slotMap[`${rowDef.rowIndex},${col}`];
                    const wine = slot?.wine as CellarWine | null | undefined;
                    const isHighlighted = !!highlightedWineId && wine?.id === highlightedWineId;
                    const isDimmed = !!highlightedWineId && !!wine && wine.id !== highlightedWineId;
                    const isMovingSource = !!moving && moving.row === rowDef.rowIndex && moving.col === col;
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
                        ]}
                        onPress={() => openSlot(rowDef.rowIndex, col)}
                        onLongPress={() => pickUpSlot(rowDef.rowIndex, col)}
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
                          <Text style={styles.slotPlus}>+</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
            </View>
          </GestureDetector>
        </View>

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

      {/* Full-screen rack zoom viewer — the rack breaks out of its inline card
          to fill the screen on a dark backdrop so the labels pop. Pinch to
          zoom (1–5×) and drag to move; tap ✕ to close. View-only (placement
          stays on the inline rack). Tighter framing than the inline card. */}
      <Modal visible={zoomOpen} transparent animationType="fade" onRequestClose={closeZoom}>
        {zoomOpen && (
          // A Modal renders in its OWN native hierarchy, outside the app-root
          // GestureHandlerRootView — so gestures inside it are dead unless we
          // give the modal its own gesture root. This is what makes the
          // pinch/pan respond.
          <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.zoomBackdrop}>
            <GestureDetector gesture={zoomViewerGesture}>
              <Animated.View
                style={[styles.zoomCanvas, { transform: [{ translateX: zTx }, { translateY: zTy }, { scale: zScale }] }]}
              >
                {gridRows.map((rowDef) => {
                  const fallbackFont = Math.max(7, Math.min(13, Math.round(rowDef.slotWidth / 6)));
                  return (
                    <View key={rowDef.rowIndex} style={[styles.gridRow, { gap: 2, marginBottom: rowDef.rowIndex === -1 ? 6 : 2 }]}>
                      {Array.from({ length: rowDef.cols }, (_, col) => {
                        const slot = slotMap[`${rowDef.rowIndex},${col}`];
                        const wine = slot?.wine as CellarWine | null | undefined;
                        return (
                          <View key={col} style={[styles.zoomSlot, { width: rowDef.slotWidth, height: rowDef.slotWidth }]}>
                            {wine ? (
                              <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.slotThumb} radius={2} frame={1} fallbackFontSize={fallbackFont} />
                            ) : (
                              <View style={styles.zoomSlotEmpty} />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </Animated.View>
            </GestureDetector>
            <TouchableOpacity style={styles.zoomClose} onPress={closeZoom} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
              <Text style={styles.zoomCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.zoomViewerHint}>Pinch to zoom · drag to move</Text>
          </View>
          </GestureHandlerRootView>
        )}
      </Modal>

      {/* Placement modal — opens when the user taps an empty slot while a
          pending wine is set. Asks how many bottles to place; orientation
          only shown if > 1 bottle. Skips already-occupied slots so we don't
          stomp an existing wine in the path. */}
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
              onPress={confirmPlacement}
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
                  <Text style={styles.editActionBtnText}>Rename Rack</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editActionBtn}
                  onPress={() => {
                    showAlert({
                      title: 'Wipe rack contents?',
                      body: 'This empties every slot in this rack. The wines stay in your cellar — they\'re just unassigned from this rack.',
                      buttons: [
                        {
                          text: 'Wipe rack',
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
                  <Text style={styles.editActionBtnText}>Wipe Rack Contents</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editActionBtn, styles.editActionBtnDanger]}
                  onPress={() => {
                    showAlert({
                      title: 'Delete this rack?',
                      body: `Permanently remove "${rack.name}". The wines stay in your cellar — they\'re just no longer mapped to a rack.`,
                      buttons: [
                        {
                          text: 'Delete rack',
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
                  <Text style={styles.editActionBtnTextDanger}>Delete Rack</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditOpen(false)} style={styles.placeCancel}>
                  <Text style={styles.placeCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* How-this-works overlay. Fires on every rack open until the
          user ticks "Don't show me this again". Dismiss requires an
          explicit OK tap — overlay tap is a no-op so a stray finger
          can't bypass the explanation. */}
      <Modal
        visible={rackHintOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.rackHintOverlay}>
          <View style={styles.rackHintSheet}>
            <Text style={styles.rackHintTitle}>How the rack works</Text>
            <Text style={styles.rackHintBody}>
              Tap an empty slot in the rack to add a wine, tap a wine in the list to highlight its position in the rack. Short press a wine in the rack to see its notes, long press it to move or delete the bottle.
            </Text>

            <TouchableOpacity
              style={styles.rackHintCheckRow}
              onPress={() => setRackHintDontShow((v) => !v)}
              activeOpacity={0.7}
            >
              <View style={[styles.rackHintCheckbox, rackHintDontShow && styles.rackHintCheckboxActive]}>
                {rackHintDontShow ? <Text style={styles.rackHintCheckmark}>✓</Text> : null}
              </View>
              <Text style={styles.rackHintCheckLabel}>Don't show me this again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.rackHintOkBtn} onPress={closeRackHint} activeOpacity={0.8}>
              <Text style={styles.rackHintOkBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — back/nav link
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 50 },
  // Cormorant — page header
  title: { flex: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, textAlign: 'center', letterSpacing: 1 },
  rotateBtn: { alignItems: 'flex-end', width: 80 },
  // Cormorant — button text
  rotateBtnText: { fontSize: 12, fontFamily: fonts.headingSemibold, color: colors.gold },
  // Inter-rack swipe bar — small gold arrows + count, sits directly
  // below the rack-name header so the user sees the swipe affordance
  // before they reach for the grid.
  // "Rack Bottle List" gold prompt + the list it reveals.
  bottleListLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textDecorationLine: 'underline', letterSpacing: 0.3, paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.sm },
  bottleList: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
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
  wineList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  // Inter — hint
  rackHint: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md, lineHeight: 20 },
  // How-this-works overlay shown on every rack open until dismissed
  // with "Don't show me this again". Uses the standard sheet-on-dim-
  // scrim pattern already established by other modals in the app.
  rackHintOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  rackHintSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  // Cormorant — hint pop-up title
  rackHintTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  // Inter — hint pop-up body
  rackHintBody: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.text, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  rackHintCheckRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, paddingVertical: 4 },
  rackHintCheckbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  rackHintCheckboxActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.20)' },
  // Inter — checkmark glyph
  rackHintCheckmark: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold, lineHeight: 16 },
  // Inter — check label
  rackHintCheckLabel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  rackHintOkBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  // Cormorant — button text
  rackHintOkBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.5 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
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
