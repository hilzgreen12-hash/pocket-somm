import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions, ActivityIndicator, Modal, Keyboard } from 'react-native';
import { showAlert } from '../../../src/components/AppAlert';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useRack, useRacks } from '../../../src/hooks/useRacks';
import { useRackStore } from '../../../src/stores/rackStore';
import { useCellar } from '../../../src/hooks/useCellar';
import { assignSlot, assignSlots, clearSlot, clearWineFromRacks } from '../../../src/api/racks';
import { supabase } from '../../../src/api/supabase';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { colors, spacing } from '../../../src/constants/theme';
import type { RackSlot, CellarWine } from '../../../src/types/wine';
import * as ScreenOrientation from 'expo-screen-orientation';

const STATUS_COLORS: Record<string, string> = {
  too_young: '#6DBF8A',
  approaching: '#5B9BD5',
  peak: colors.gold,
  declining: colors.error,
  unknown: colors.textMuted,
};

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default function RackGridScreen() {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();
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
  const slotSize = Math.max(20, naturalSlotSize);
  const gridFitsScreen = naturalSlotSize >= 20;
  // Scale the in-slot wine name with the slot itself. A 3×5 rack ends up
  // around 70pt per slot on a phone, so the name can read at ~15pt; a 10×8
  // rack drops to ~30pt slots and the name needs to shrink to ~8pt to fit
  // two wrapped lines. The 8–18pt clamp keeps both extremes legible.
  const slotFontSize = Math.max(8, Math.min(18, Math.floor(slotSize * 0.22)));
  const slotLineHeight = slotFontSize + 2;
  // Truncate the name at a length that scales with the slot too — a tiny
  // slot can only afford ~10 chars before wrapping eats the vintage line,
  // a big slot can comfortably show the whole name.
  const slotMaxChars = Math.max(10, Math.floor(slotSize / 3.5));

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
      setPendingSlot({ rackId, row, col, rows: rack.rows, cols: rack.cols });
      router.push('/label/camera');
    }
  }

  function computePlacementSlots(startRow: number, startCol: number, count: number, orient: 'Vertical' | 'Horizontal') {
    const result: Array<{ row: number; col: number }> = [];
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
    // Long-press now opens an action sheet rather than dropping straight
    // into move-mode — this is also the user-facing entry point for
    // deleting a wine directly from the rack grid.
    showAlert({
      title: wine.wine_name + (wine.vintage ? ` ${wine.vintage}` : ''),
      body: 'What would you like to do?',
      buttons: [
        {
          text: 'Move to another slot',
          onPress: () => {
            setMoving({ row, col, wineId, wineName: wine.wine_name });
            setMovingMsg(`Moving ${wine.wine_name} — tap a slot to place, or tap the source slot to cancel`);
          },
        },
        {
          text: 'Delete wine from cellar',
          style: 'destructive',
          onPress: () => confirmDeleteWine(wineId, wine.wine_name),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function confirmDeleteWine(wineId: string, wineName: string) {
    showAlert({
      title: 'Delete wine?',
      body: `Permanently remove ${wineName} from your records. This can't be undone.`,
      buttons: [
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWineFromRacks(wineId);
              const { error } = await supabase.from('cellar_wines').delete().eq('id', wineId);
              if (error) throw error;
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
    <View style={styles.container}>
      <View style={styles.header}>
        {/* A rack can be reached at the end of a scan / rack-build flow,
            so router.back() can land on a scanner screen (or no-op).
            Navigate to the racks landing page ("Wine Racks & Fridges") —
            it sits above this screen in the user's mental hierarchy and
            popping the whole scanner stack off the way to it is fine. */}
        <TouchableOpacity onPress={() => router.navigate('/cellar/racks')}>
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

      <View style={styles.legend}>
        {Object.entries({ peak: 'Peak', approaching: 'Approaching', too_young: 'Too Young', declining: 'Declining' }).map(([k, v]) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[k] }]} />
            <Text style={styles.legendText}>{v}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* How-it-works hint — sits between the drinking-window legend
            and the rack grid so users see it before they start tapping. */}
        <Text style={styles.rackHint}>
          Tap an empty slot in the rack to add a wine, tap a wine in the list to highlight its position in the rack. Short press a wine in the rack to see its notes, long press it to move or delete the bottle.
        </Text>

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
            </View>
          );
        })()}
        {savedMsg && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedBannerText}>{savedMsg} ✓</Text>
          </View>
        )}
        {/* Rack grid — horizontally scrollable for wide racks */}
        {!gridFitsScreen && (
          <Text style={styles.scrollHint}>← Scroll to see full rack →</Text>
        )}
        <ScrollView
          horizontal
          scrollEnabled={!gridFitsScreen}
          showsHorizontalScrollIndicator={!gridFitsScreen}
          contentContainerStyle={{ padding: spacing.xl }}
          bounces={false}
        >
          <View>
            {Array.from({ length: rack.rows }, (_, row) => (
              <View key={row} style={[styles.gridRow, { gap: GAP, marginBottom: GAP }]}>
                {Array.from({ length: rack.cols }, (_, col) => {
                  const slot = slotMap[`${row},${col}`];
                  const wine = slot?.wine as CellarWine | null | undefined;
                  const status = wine?.drinking_window_status ?? null;
                  const isHighlighted = !!highlightedWineId && wine?.id === highlightedWineId;
                  const isDimmed = !!highlightedWineId && !!wine && wine.id !== highlightedWineId;
                  const isMovingSource = !!moving && moving.row === row && moving.col === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.slot,
                        { width: slotSize, height: slotSize },
                        wine
                          ? { backgroundColor: STATUS_COLORS[status ?? 'unknown'] + '33', borderColor: STATUS_COLORS[status ?? 'unknown'] }
                          : styles.slotEmpty,
                        isHighlighted && styles.slotHighlighted,
                        isDimmed && styles.slotDimmed,
                        isMovingSource && styles.slotMovingSource,
                      ]}
                      onPress={() => openSlot(row, col)}
                      onLongPress={() => pickUpSlot(row, col)}
                      delayLongPress={400}
                    >
                      {wine ? (
                        <Text
                          style={[
                            styles.slotText,
                            { fontSize: slotFontSize, lineHeight: slotLineHeight },
                            isHighlighted && styles.slotTextHighlighted,
                          ]}
                          numberOfLines={2}
                        >
                          {truncate(wine.wine_name, slotMaxChars)}{wine.vintage ? `\n${wine.vintage}` : ''}
                        </Text>
                      ) : (
                        <Text style={styles.slotPlus}>+</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Wine list */}
        {winesInRack.length > 0 && (
          <View style={styles.wineList}>
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

            {filteredWines.length === 0 && (
              <Text style={styles.searchNoResults}>No wines match "{searchQuery}"</Text>
            )}

            {filteredWines.map(({ wine, count }) => {
              const active = highlightedWineId === wine.id;
              return (
                <TouchableOpacity
                  key={wine.id}
                  style={[styles.wineRow, active && styles.wineRowActive]}
                  onPress={() => toggleHighlight(wine.id)}
                  onLongPress={() => confirmDeleteWine(wine.id, wine.wine_name)}
                  delayLongPress={400}
                >
                  <View style={styles.wineRowMain}>
                    <Text style={[styles.wineRowName, active && styles.wineRowNameActive]} numberOfLines={2}>
                      {wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}
                    </Text>
                    {wine.region ? <Text style={styles.wineRowDetail}>{wine.region}</Text> : null}
                  </View>
                  <Text style={[styles.wineRowCount, active && styles.wineRowCountActive]}>
                    {count} {count === 1 ? 'bottle' : 'bottles'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
      </ScrollView>

      {/* Placement modal — opens when the user taps an empty slot while a
          pending wine is set. Asks how many bottles to place; orientation
          only shown if > 1 bottle. Skips already-occupied slots so we don't
          stomp an existing wine in the path. */}
      <Modal visible={placingAt !== null} transparent animationType="fade" onRequestClose={() => !placing && setPlacingAt(null)}>
        <View style={styles.placeOverlay}>
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
        </View>
      </Modal>
      {/* Edit-rack modal — Wipe Contents / Rename / Delete. */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.placeOverlay}>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 50 },
  title: { flex: 1, fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'center', letterSpacing: 1 },
  rotateBtn: { alignItems: 'flex-end', width: 80 },
  rotateBtnText: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  scrollHint: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingBottom: spacing.xs },
  placeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  placeSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  placeTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  placeBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  placeInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, backgroundColor: colors.surface, textAlign: 'center', marginBottom: spacing.md },
  placeFieldLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  placeOrientationRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  placeOrientationBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  placeOrientationBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.15)' },
  placeOrientationText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  placeOrientationTextActive: { color: colors.gold },
  placeConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  placeConfirmText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  placeCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  placeCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  editRackBtn: { alignSelf: 'center', marginTop: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  editRackBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: '#FFFFFF', letterSpacing: 1, textTransform: 'uppercase' },
  editActionBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  editActionBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  editActionBtnDanger: { borderColor: colors.gold },
  editActionBtnTextDanger: { color: colors.gold },
  slotMovingSource: { borderColor: colors.gold, borderWidth: 2, opacity: 0.4 },
  movingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)' },
  movingBannerText: { flex: 1, fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, lineHeight: 18 },
  movingCancelLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textDecorationLine: 'underline' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  gridRow: { flexDirection: 'row' },
  slot: { borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  slotEmpty: { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'transparent' },
  slotHighlighted: { borderColor: '#FFFFFF', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  slotDimmed: { opacity: 0.25 },
  slotText: { fontSize: 8, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'center', lineHeight: 10 },
  slotTextHighlighted: { color: '#FFFFFF' },
  slotPlus: { fontSize: 14, color: 'rgba(255,255,255,0.20)', fontFamily: 'CormorantGaramond_400Regular' },
  wineList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  rackHint: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md, lineHeight: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text },
  searchClear: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },
  searchClearText: { fontSize: 13, color: colors.textMuted },
  searchNoResults: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  wineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowActive: { borderBottomColor: colors.gold },
  wineRowMain: { flex: 1 },
  wineRowName: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  wineRowNameActive: { color: colors.gold },
  wineRowDetail: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  wineRowCount: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  wineRowCountActive: { color: colors.gold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  modalProducer: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: 2 },
  modalSub: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  scoreLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreValue: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  tastingNotes: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 20, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  noteLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background, minHeight: 72, marginBottom: spacing.md },
  saveNoteButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  saveNoteText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  clearButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, alignItems: 'center', marginBottom: spacing.md },
  clearButtonText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  cancelButton: { alignItems: 'center', marginTop: spacing.sm },
  cancelText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  removeHeading: { fontSize: 15, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  fieldLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background, marginBottom: spacing.md },
  rackRemovalMsg: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  savedBanner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, alignItems: 'center' },
  savedBannerText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, letterSpacing: 0.3 },
  pendingBanner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, alignItems: 'center' },
  pendingBannerText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, letterSpacing: 0.3 },
});
