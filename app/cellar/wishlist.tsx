import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar, useWishList } from '../../src/hooks/useCellar';
import { syncEditToChosen, splitLocationString } from '../../src/services/reviewSync';
import { getWineIntelligence } from '../../src/api/label';
import { useRacks } from '../../src/hooks/useRacks';
import { useRackStore } from '../../src/stores/rackStore';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { currencySymbol } from '../../src/constants/currency';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { showAlert } from '../../src/components/AppAlert';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function WishListCard({ wine, onMoveToCellar, onDelete, onUpdateNote, onUpdateLocation }: {
  wine: CellarWine;
  onMoveToCellar: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onUpdateLocation: (id: string, location: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(wine.tasting_notes ?? '');
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationText, setLocationText] = useState(wine.user_notes ?? '');

  function handleSaveNote() {
    onUpdateNote(wine.id, noteText);
    setEditingNote(false);
  }

  function handleSaveLocation() {
    onUpdateLocation(wine.id, locationText);
    setEditingLocation(false);
  }

  const dateLabel = wine.date_received
    ? formatDate(wine.date_received)
    : formatDate(wine.created_at);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.wineName}>
            {wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}
          </Text>
          {wine.region || wine.grape_variety ? (
            <Text style={styles.wineDetail}>
              {[wine.region, wine.grape_variety].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>

      {editingLocation ? (
        <View style={styles.noteEditBlock}>
          <TextInput
            style={[styles.noteInput, { minHeight: 44 }]}
            value={locationText}
            onChangeText={setLocationText}
            placeholder="Restaurant, city…"
            placeholderTextColor={colors.textMuted}
            autoFocus
            onSubmitEditing={handleSaveLocation}
            returnKeyType="done"
          />
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => { setEditingLocation(false); setLocationText(wine.user_notes ?? ''); }}>
              <Text style={styles.noteCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noteSaveBtn} onPress={handleSaveLocation}>
              <Text style={styles.noteSaveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.metaRow} onPress={() => setEditingLocation(true)}>
          <Text style={styles.metaLabel}>Discovered at</Text>
          <Text style={[styles.metaValue, !wine.user_notes && { color: colors.gold, fontStyle: 'italic' }]}>
            {wine.user_notes || 'Tap to add location'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Date</Text>
        <Text style={styles.metaValue}>{dateLabel}</Text>
      </View>

      {editingNote ? (
        <View style={styles.noteEditBlock}>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Your tasting note…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.noteEditActions}>
            <TouchableOpacity onPress={() => { setEditingNote(false); setNoteText(wine.tasting_notes ?? ''); }}>
              <Text style={styles.noteCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noteSaveBtn} onPress={handleSaveNote}>
              <Text style={styles.noteSaveBtnText}>Save Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noteBlock}>
          {wine.tasting_notes ? (
            <Text style={styles.noteText}>{wine.tasting_notes}</Text>
          ) : (
            <Text style={styles.notePlaceholder}>No tasting note yet</Text>
          )}
          <TouchableOpacity onPress={() => setEditingNote(true)}>
            <Text style={styles.editNoteLink}>{wine.tasting_notes ? 'Edit Note' : 'Add Note'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.moveBtn} onPress={() => onMoveToCellar(wine.id)}>
          <Text style={styles.moveBtnText}>Add to Cellar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(wine.id)}>
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type ConfirmAction =
  | { kind: 'move'; id: string }
  | { kind: 'delete'; id: string }
  | null;

export default function WishListScreen() {
  const { session } = useAuth();
  const { wines, isLoading, updateWine, deleteWine } = useWishList();
  const { wines: cellarWines, updateWine: updateCellarWine } = useCellar();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const { setPendingWineId, setPendingStorageType } = useRackStore();
  const qc = useQueryClient();
  const userCurrency = preferences?.defaultCurrency ?? 'GBP';
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [moveQuantity, setMoveQuantity] = useState('1');
  const [movePurchasePrice, setMovePurchasePrice] = useState('');
  const [moveSelectedRackId, setMoveSelectedRackId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  const moveWine = confirm?.kind === 'move' ? wines.find((w) => w.id === confirm.id) ?? null : null;

  function findMatchingCellarWine(w: CellarWine) {
    const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
    const wantedProducer = norm(w.producer);
    const wantedName = norm(w.wine_name);
    const wantedVintage = (w.vintage ?? '').trim();
    return cellarWines.find((c) =>
      norm(c.producer) === wantedProducer &&
      norm(c.wine_name) === wantedName &&
      (c.vintage ?? '').trim() === wantedVintage
    ) ?? null;
  }

  function handleMoveToCellar(id: string) {
    const w = wines.find((x) => x.id === id);
    setMoveQuantity(String(w?.quantity ?? 1));
    setMovePurchasePrice(w?.purchase_price != null ? String(w.purchase_price) : '');
    setMoveSelectedRackId(null);
    setConfirm({ kind: 'move', id });
  }

  function handleDelete(id: string) {
    setConfirm({ kind: 'delete', id });
  }

  function closeConfirm() {
    setConfirm(null);
  }

  async function handleConfirmMove() {
    if (!confirm || confirm.kind !== 'move' || !moveWine) return;
    const match = findMatchingCellarWine(moveWine);
    if (match) {
      const existingQty = match.quantity;
      const wineLabel = `${match.wine_name}${match.vintage ? ` ${match.vintage}` : ''}`;
      showAlert({
        title: 'Already in your cellar',
        body: `You already have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of ${wineLabel}. Add this bottle to that listing?`,
        buttons: [
          { text: 'Yes', onPress: () => performMergeFromWishlist(match.id, existingQty) },
          { text: 'No, create a new line', onPress: performMove },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await performMove();
  }

  async function performMove() {
    if (!confirm || confirm.kind !== 'move' || !moveWine) return;
    const qty = parseInt(moveQuantity) || 1;
    const parsedPrice = parseFloat(movePurchasePrice);
    const validPrice = !Number.isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
    setMoving(true);
    try {
      // The wishlist row uses tasting_notes for the user-written note
      // and user_notes for the "Discovered at" location. The cellar wine
      // card reverses these: tasting_notes is the AI-generated Deep
      // Tasting Note, user_notes is the users Additional Notes. Move
      // the wishlist content into the cellar layout:
      //   user note  → user_notes (Additional Notes)
      //   location   → appended to user_notes
      //   tasting_notes → AI deep note from wine-intelligence
      const userWishlistNote = (moveWine.tasting_notes ?? '').trim();
      const discoveredAt = (moveWine.user_notes ?? '').trim();
      const mergedUserNotes =
        [userWishlistNote, discoveredAt ? `Discovered at: ${discoveredAt}` : '']
          .filter(Boolean)
          .join('\n\n') || null;

      // Best-effort AI intelligence pull so the cellar wine card lands
      // with a real Vinster's Deep AI Tasting Note plus critic score,
      // drinking window and estimated value. If the call fails (network,
      // edge function error) we still complete the move with the rest
      // of the fields and clear tasting_notes so the user-written note
      // isn't shown under the AI heading.
      let intel: Awaited<ReturnType<typeof getWineIntelligence>> | null = null;
      try {
        intel = await getWineIntelligence(
          {
            producer: moveWine.producer ?? '',
            region: moveWine.region ?? '',
            wineName: moveWine.wine_name || null,
            vintage: moveWine.vintage || 'NV',
          } as any,
          userCurrency,
        );
      } catch {
        intel = null;
      }

      await updateWine.mutateAsync({
        id: confirm.id,
        updates: {
          is_wishlist: false,
          quantity: qty,
          user_notes: mergedUserNotes,
          ...(intel
            ? {
                critic_score: intel.criticScore,
                critic_score_note: intel.criticScoreNote ?? null,
                drinking_window_from: intel.drinkingWindowFrom,
                drinking_window_to: intel.drinkingWindowTo,
                drinking_window_status: intel.drinkingWindowStatus,
                tasting_notes: intel.tastingNotes,
                grape_variety: intel.grapeVariety ?? moveWine.grape_variety ?? null,
                estimated_value: intel.estimatedValue,
                estimated_value_currency: userCurrency,
                estimated_value_at: intel.estimatedValue != null ? new Date().toISOString() : null,
              }
            : {
                // No AI pull — clear tasting_notes so the wishlist users
                // tasting note doesn't appear on the cellar card under
                // the AI heading. The user can refresh from the wine
                // detail screen later.
                tasting_notes: null,
              }),
          ...(validPrice != null
            ? { purchase_price: validPrice, purchase_price_currency: userCurrency }
            : {}),
        },
      });

      // "+ Create new rack" → kick the user into the rack-photograph flow
      // with the wine pre-flagged for placement.
      if (moveSelectedRackId === '__new__') {
        setPendingWineId(confirm.id);
        setPendingStorageType('rack');
        setConfirm(null);
        router.push('/cellar/rack/camera');
        return;
      }

      // Existing rack picked → set pendingWineId and open the rack so the
      // user can tap a slot to place the bottle.
      if (moveSelectedRackId) {
        setPendingWineId(confirm.id);
        setConfirm(null);
        router.push(`/cellar/rack/${moveSelectedRackId}` as any);
        return;
      }

      // No rack — wine is in the cellar without a placement. Confirm
      // the move and return the user to their Wish List (where they
      // already were). The View in cellar option uses push so the back
      // stack still holds the wish list for a one-tap return.
      setConfirm(null);
      showAlert({
        title: 'Moved to your cellar',
        body: `${moveWine.wine_name} is now in your cellar.`,
        buttons: [
          { text: 'Back to Wish List' },
          { text: 'View in cellar', onPress: () => router.push('/cellar/list') },
        ],
      });
    } catch (err) {
      showAlert({ title: 'Error', body: 'Could not move wine. Please try again.' });
    } finally {
      setMoving(false);
    }
  }

  async function performMergeFromWishlist(existingId: string, existingQty: number) {
    if (!confirm || confirm.kind !== 'move' || !moveWine) return;
    const qty = parseInt(moveQuantity) || 1;
    const newQty = existingQty + qty;
    const parsedPrice = parseFloat(movePurchasePrice);
    const validPrice = !Number.isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
    setMoving(true);
    try {
      // Fill-gaps merge: the user explicitly tapped "Yes, add to
      // listing" which means the existing cellar row is the source of
      // truth. Don't overwrite curated content (AI tasting note,
      // critic data, existing user notes, existing purchase price).
      // Only carry across wishlist-side content that lands in an
      // otherwise empty cellar field, so the user doesn't lose
      // anything they wrote on the wishlist when no equivalent already
      // exists on the cellar row.
      const existingCellar = cellarWines.find((w) => w.id === existingId);
      const userWishlistNote = (moveWine.tasting_notes ?? '').trim();
      const discoveredAt = (moveWine.user_notes ?? '').trim();
      const mergedWishlistNotes =
        [userWishlistNote, discoveredAt ? `Discovered at: ${discoveredAt}` : '']
          .filter(Boolean)
          .join('\n\n');
      const existingUserNotes = (existingCellar?.user_notes ?? '').trim();
      const userNotesUpdate =
        existingUserNotes.length === 0 && mergedWishlistNotes.length > 0
          ? { user_notes: mergedWishlistNotes }
          : {};
      const purchasePriceUpdate =
        existingCellar?.purchase_price == null && validPrice != null
          ? { purchase_price: validPrice, purchase_price_currency: userCurrency }
          : {};

      await updateCellarWine.mutateAsync({
        id: existingId,
        updates: {
          quantity: newQty,
          ...userNotesUpdate,
          ...purchasePriceUpdate,
        },
      });
      // The wishlist row is no longer needed — the wine now lives in the
      // existing cellar listing. Hard delete (not archive) so it doesn't
      // resurface in the wishlist or the archive.
      await deleteWine.mutateAsync(confirm.id);
      setConfirm(null);
      showAlert({
        title: 'Moved to your cellar',
        body: `Updated existing listing — you now have ${newQty} bottle${newQty === 1 ? '' : 's'}.`,
        buttons: [
          { text: 'Back to Wish List' },
          { text: 'View in cellar', onPress: () => router.push('/cellar/list') },
        ],
      });
    } catch {
      showAlert({ title: 'Error', body: 'Could not update listing. Please try again.' });
    } finally {
      setMoving(false);
    }
  }

  function handleConfirmDelete() {
    if (!confirm || confirm.kind !== 'delete') return;
    deleteWine.mutate(confirm.id);
    setConfirm(null);
  }

  // Wishlist edits are mirrored to any matching chosen_wines (review)
  // row so reviews stay in lock-step. Best-effort: sync failures don't
  // surface — the wishlist save itself has already succeeded.
  async function syncWishlistEditToChosen(
    wine: typeof wines[number],
    fields: Parameters<typeof syncEditToChosen>[2]
  ) {
    if (!session) return;
    try {
      await syncEditToChosen(
        session.user.id,
        { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage },
        fields,
      );
      qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
    } catch (err) {
      console.warn('[wishlist→review sync] failed:', err);
    }
  }

  function handleUpdateNote(id: string, note: string) {
    const trimmed = note.trim() || null;
    const wine = wines.find((w) => w.id === id);
    updateWine.mutate({ id, updates: { tasting_notes: trimmed } }, {
      onSuccess: () => {
        if (wine) syncWishlistEditToChosen(wine, { tastingNote: trimmed ?? '' });
      },
    });
  }

  function handleUpdateLocation(id: string, location: string) {
    const trimmed = location.trim() || null;
    const wine = wines.find((w) => w.id === id);
    const { restaurantName, city } = splitLocationString(trimmed);
    updateWine.mutate({ id, updates: { user_notes: trimmed } }, {
      onSuccess: () => {
        if (wine) syncWishlistEditToChosen(wine, { restaurantName, city });
      },
    });
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Wish List is a flow destination — reached either directly from
            the Cellar tab or at the end of the add-a-wine flow. Back
            always returns to the Cellar tab rather than popping back
            through the add steps. */}
        <TouchableOpacity onPress={() => router.replace('/(tabs)/cellar')}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wish List</Text>
        <TouchableOpacity onPress={() => router.push('/cellar/add-to-wishlist')}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your wish list"
          body="Save wines you'd like to seek out — sign in to keep your wish list."
        />
      ) : wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your wish list is empty</Text>
          <Text style={styles.emptyBody}>When you review a wine recommendation, tap "Add to Cellar Wish List" to save wines you'd like to seek out.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 80 }}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {wines.map((wine) => (
            <WishListCard
              key={wine.id}
              wine={wine}
              onMoveToCellar={handleMoveToCellar}
              onDelete={handleDelete}
              onUpdateNote={handleUpdateNote}
              onUpdateLocation={handleUpdateLocation}
            />
          ))}
        </ScrollView>
      )}

      <Modal
        visible={confirm?.kind === 'move'}
        transparent
        animationType="slide"
        onRequestClose={() => !moving && closeConfirm()}
      >
        <View style={styles.moveOverlay}>
          <View style={styles.moveSheet}>
            <Text style={styles.moveTitle}>Add to Cellar</Text>
            {moveWine && (
              <Text style={styles.moveWine}>
                {wineHeaderLine(moveWine.producer, moveWine.wine_name, moveWine.vintage)}
              </Text>
            )}

            <Text style={styles.moveLabel}>How many bottles of this wine?</Text>
            <TextInput
              style={styles.moveInput}
              value={moveQuantity}
              onChangeText={setMoveQuantity}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.moveLabel}>Purchase price (optional)</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>{currencySymbol(userCurrency)}</Text>
              <TextInput
                style={styles.priceInput}
                value={movePurchasePrice}
                onChangeText={setMovePurchasePrice}
                placeholder="0.00"
                placeholderTextColor={colors.textSubtle}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.moveLabel}>Storage location (optional)</Text>
            <Text style={styles.moveHint}>Pick a rack to place this bottle in now, or save without and assign later.</Text>
            <View style={styles.rackList}>
              <TouchableOpacity
                style={[styles.rackOptionPrimary, moveSelectedRackId === null && styles.rackOptionPrimaryActive]}
                onPress={() => setMoveSelectedRackId(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.rackOptionPrimaryText}>Save without placing</Text>
              </TouchableOpacity>
              {racks.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.rackOption, moveSelectedRackId === r.id && styles.rackOptionActive]}
                  onPress={() => setMoveSelectedRackId(r.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.rackOptionText, moveSelectedRackId === r.id && styles.rackOptionTextActive]}>{r.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.rackOptionPrimary, { marginTop: spacing.xs }, moveSelectedRackId === '__new__' && styles.rackOptionPrimaryActive]}
                onPress={() => setMoveSelectedRackId('__new__')}
                activeOpacity={0.8}
              >
                <Text style={styles.rackOptionPrimaryText}>+ Create new rack</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.moveSaveBtn, moving && { opacity: 0.6 }]}
              onPress={handleConfirmMove}
              disabled={moving}
            >
              <Text style={styles.moveSaveBtnText}>
                {moving
                  ? 'Saving…'
                  : moveSelectedRackId === '__new__'
                    ? 'Add to Cellar & Build a New Rack'
                    : moveSelectedRackId
                      ? `Add to Cellar & Place in ${racks.find((r) => r.id === moveSelectedRackId)?.name ?? 'Rack'}`
                      : 'Add to Cellar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeConfirm} style={styles.confirmCancel} disabled={moving}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirm?.kind === 'delete'}
        transparent
        animationType="fade"
        onRequestClose={closeConfirm}
      >
        <TouchableOpacity style={styles.confirmOverlay} activeOpacity={1} onPress={closeConfirm}>
          <TouchableOpacity activeOpacity={1} style={styles.confirmSheet} onPress={() => {}}>
            <Text style={styles.confirmTitle}>Remove from wish list?</Text>
            <Text style={styles.confirmBody}>
              This will remove the wine from your wish list. You can add it again any time.
            </Text>
            <TouchableOpacity
              style={[styles.confirmButton, styles.confirmButtonDanger]}
              onPress={handleConfirmDelete}
            >
              <Text style={[styles.confirmButtonText, styles.confirmButtonTextDanger]}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeConfirm} style={styles.confirmCancel}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 60 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  addText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, width: 60, textAlign: 'right' },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  wineName: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  wineDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: 4 },
  metaLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, minWidth: 80 },
  metaValue: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, flex: 1 },
  noteBlock: { marginTop: spacing.sm, borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: spacing.sm },
  noteText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22, marginBottom: 4 },
  notePlaceholder: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: 4 },
  editNoteLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  noteEditBlock: { marginTop: spacing.sm },
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 90, textAlignVertical: 'top', marginBottom: spacing.sm },
  noteEditActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  noteCancelText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  noteSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  noteSaveBtnText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  moveBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  moveBtnText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13 },
  deleteText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  confirmTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  confirmBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  confirmButtonDanger: { borderColor: colors.gold },
  confirmButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  confirmButtonTextDanger: { color: colors.gold },
  confirmCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  confirmCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  moveOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  moveSheet: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.border, maxHeight: '88%' },
  moveTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  moveWine: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.lg },
  moveLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  moveHint: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: -spacing.xs, marginBottom: spacing.sm, lineHeight: 18 },
  moveInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: colors.surface },
  priceCurrency: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, marginRight: spacing.xs },
  priceInput: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, paddingVertical: spacing.sm },
  rackList: { gap: spacing.xs, marginBottom: spacing.md },
  rackOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionActive: { borderColor: colors.gold, backgroundColor: colors.gold + '22' },
  rackOptionText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  rackOptionTextActive: { color: colors.gold },
  rackOptionPrimary: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionPrimaryActive: { backgroundColor: 'rgba(255,255,255,0.10)' },
  rackOptionPrimaryText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF' },
  moveSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  moveSaveBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, textAlign: 'center' },
});
