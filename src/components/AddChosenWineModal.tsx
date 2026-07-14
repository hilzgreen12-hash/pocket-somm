import { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useQueryClient } from '@tanstack/react-query';
import { showAlert } from './AppAlert';
import { WineReviewFields } from './WineReviewFields';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { patchChosenWine } from '../api/chosenWines';
import { uploadLabelImage } from '../api/labelPhotos';
import { findExistingReview, appendDatedEntry, todayLabel } from '../utils/reviewDedup';
import { splitLocationString } from '../services/reviewSync';
import { captureCity } from '../utils/captureCity';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

// Manual-entry counterpart to ChosenWineModal. Used by the +Add link on Your
// Wine Reviews. The wine-identity fields (producer/name/vintage/region) stay
// bespoke; the review body uses the shared WineReviewFields card so it matches
// every other review surface exactly.

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  // Optional OCR pre-fill so Scan / Upload land on this SAME screen (no wine
  // intel card) with the wine identity already filled in — the only difference
  // from Manual Input is where the details come from.
  initial?: { producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null } | null;
  // Local image uri of the scanned/uploaded label (Scan / Upload review flow).
  // When present and the review is newly CREATED, we upload it and stamp
  // chosen_wines.label_image_path so the review card shows the label photo —
  // exactly like a cellar wine card. Null for Manual Input.
  labelImageUri?: string | null;
}

