import { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { showAlert } from './AppAlert';
import { CityAutocomplete } from './CityAutocomplete';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { findExistingReview, appendDatedEntry, todayLabel } from '../utils/reviewDedup';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

// Manual-entry counterpart to ChosenWineModal. Used by the +Add link on
// Your Wine Reviews so the user can record a wine they drank without
// having scanned a list. Every field is editable; the only required
// piece is the wine name (everything else is optional / nullable).

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddChosenWineModal({ visible, onClose, onSaved }: Props) {
  const { session } = useAuth();
  const { saveManual, update, chosenWines } = useChosenWines();

  const [producer, setProducer] = useState('');
  const [wineName, setWineName] = useState('');
  const [vintage, setVintage] = useState('');
  const [region, setRegion] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [reviewDate, setReviewDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (visible) {
      setProducer('');
      setWineName('');
      setVintage('');
      setRegion('');
      setRestaurant('');
      setCity('');
      setListPrice('');
      setTastingNote('');
      setOtherObservations('');
      setUserScore(null);
      setIsFavourite(false);
    }
  }, [visible]);

  async function handleSave() {
    if (!session) {
      showAlert({ title: 'Sign in required', body: 'Sign in to save a review.' });
      return;
    }
    if (!wineName.trim()) {
      showAlert({ title: 'Wine name needed', body: 'Add at least the wine name before saving.' });
      return;
    }
    Keyboard.dismiss();
    // If this wine is already in Your Wine Reviews, let the user choose
    // rather than silently adding a duplicate row.
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
    try {
      if (mode === 'create' || !existing) {
        await saveManual.mutateAsync({
          wineName,
          producer,
          region,
          vintage: vintageNum,
          restaurantName: restaurant,
          city,
          listPrice: price,
          currency: 'GBP',
          tastingNote,
          otherObservations,
          userScore,
          isFavourite,
          reviewDate: reviewDate.trim() || null,
        });
      } else {
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        if (mode === 'update') {
          await update.mutateAsync({
            id: existing.id,
            input: { restaurantName: restaurant, city, tastingNote, otherObservations, userScore, listPrice: price, isFavourite, ...identity },
          });
        } else {
          // Append a dated tasting onto the existing review, leaving its
          // original where/when/price intact.
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
      }
      onSaved();
      onClose();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <TouchableOpacity
            style={styles.favouriteBtn}
            onPress={() => setIsFavourite((v) => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.favouriteStar, isFavourite && styles.favouriteStarActive]}>{isFavourite ? '★' : '☆'}</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">

            <Text style={styles.heading}>Add a Review</Text>
            <Text style={styles.subheading}>Record a wine you drank — every field is editable.</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>The wine</Text>

            <Text style={styles.fieldLabel}>Producer</Text>
            <TextInput
              style={styles.input}
              value={producer}
              onChangeText={setProducer}
              placeholder="e.g. Domaine Leflaive"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Wine name</Text>
            <TextInput
              style={styles.input}
              value={wineName}
              onChangeText={setWineName}
              placeholder="e.g. Puligny-Montrachet"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Vintage</Text>
            <TextInput
              style={styles.input}
              value={vintage}
              onChangeText={(text) => setVintage(text.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="e.g. 2018"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={4}
            />

            <Text style={styles.fieldLabel}>Region</Text>
            <TextInput
              style={styles.input}
              value={region}
              onChangeText={setRegion}
              placeholder="e.g. Burgundy"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>When/where did you drink it?</Text>

            <Text style={styles.fieldLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={reviewDate}
              onChangeText={setReviewDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />

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

            <Text style={styles.fieldLabel}>List Price (£)</Text>
            <TextInput
              style={styles.input}
              value={listPrice}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                const normalised = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
                setListPrice(normalised);
              }}
              placeholder="e.g. 65"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Your tasting note</Text>
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

            <Text style={styles.sectionLabel}>Other observations</Text>
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

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saveManual.isPending || update.isPending}
            >
              <Text style={styles.saveButtonText}>
                {saveManual.isPending || update.isPending ? 'Saving…' : 'Add to Your Wine Reviews'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  favouriteBtn: {
    position: 'absolute',
    top: 56,
    right: spacing.xl,
    zIndex: 10,
    padding: 4,
  },
  favouriteStar: { fontSize: 30, color: colors.textMuted },
  favouriteStarActive: { color: colors.gold },
  content: { padding: spacing.xl, paddingTop: 64, paddingBottom: 60 },
  heading: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  subheading: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm, lineHeight: 21 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  // Field label — form label, Inter
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
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
  noteInput: { minHeight: 80, marginBottom: spacing.md },
  scoreInput: { marginBottom: 4 },
  // Score hint — italic helper text, Inter
  scoreHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelButton: { alignItems: 'center', padding: spacing.sm },
  // Cancel link in modal — Inter
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
