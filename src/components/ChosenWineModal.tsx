import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { showAlert } from './AppAlert';
import { CityAutocomplete } from './CityAutocomplete';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../constants/theme';
import type { WineRecommendation } from '../types/wine';

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
  const { save } = useChosenWines();

  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [saved, setSaved] = useState(false);

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
            const detected = geo?.city ?? geo?.subregion ?? geo?.region ?? null;
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
    try {
      const trimmedPrice = listPrice.trim();
      const parsedPrice = trimmedPrice ? parseFloat(trimmedPrice) : NaN;
      await save.mutateAsync({
        wine,
        scanSessionId: scanSessionId ?? null,
        restaurantName: restaurant,
        city,
        tastingNote,
        otherObservations,
        userScore,
        listPrice: Number.isFinite(parsedPrice) ? parsedPrice : null,
        isFavourite,
      });
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

            {saved ? (
              <View style={styles.savedRow}>
                <Text style={styles.savedText}>Saved — </Text>
                <TouchableOpacity onPress={() => { onClose(); router.push('/wines/chosen'); }}>
                  <Text style={styles.savedLink}>View in Your Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={save.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {save.isPending ? 'Saving…' : 'Add to Your Wine Reviews'}
                </Text>
              </TouchableOpacity>
            )}

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
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  savedText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.gold,
  },
  savedLink: {
    fontFamily: 'CormorantGaramond_600SemiBold',
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
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.gold,
  },
});
