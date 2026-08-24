import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import { CityAutocomplete } from './CityAutocomplete';
import { WineIdentityHeader } from './WineIdentityHeader';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { findExistingReview, missingReviewFields } from '../utils/reviewDedup';
import { normaliseCity } from '../utils/city';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { WineRecommendation, ChosenWine } from '../types/wine';

// Today's date as yyyy-mm-dd (local time). Default Date for the review's
// drinking date — the most useful value 99% of the time since users
// review wines right after drinking them.
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// A vintage must be a real four-digit year (or an explicitly-confirmed
// non-vintage). Extraction sometimes yields 0 or null when it can't read a
// year off a list — those must never be saved silently, so we treat them as
// invalid and make the user confirm.
function isValidVintageYear(v: number | null | undefined): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1800 && v <= new Date().getFullYear() + 1;
}

// One-line summary for the collapsed "Discovered At" row. Combines whatever
// the user has into a readable phrase so they don't need to expand the
// editor unless something looks wrong.
function formatDiscoveredSummary(restaurant: string, city: string, dateIso: string): string {
  const place = [restaurant, city].map((s) => s.trim()).filter(Boolean).join(', ');
  let prettyDate = '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    const d = new Date(dateIso + 'T00:00:00');
    if (!Number.isNaN(d.getTime())) {
      prettyDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  if (place && prettyDate) return `${place} · ${prettyDate}`;
  if (place) return place;
  if (prettyDate) return prettyDate;
  return 'Tap edit to add location';
}

interface Props {
  wine: WineRecommendation | null;
  visible: boolean;
  scanSessionId?: string | null;
  initialRestaurantName?: string | null;
  initialCity?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ChosenWineModal({ wine, visible, scanSessionId, initialRestaurantName, initialCity, onClose, onSaved }: Props) {
  const { session } = useAuth();
  const { save, update, chosenWines } = useChosenWines();

  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  // Drinking window (optional) — a from/to year pair, stored as "YYYY - YYYY".
  const [drinkingFrom, setDrinkingFrom] = useState('');
  const [drinkingTo, setDrinkingTo] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [saved, setSaved] = useState(false);
  // Drinking date — defaults to today, editable via the Discovered At
  // (edit) link. Stored as yyyy-mm-dd; pre-filled on every open so the
  // value always matches "today" if the user didn't touch it.
  const [reviewDate, setReviewDate] = useState(todayIso());
  // Discovered-At editor starts collapsed — the previous screen already
  // captured the restaurant and city, so we assume they're correct unless
  // the user opens the editor to adjust.
  const [editingLocation, setEditingLocation] = useState(false);
  // Vintage the review will actually be saved with. Seeded from the pick, but
  // if that isn't a valid year the user is asked to confirm it before saving
  // (see the vintage-confirm prompt below).
  const [vintageValue, setVintageValue] = useState<number | null>(null);
  const [vintagePromptOpen, setVintagePromptOpen] = useState(false);
  const [vintageDraft, setVintageDraft] = useState('');

  useEffect(() => {
    if (visible) {
      setRestaurant(initialRestaurantName ?? '');
      setCity(initialCity ?? '');
      setListPrice(wine?.menuPrice != null ? String(wine.menuPrice) : '');
      setTastingNote('');
      setOtherObservations('');
      setUserScore(null);
      setIsFavourite(false);
      setSaved(false);
      setReviewDate(todayIso());
      setEditingLocation(false);
      setVintageValue(isValidVintageYear(wine?.vintage) ? wine!.vintage : null);
      setVintagePromptOpen(false);
      setVintageDraft('');

      // If we don't already have a city (e.g. fresh scan that hasn't been
      // saved yet), try a quick GPS reverse-geocode to pre-fill it. Best
      // effort — silent failure if permission is denied or geocoding fails.
      // The user can edit the field if Vinster's guess is wrong.
      if (!initialCity || !initialCity.trim()) {
        (async () => {
          try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') return;
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
            const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            const rawDetected = geo?.city ?? geo?.subregion ?? geo?.region ?? null;
            const detected = rawDetected ? normaliseCity(rawDetected) : null;
            if (detected) {
              // Only fill if the user hasn't started typing in the meantime.
              setCity((current) => (current.trim() ? current : detected));
            }
          } catch {
            /* location unavailable */
          }
        })();
      }
    }
  }, [visible, initialRestaurantName, initialCity, wine?.menuPrice, wine?.vintage]);

  async function handleSave() {
    if (!wine || !session) return;
    // Dismiss keyboard explicitly — without this, on iOS the first tap on
    // Save sometimes only dismisses the numeric keypad (from the score
    // input) and the user has to tap a second time to actually save.
    Keyboard.dismiss();
    // Every review must carry a vintage. If the pick didn't come with a valid
    // year (list scans sometimes yield 0 or nothing), stop and ask the user to
    // confirm it — no review is ever saved with a bogus "0" vintage.
    if (!isValidVintageYear(vintageValue)) {
      setVintageDraft('');
      setVintagePromptOpen(true);
      return;
    }
    await afterVintage(vintageValue);
  }

  // Continue the save once we have a confirmed vintage (a real year, or null
  // for a user-confirmed non-vintage). Threaded explicitly rather than read
  // from state so the value is never stale after the confirm prompt.
  async function afterVintage(vintage: number | null) {
    if (!wine || !session) return;
    // Pre-save nudge: list anything empty except the optional Personal Notes.
    const missing = missingReviewFields([
      { label: 'Your Review', filled: !!tastingNote.trim() },
      { label: 'Your Score', filled: userScore != null },
      { label: 'List Price', filled: !!listPrice.trim() },
      { label: 'a Location', filled: !!(restaurant.trim() || city.trim()) },
    ]);
    if (missing.length) {
      showAlert({
        title: 'Ready to Save?',
        body: `You're missing ${missing.join(', ')}.`,
        buttons: [
          { text: 'Yes, Save', onPress: () => { void proceedSave(vintage); } },
          { text: 'Return to Review', style: 'cancel' },
        ],
      });
      return;
    }
    await proceedSave(vintage);
  }

  // Confirm handlers for the vintage prompt.
  function submitVintageYear() {
    const raw = vintageDraft.trim();
    const y = parseInt(raw, 10);
    if (!/^\d{4}$/.test(raw) || !isValidVintageYear(y)) {
      showAlert({ title: 'Enter a four-digit year', body: 'A vintage must be a four-digit year, e.g. 2023 — or choose Non-vintage if this wine has none.' });
      return;
    }
    setVintageValue(y);
    setVintagePromptOpen(false);
    void afterVintage(y);
  }
  function confirmNonVintage() {
    setVintageValue(null);
    setVintagePromptOpen(false);
    void afterVintage(null);
  }

  async function proceedSave(vintage: number | null) {
    if (!wine || !session) return;
    // If this wine is already in Your Wine Reviews, offer to add a NEW dated
    // entry to that review or start a separate one — never to edit/replace it.
    const existing = findExistingReview(chosenWines, {
      producer: wine.producer,
      wineName: wine.name,
      vintage,
    });
    if (existing) {
      // A bottle pick added from the list starts as an empty row (no note,
      // score or observations). Reviewing it right after adding just fills that
      // row in — it's the FIRST review, not an edit of a prior one.
      const hasContent = !!(
        (existing.tasting_note ?? '').trim() ||
        existing.user_score != null ||
        (existing.other_observations ?? '').trim()
      );
      if (!hasContent) {
        await doSave('update', existing, vintage);
        return;
      }
      const dateLabel = existing.chosen_at ? new Date(existing.chosen_at).toLocaleDateString('en-GB') : 'a previous date';
      showAlert({
        title: "You've reviewed this wine before",
        body: `You reviewed this wine on ${dateLabel}. Add this as a new dated entry on that review, or start a separate new review?`,
        buttons: [
          { text: 'Add to that review', onPress: () => { void doSave('append', existing, vintage); } },
          { text: 'Create a new review', onPress: () => { void doSave('create', null, vintage); } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await doSave('create', null, vintage);
  }

  async function doSave(mode: 'create' | 'update' | 'append', existing: ChosenWine | null, vintage: number | null) {
    if (!wine || !session) return;
    // Save with the confirmed vintage, not whatever the pick arrived with.
    const wineForSave: WineRecommendation = { ...wine, vintage };
    const trimmedPrice = listPrice.trim();
    const parsedPrice = trimmedPrice ? parseFloat(trimmedPrice) : NaN;
    const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
    // Normalise on save so anything the user typed by hand ("Greater London")
    // gets canonicalised before it hits the DB.
    const cityClean = normaliseCity(city);
    const userDrinkingWindow = [drinkingFrom.trim(), drinkingTo.trim()].filter(Boolean).join(' - ') || null;
    try {
      if (mode === 'append' && existing) {
        // "Add to this review" = a NEW dated entry joining the existing review's
        // card (same review_group_id), leaving the earlier entry untouched.
        await save.mutateAsync({
          wine: wineForSave, scanSessionId: scanSessionId ?? null,
          restaurantName: restaurant, city: cityClean,
          tastingNote, otherObservations, userScore, listPrice: price, isFavourite,
          reviewDate, userDrinkingWindow,
          reviewGroupId: existing.review_group_id ?? existing.id,
        });
      } else if (mode === 'update' && existing) {
        // Only reached for a bare, unreviewed bottle pick — fill its first
        // review in place (this stamps reviewed_at and starts its 24h window).
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        await update.mutateAsync({
          id: existing.id,
          input: { restaurantName: restaurant, city: cityClean, tastingNote, otherObservations, userScore, listPrice: price, isFavourite, userDrinkingWindow, ...identity },
        });
      } else {
        await save.mutateAsync({
          wine: wineForSave, scanSessionId: scanSessionId ?? null,
          restaurantName: restaurant, city: cityClean,
          tastingNote, otherObservations, userScore, listPrice: price, isFavourite,
          reviewDate, userDrinkingWindow,
        });
      }
      setSaved(true);
      onSaved();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  if (!wine) return null;

  // Match the symbol on the recommendation card so the "List Price" the
  // user sees aligns with the menu currency captured at scan time.
  const currencySymbol = (() => {
    const cur = (wine.currency ?? 'GBP').toUpperCase();
    const map: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
    return map[cur] ?? `${cur} `;
  })();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Back link in the top-left mirrors the rest of the app's
              header pattern (Cellar, Reviews, Restaurants etc.). The
              previous bottom-of-screen Cancel link is gone — keeping
              navigation affordances in one consistent place. */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onClose}
            disabled={save.isPending || update.isPending}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text accessibilityLabel="Back" style={styles.backBtnText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favouriteBtn}
            onPress={() => setIsFavourite((v) => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.favouriteStar, isFavourite && styles.favouriteStarActive]}>{isFavourite ? '★' : '☆'}</Text>
          </TouchableOpacity>

          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>

            <WineIdentityHeader
              producer={wine.producer}
              wineName={wine.name}
              vintage={vintageValue}
              region={wine.region}
              grape={(wine as any).grape}
              align="center"
              size="lg"
            />

            {/* Date · where you drank it — a header stamp under the title
                (location + price are already pre-filled from the scan). The
                editable date/location fields live only in the edit flow. */}
            {(() => {
              const loc = [restaurant.trim(), city.trim()].filter(Boolean).join(', ');
              const dateStr = reviewDate ? new Date(reviewDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
              const stamp = [dateStr, loc].filter(Boolean).join(' · ');
              return stamp ? <Text style={styles.stampLine}>{stamp}</Text> : null;
            })()}

            <View style={styles.divider} />

            {/* Your Score — top of the input fields. */}
            <Text style={styles.sectionLabel}>Your Score</Text>
            <TextInput
              style={[styles.input, styles.scoreInput]}
              value={userScore != null ? String(userScore) : ''}
              onChangeText={(text) => {
                if (text === '') { setUserScore(null); return; }
                const n = parseInt(text, 10);
                if (!isNaN(n)) setUserScore(Math.min(100, Math.max(1, n)));
              }}
              placeholder="e.g. 88"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />

            <View style={styles.dictateRow}>
              <Text style={styles.sectionLabel}>Your Review</Text>
              <MicButton value={tastingNote} onChangeText={setTastingNote} onClear={() => setTastingNote('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={tastingNote}
              onChangeText={setTastingNote}
              placeholder="Flavours, texture, finish…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.dictateRow}>
              <Text style={styles.sectionLabel}>Personal Notes</Text>
              <MicButton value={otherObservations} onChangeText={setOtherObservations} onClear={() => setOtherObservations('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={otherObservations}
              onChangeText={setOtherObservations}
              placeholder="Value, food match, service, occasion…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.sectionLabel}>Drinking Window — your call (optional)</Text>
            <View style={styles.dwRow}>
              <TextInput
                style={[styles.input, styles.dwInput]}
                value={drinkingFrom}
                onChangeText={(t) => setDrinkingFrom(t.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="From (e.g. 2026)"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
              <Text style={styles.dwDash}>–</Text>
              <TextInput
                style={[styles.input, styles.dwInput]}
                value={drinkingTo}
                onChangeText={(t) => setDrinkingTo(t.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="To (e.g. 2032)"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <Text style={styles.sectionLabel}>List Price ({currencySymbol.trim() || wine.currency})</Text>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={listPrice}
              onChangeText={(text) => {
                // Allow digits and a single decimal point only; the menu
                // price from the scan can be non-integer (e.g. 24.50).
                const cleaned = text.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                const normalised = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
                setListPrice(normalised);
              }}
              placeholder={wine.menuPrice != null ? String(wine.menuPrice) : 'e.g. 65'}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            {saved ? (
              <View style={styles.savedBlock}>
                <Text style={styles.savedNote}>Review Saved — you can edit this review for 24 hours.</Text>
                <View style={styles.savedRow}>
                  <TouchableOpacity onPress={() => { onClose(); router.push('/wines/chosen'); }}>
                    <Text style={styles.savedLink}>View in Your Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={save.isPending || update.isPending}
                >
                  <Text style={styles.saveButtonText}>
                    {save.isPending || update.isPending ? 'Saving…' : 'Add to Your Wine Reviews'}
                  </Text>
                </TouchableOpacity>
                {/* Cancel link removed from the bottom — exit is via
                    the Back link in the top-left header now, matching
                    the rest of the app's navigation pattern. */}
              </>
            )}

          </KeyboardAwareScrollView>
        </View>
      </View>

      {/* Vintage-confirm prompt — shown when the pick has no valid year. Every
          review must record a vintage, so the user either types the four-digit
          year or explicitly confirms the wine is non-vintage. */}
      <Modal visible={vintagePromptOpen} transparent animationType="fade" onRequestClose={() => setVintagePromptOpen(false)}>
        <View style={styles.vpOverlay}>
          <View style={styles.vpCard}>
            <Text style={styles.vpTitle}>What's the vintage?</Text>
            <Text style={styles.vpBody}>
              We couldn't read a vintage for this wine. Enter its four-digit year, or confirm it's non-vintage.
            </Text>
            <TextInput
              style={styles.vpInput}
              value={vintageDraft}
              onChangeText={(t) => setVintageDraft(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="e.g. 2023"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={submitVintageYear}
            />
            <TouchableOpacity style={styles.vpPrimaryBtn} onPress={submitVintageYear} activeOpacity={0.85}>
              <Text style={styles.vpPrimaryText}>Save this vintage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vpLinkBtn} onPress={confirmNonVintage} activeOpacity={0.7}>
              <Text style={styles.vpLinkText}>This wine is non-vintage (NV)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vpLinkBtn} onPress={() => setVintagePromptOpen(false)} activeOpacity={0.7}>
              <Text style={styles.vpCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Vintage-confirm prompt.
  vpOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.lg },
  vpCard: { backgroundColor: colors.surfaceElevated, borderRadius: 16, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  vpTitle: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  vpBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text, opacity: 0.85, textAlign: 'center', marginBottom: spacing.md, lineHeight: 20 },
  vpInput: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 18, textAlign: 'center', paddingVertical: spacing.sm, letterSpacing: 2, marginBottom: spacing.md },
  vpPrimaryBtn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  vpPrimaryText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.background },
  vpLinkBtn: { paddingVertical: spacing.sm, alignItems: 'center' },
  vpLinkText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.gold },
  vpCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text, opacity: 0.6 },
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  favouriteBtn: {
    position: 'absolute',
    top: 56,
    right: spacing.xl,
    zIndex: 10,
    padding: 4,
  },
  // Back link mirrors the favourite-star position on the opposite
  // side — same top offset so they sit on a shared visual baseline.
  backBtn: {
    position: 'absolute',
    top: 56,
    left: spacing.xl,
    zIndex: 10,
    padding: 4,
  },
  backBtnText: {
    // Back/nav arrow — gold, matching the rest of the app
    fontFamily: fonts.bodyRegular,
    fontSize: 22,
    color: colors.gold,
  },
  favouriteStar: {
    fontSize: 22,
    color: colors.textMuted,
  },
  favouriteStarActive: {
    color: colors.gold,
  },
  content: {
    padding: spacing.xl,
    // Clear of the back arrow + favourite star (top: 56, ~30px tall).
    paddingTop: 104,
    paddingBottom: 60,
  },
  heading: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  wineProducer: {
    // Wine producer caption — Inter italic
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  // Section label + dictation mic on one line.
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },

  fieldLabel: {
    // Field label — form label, Inter
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 15,
    // Form input — Inter
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  noteInput: {
    minHeight: 80,
    marginBottom: spacing.md,
  },
  // Score is 1–3 digits — keep the field short, and leave a clear gap before
  // the "Your Review" field below it.
  scoreInput: {
    width: 100,
    marginBottom: spacing.lg,
  },
  // Price is a handful of digits — no need to span the page.
  priceInput: {
    width: 150,
  },
  // Date · location header stamp under the title (matches the other review modals).
  stampLine: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', marginTop: 5, letterSpacing: 0.3 },
  // Drinking-window from/to year pair.
  dwRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  dwInput: { flex: 1, marginBottom: 0 },
  dwDash: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted },
  scoreHint: {
    // Score hint — Inter italic
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  // Compact "Discovered At [summary] (edit)" row that replaces the old
  // "Where did you drink it?" three-field block. Expands inline when the
  // (edit) link is tapped.
  discoveredRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  discoveredLabel: {
    // Section-title-style label ("Discovered At") — Cormorant
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.text,
  },
  editLink: {
    // Inline edit link (button) — Cormorant
    fontFamily: fonts.headingRegular,
    fontSize: 13,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
  discoveredSummary: {
    // Italic summary caption — Inter
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  locationEditor: {
    marginBottom: spacing.sm,
  },
  dateHint: {
    // Date hint — Inter italic
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
    marginBottom: spacing.sm,
  },
  // cancelLink / cancelLinkText removed — exit is now via the top-
  // left Back link (see backBtn / backBtnText).
  savedBlock: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm, gap: 6 },
  savedNote: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.md, lineHeight: 20 },
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedText: {
    // "Saved —" label paired with the View link — Cormorant to match the link
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.gold,
  },
  savedLink: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
  saveButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.gold,
  },
});
