import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import { CityAutocomplete } from './CityAutocomplete';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { findExistingReview, appendDatedEntry, todayLabel } from '../utils/reviewDedup';
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
  }, [visible, initialRestaurantName, initialCity, wine?.menuPrice]);

  async function handleSave() {
    if (!wine || !session) return;
    // Dismiss keyboard explicitly — without this, on iOS the first tap on
    // Save sometimes only dismisses the numeric keypad (from the score
    // input) and the user has to tap a second time to actually save.
    Keyboard.dismiss();
    // If this wine is already in Your Wine Reviews, let the user choose
    // rather than silently adding a duplicate row.
    const existing = findExistingReview(chosenWines, {
      producer: wine.producer,
      wineName: wine.name,
      vintage: wine.vintage,
    });
    if (existing) {
      // A bottle pick added from the list starts as an empty row (no note,
      // score or observations). Reviewing it right after adding should just
      // fill that row in — not prompt "you've reviewed this before" (the loop
      // the user hit). Only prompt when there's a real prior review.
      const hasContent = !!(
        (existing.tasting_note ?? '').trim() ||
        existing.user_score != null ||
        (existing.other_observations ?? '').trim()
      );
      if (!hasContent) {
        await doSave('update', existing);
        return;
      }
      const existingDay = existing.chosen_at ? new Date(existing.chosen_at).toISOString().slice(0, 10) : '';
      const todayDay = new Date().toISOString().slice(0, 10);
      if (existingDay === todayDay) {
        showAlert({
          title: 'Already in Your Reviews today',
          body: `You already have this wine in Your Reviews on this date. Keep both, replace the existing one, or discard this?`,
          buttons: [
            { text: 'Keep both', onPress: () => { void doSave('create', null); } },
            { text: 'Replace existing', onPress: () => { void doSave('update', existing); } },
            { text: 'Discard', style: 'cancel' },
          ],
        });
      } else {
        const dateLabel = existing.chosen_at ? new Date(existing.chosen_at).toLocaleDateString('en-GB') : 'a previous date';
        showAlert({
          title: "You've reviewed this wine before",
          body: `You reviewed this wine on ${dateLabel}. Would you like to add to that review, update that review, or create a new review card?`,
          buttons: [
            { text: 'Add to that review', onPress: () => { void doSave('append', existing); } },
            { text: 'Update that review', onPress: () => { void doSave('update', existing); } },
            { text: 'Create a new review card', onPress: () => { void doSave('create', null); } },
            { text: 'Cancel', style: 'cancel' },
          ],
        });
      }
      return;
    }
    await doSave('create', null);
  }

  async function doSave(mode: 'create' | 'update' | 'append', existing: ChosenWine | null) {
    if (!wine || !session) return;
    const trimmedPrice = listPrice.trim();
    const parsedPrice = trimmedPrice ? parseFloat(trimmedPrice) : NaN;
    const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
    // Normalise on save so anything the user typed by hand ("Greater
    // London") gets canonicalised before it hits the DB. Display-side
    // normalisation also runs (see wines/chosen.tsx) but doing it here
    // keeps the stored row clean for sort + dedup downstream.
    const cityClean = normaliseCity(city);
    try {
      if (mode === 'create' || !existing) {
        await save.mutateAsync({
          wine,
          scanSessionId: scanSessionId ?? null,
          restaurantName: restaurant,
          city: cityClean,
          tastingNote,
          otherObservations,
          userScore,
          listPrice: price,
          isFavourite,
          reviewDate,
        });
      } else {
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        if (mode === 'update') {
          await update.mutateAsync({
            id: existing.id,
            input: { restaurantName: restaurant, city: cityClean, tastingNote, otherObservations, userScore, listPrice: price, isFavourite, ...identity },
          });
        } else {
          // Append a dated tasting onto the existing review, leaving its
          // original where/when/price intact.
          const label = todayLabel();
          await update.mutateAsync({
            id: existing.id,
            input: {
              restaurantName: existing.restaurant_name ?? '',
              city: normaliseCity(existing.city ?? ''),
              tastingNote: appendDatedEntry(existing.tasting_note, tastingNote, label),
              otherObservations: appendDatedEntry(existing.other_observations, otherObservations, label),
              userScore: userScore != null ? userScore : existing.user_score,
              listPrice: existing.menu_price,
              isFavourite: existing.is_favourite || isFavourite,
              ...identity,
            },
          });
        }
      }
      setSaved(true);
      onSaved();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  if (!wine) return null;

  const wineName = wine.vintage ? `${wine.vintage} ${wine.name}` : wine.name;

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
            <Text style={styles.backBtnText}>Back</Text>
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

            <Text style={styles.heading}>{wineName}</Text>
            <Text style={styles.wineProducer}>{wine.producer}{wine.region ? ` · ${wine.region}` : ''}</Text>

            <View style={styles.divider} />

            {/* Discovered At — collapsed by default. The previous screen
                already captured restaurant + city, so we surface a tidy
                one-line summary with a subtle (edit) link rather than
                rebuilding the inputs every time. */}
            <View style={styles.discoveredRow}>
              <Text style={styles.discoveredLabel}>Discovered At</Text>
              <TouchableOpacity onPress={() => setEditingLocation((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.editLink}>{editingLocation ? '(done)' : '(edit)'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.discoveredSummary}>{formatDiscoveredSummary(restaurant, city, reviewDate)}</Text>

            {editingLocation && (
              <View style={styles.locationEditor}>
                <Text style={styles.fieldLabel}>Restaurant name</Text>
                <TextInput
                  style={styles.input}
                  value={restaurant}
                  onChangeText={setRestaurant}
                  placeholder="e.g. The Clove Club"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.fieldLabel}>City</Text>
                <CityAutocomplete
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={reviewDate}
                  onChangeText={(text) => setReviewDate(text.replace(/[^0-9-]/g, '').slice(0, 10))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                />
                <Text style={styles.dateHint}>Format: YYYY-MM-DD · defaults to today.</Text>
              </View>
            )}

            <View style={styles.divider} />

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

            <Text style={styles.sectionLabel}>Your score</Text>
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
            <Text style={styles.scoreHint}>out of 100</Text>

            <Text style={styles.sectionLabel}>List Price ({currencySymbol.trim() || wine.currency})</Text>
            <TextInput
              style={styles.input}
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
              <View style={styles.savedRow}>
                <Text style={styles.savedText}>Saved — </Text>
                <TouchableOpacity onPress={() => { onClose(); router.push('/wines/chosen'); }}>
                  <Text style={styles.savedLink}>View in Your Profile</Text>
                </TouchableOpacity>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    // Back/nav link — Inter
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
  },
  favouriteStar: {
    fontSize: 30,
    color: colors.textMuted,
  },
  favouriteStarActive: {
    color: colors.gold,
  },
  content: {
    padding: spacing.xl,
    paddingTop: 64,
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
  scoreInput: {
    marginBottom: 4,
  },
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
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
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
