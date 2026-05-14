import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useChosenWines } from '../hooks/useChosenWines';
import { CityAutocomplete } from './CityAutocomplete';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import type { ChosenWine } from '../types/wine';

interface Props {
  wine: ChosenWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditChosenWineModal({ wine, visible, onClose, onSaved }: Props) {
  const { update, remove } = useChosenWines();

  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [vinsterNotesOpen, setVinsterNotesOpen] = useState(false);

  useEffect(() => {
    if (visible && wine) {
      setRestaurant(wine.restaurant_name ?? '');
      setCity(wine.city ?? '');
      setListPrice(wine.menu_price != null ? String(wine.menu_price) : '');
      setTastingNote(wine.tasting_note ?? '');
      setOtherObservations(wine.other_observations ?? '');
      setUserScore(wine.user_score ?? null);
      setIsFavourite(!!wine.is_favourite);
      setVinsterNotesOpen(false);
    }
  }, [visible, wine]);

  async function handleSave() {
    if (!wine) return;
    // Dismiss the keyboard explicitly so the iOS first-tap-eats-the-tap
    // bug can't strand the user on this modal.
    Keyboard.dismiss();
    const trimmedPrice = listPrice.trim();
    const parsedPrice = trimmedPrice ? parseFloat(trimmedPrice) : NaN;
    await update.mutateAsync({
      id: wine.id,
      input: {
        restaurantName: restaurant,
        city,
        tastingNote,
        otherObservations,
        userScore,
        listPrice: Number.isFinite(parsedPrice) ? parsedPrice : null,
        isFavourite,
        // Identity passed through so the post-update sync can push the
        // new values onto a matching wishlist row if one exists.
        producer: wine.producer,
        wineName: wine.wine_name,
        vintage: wine.vintage,
      },
    });
    onSaved();
    onClose();
  }

  function handleDelete() {
    if (!wine) return;
    const label = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
    showAlert({
      title: 'Delete review?',
      body: `${label}\n\nThis permanently removes your review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete review',
          style: 'destructive',
          onPress: () => {
            remove.mutate(wine.id, {
              onSuccess: () => { onSaved(); onClose(); },
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
      ],
    });
  }

  if (!wine) return null;

  const wineName = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
  const currencySymbol = (() => {
    const cur = (wine.currency ?? 'GBP').toUpperCase();
    const map: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
    return map[cur] ?? `${cur} `;
  })();
  const reviewDate = wine.chosen_at
    ? new Date(wine.chosen_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  // Vinster captured the wine card analysis at save time — surface it
  // here as an expandable block so the user can revisit what Vinster
  // said about THIS specific wine on the original recommendation list.
  const hasVinsterNotes =
    wine.critic_score != null ||
    !!wine.rationale ||
    !!wine.vintage_assessment ||
    !!wine.drinking_window ||
    !!wine.rarity_assessment;
  const drinkingRange =
    wine.drinking_window?.from && wine.drinking_window?.to
      ? `${wine.drinking_window.from}–${wine.drinking_window.to}`
      : null;

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

            <Text style={styles.heading}>{wineName}</Text>
            <Text style={styles.wineProducer}>{wine.producer}{wine.region ? ` · ${wine.region}` : ''}</Text>
            {reviewDate ? <Text style={styles.reviewDate}>Reviewed {reviewDate}</Text> : null}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Where did you drink it?</Text>

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

            <Text style={styles.fieldLabel}>List Price ({currencySymbol.trim() || wine.currency})</Text>
            <TextInput
              style={styles.input}
              value={listPrice}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                const parts = cleaned.split('.');
                const normalised = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
                setListPrice(normalised);
              }}
              placeholder={wine.menu_price != null ? String(wine.menu_price) : 'e.g. 65'}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            {hasVinsterNotes ? (
              <View style={styles.vinsterWrap}>
                <TouchableOpacity
                  onPress={() => setVinsterNotesOpen((v) => !v)}
                  activeOpacity={0.7}
                  style={styles.vinsterLink}
                >
                  <Text style={styles.vinsterLinkText}>
                    {vinsterNotesOpen ? 'Hide Vinster’s notes for this wine' : 'View Vinster’s notes for this wine →'}
                  </Text>
                </TouchableOpacity>

                {vinsterNotesOpen ? (
                  <View style={styles.vinsterBlock}>
                    <Text style={styles.vinsterIntro}>Vinster sifted dozens of sources to present to you:</Text>
                    {wine.critic_score != null ? (
                      <View style={styles.vinsterRow}>
                        <Text style={styles.vinsterLabel}>Critic Score</Text>
                        <Text style={styles.vinsterScore}>{wine.critic_score} <Text style={styles.vinsterScoreUnit}>pts</Text></Text>
                      </View>
                    ) : null}

                    {wine.drinking_window ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Drinking Window</Text>
                        <Text style={styles.vinsterFieldValue}>
                          {drinkingRange ? `${drinkingRange} · ` : ''}{wine.drinking_window.status}
                        </Text>
                        {wine.drinking_window.notes ? (
                          <Text style={styles.vinsterFieldBody}>{wine.drinking_window.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}

                    {wine.vintage_assessment ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Vintage</Text>
                        <Text style={styles.vinsterFieldValue}>{wine.vintage_assessment.label}</Text>
                        {wine.vintage_assessment.notes ? (
                          <Text style={styles.vinsterFieldBody}>{wine.vintage_assessment.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}

                    {wine.rarity_assessment ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Rarity</Text>
                        <Text style={styles.vinsterFieldValue}>{wine.rarity_assessment.label}</Text>
                        {wine.rarity_assessment.notes ? (
                          <Text style={styles.vinsterFieldBody}>{wine.rarity_assessment.notes}</Text>
                        ) : null}
                      </View>
                    ) : null}

                    {wine.rationale ? (
                      <View style={styles.vinsterField}>
                        <Text style={styles.vinsterLabel}>Sommelier’s Note</Text>
                        <Text style={styles.vinsterFieldBody}>{wine.rationale}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}

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
              disabled={update.isPending}
            >
              <Text style={styles.saveButtonText}>
                {update.isPending ? 'Saving…' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={remove.isPending}>
              <Text style={styles.deleteText}>{remove.isPending ? 'Deleting…' : 'Delete this review'}</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  wineProducer: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  reviewDate: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 12,
    color: colors.gold,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontFamily: 'CormorantGaramond_600SemiBold',
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
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  vinsterWrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  vinsterLink: {
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  vinsterLinkText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  vinsterIntro: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    color: colors.gold,
    lineHeight: 19,
  },
  vinsterBlock: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.xs,
    gap: spacing.sm,
    backgroundColor: 'rgba(212,176,96,0.06)',
  },
  vinsterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  vinsterLabel: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 11,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  vinsterScore: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 22,
    color: colors.gold,
  },
  vinsterScoreUnit: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: colors.gold,
  },
  vinsterField: {
    gap: 2,
  },
  vinsterFieldValue: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  vinsterFieldBody: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
  },
  noteInput: {
    minHeight: 80,
    marginBottom: spacing.md,
  },
  scoreInput: {
    marginBottom: 4,
  },
  scoreHint: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.lg,
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
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.gold,
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  cancelText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  deleteText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
});