export function AddChosenWineModal({ visible, onClose, onSaved, initial, labelImageUri }: Props) {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const { saveManual, update, chosenWines } = useChosenWines();
  const qc = useQueryClient();

  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();

  const [producer, setProducer] = useState('');
  const [wineName, setWineName] = useState('');
  const [vintage, setVintage] = useState('');
  const [region, setRegion] = useState('');
  // Combined "Discovered at" (restaurant + city), split on save.
  const [locCity, setLocCity] = useState('');
  const [locName, setLocName] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [drinkingWindow, setDrinkingWindow] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [saved, setSaved] = useState(false);
  // Drinking date defaults to today (the canonical card doesn't expose a date
  // field; manual reviews stamp as today).
  const [reviewDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (visible) {
      setProducer(initial?.producer ?? '');
      setWineName(initial?.wineName ?? '');
      setVintage(initial?.vintage != null ? String(initial.vintage) : '');
      setRegion(initial?.region ?? '');
      setLocCity(''); setLocName(''); setListPrice(''); setTastingNote(''); setOtherObservations('');
      setUserScore(null); setDrinkingWindow(''); setIsFavourite(false); setSaved(false);
      // Prefill the city from GPS for a fresh review.
      captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
    }
  }, [visible]);

  async function handleSave() {
    if (!session) { showAlert({ title: 'Sign in required', body: 'Sign in to save a review.' }); return; }
    if (!wineName.trim()) { showAlert({ title: 'Wine name needed', body: 'Add at least the wine name before saving.' }); return; }
    Keyboard.dismiss();
    const existing = findExistingReview(chosenWines, { producer, wineName, vintage });
    if (existing) {
      showAlert({
        title: "You've reviewed this wine before",
        body: `You already have a review for ${wineName.trim()}. Update it, add a new dated tasting to it, or start a fresh review?`,
        buttons: [
          { text: 'Update review', onPress: () => { void doSave('update', existing); } },
          { text: 'Add to review', onPress: () => { void doSave('append', existing); } },
          { text: 'Create new', onPress: () => { void doSave('create', null); } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await doSave('create', null);
  }

  async function doSave(mode: 'create' | 'update' | 'append', existing: ChosenWine | null) {
    if (!session) return;
    const trimmedPrice = listPrice.trim();
    const parsedPrice = trimmedPrice ? parseFloat(trimmedPrice) : NaN;
    const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
    const trimmedVintage = vintage.trim();
    const parsedVintage = trimmedVintage ? parseInt(trimmedVintage, 10) : NaN;
    const vintageNum = Number.isFinite(parsedVintage) ? parsedVintage : null;
    const dw = drinkingWindow.trim() || null;
    const restaurantName = locName.trim();
    const city = locCity.trim();
    try {
      if (mode === 'create' || !existing) {
        const row = await saveManual.mutateAsync({
          wineName, producer, region, vintage: vintageNum,
          restaurantName, city, listPrice: price, currency,
          tastingNote, otherObservations, userScore, isFavourite,
          reviewDate: reviewDate.trim() || null,
          userDrinkingWindow: dw,
          // Hand-entered review → 'other' so it stays in Your Wine Reviews but
          // not under You · Your Restaurants · Bottle Picks.
          source: 'other',
        });
        // Scan / Upload review — attach the scanned label photo to the new row
        // so its review card shows the label, like a cellar wine. Best-effort:
        // a failed upload never blocks the save (the review is already stored).
        if (labelImageUri && row?.id) {
          try {
            const path = await uploadLabelImage(session.user.id, labelImageUri, row.id);
            await patchChosenWine(row.id, { label_image_path: path });
            qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
          } catch { /* non-fatal — review saved without a photo */ }
        }
      } else {
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        if (mode === 'update') {
          await update.mutateAsync({
            id: existing.id,
            input: { restaurantName, city, tastingNote, otherObservations, userScore, listPrice: price, isFavourite, ...identity },
          });
        } else {
          const label = todayLabel();
          await update.mutateAsync({
            id: existing.id,
            input: {
              restaurantName: existing.restaurant_name ?? '',
              city: existing.city ?? '',
              tastingNote: appendDatedEntry(existing.tasting_note, tastingNote, label),
              otherObservations: appendDatedEntry(existing.other_observations, otherObservations, label),
              userScore: userScore != null ? userScore : existing.user_score,
              listPrice: existing.menu_price,
              isFavourite: existing.is_favourite || isFavourite,
              ...identity,
            },
          });
        }
        // The structured update input doesn't carry the drinking window — patch
        // it onto the existing row, then refresh.
        if (dw !== null) {
          await patchChosenWine(existing.id, { user_drinking_window: dw });
          qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
        }
      }
      onSaved();
      setSaved(true);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Clear the "saved" state whenever the user edits a field again.
  function edited<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); if (saved) setSaved(false); };
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favouriteBtn} onPress={() => setIsFavourite((v) => !v)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text style={[styles.favouriteStar, isFavourite && styles.favouriteStarActive]}>{isFavourite ? '★' : '☆'}</Text>
          </TouchableOpacity>

          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
            <Text style={styles.heading}>Add a Wine Review</Text>
            <Text style={styles.subheading}>Record a wine you drank — every field is editable.</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>The wine</Text>

            {/* Scanned / uploaded label sits to the left of the identity fields,
                mirroring a cellar wine card. */}
            <View style={labelImageUri ? styles.identityRow : undefined}>
              {labelImageUri ? (
                <Image source={{ uri: labelImageUri }} style={styles.identityThumb} resizeMode="cover" />
              ) : null}
              <View style={labelImageUri ? styles.identityFields : undefined}>
                <Text style={styles.fieldLabel}>Producer</Text>
                <TextInput style={styles.input} value={producer} onChangeText={edited(setProducer)} placeholder="e.g. Domaine Leflaive" placeholderTextColor={colors.textMuted} />

                <Text style={styles.fieldLabel}>Wine name</Text>
                <TextInput style={styles.input} value={wineName} onChangeText={edited(setWineName)} placeholder="e.g. Puligny-Montrachet" placeholderTextColor={colors.textMuted} />

                <Text style={styles.fieldLabel}>Vintage</Text>
                <TextInput
                  style={styles.input}
                  value={vintage}
                  onChangeText={edited((text: string) => setVintage(text.replace(/[^0-9]/g, '').slice(0, 4)))}
                  placeholder="e.g. 2018"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={4}
                />

                <Text style={styles.fieldLabel}>Region</Text>
                <TextInput style={styles.input} value={region} onChangeText={edited(setRegion)} placeholder="e.g. Burgundy" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Shared review card — identical to every other review surface. */}
            <WineReviewFields
              score={userScore}
              onScore={edited(setUserScore)}
              pricePaid={listPrice}
              onPricePaid={edited(setListPrice)}
              currency={currency}
              estimatedValue={null}
              estimatedValueAt={null}
              review={tastingNote}
              onReview={edited(setTastingNote)}
              personalNotes={otherObservations}
              onPersonalNotes={edited(setOtherObservations)}
              city={locCity}
              onCity={edited(setLocCity)}
              locationName={locName}
              onLocationName={edited(setLocName)}
              showLocation={false}
              drinkingWindow={drinkingWindow}
              onDrinkingWindow={edited(setDrinkingWindow)}
              saving={saveManual.isPending || update.isPending}
              saved={saved}
              onSave={handleSave}
              saveLabel="Add to Your Wine Reviews"
              savedLabel="Review Saved"
              goldSave
            />
          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  backBtn: { position: 'absolute', top: 56, left: spacing.xl, zIndex: 10, padding: 4 },
  backBtnText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.textMuted },
  favouriteBtn: { position: 'absolute', top: 56, right: spacing.xl, zIndex: 10, padding: 4 },
  favouriteStar: { fontSize: 30, color: colors.textMuted },
  favouriteStarActive: { color: colors.gold },
  content: { padding: spacing.xl, paddingTop: 64, paddingBottom: 60 },
  heading: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  subheading: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm, lineHeight: 21 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm,
    fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm,
  },
  identityRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  identityThumb: { width: 60, height: 80, borderRadius: 6, backgroundColor: colors.surface },
  identityFields: { flex: 1 },
});
