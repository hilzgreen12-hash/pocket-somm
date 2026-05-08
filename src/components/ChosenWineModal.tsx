import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useChosenWines } from '../hooks/useChosenWines';
import { useWishList } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../constants/theme';
import type { WineRecommendation } from '../types/wine';

interface Props {
  wine: WineRecommendation | null;
  visible: boolean;
  initialRestaurantName?: string | null;
  initialCity?: string | null;
  showReturnToArchive?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ChosenWineModal({ wine, visible, initialRestaurantName, initialCity, showReturnToArchive, onClose, onSaved }: Props) {
  const { session } = useAuth();
  const { save } = useChosenWines();
  const { addWine: addToWishList } = useWishList();

  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  useEffect(() => {
    if (visible) {
      setRestaurant(initialRestaurantName ?? '');
      setCity(initialCity ?? '');
      setTastingNote('');
      setOtherObservations('');
      setUserScore(null);
      setSaved(false);
      setWishlistAdded(false);

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
  }, [visible, initialRestaurantName, initialCity]);

  async function handleSave() {
    if (!wine || !session) return;
    await save.mutateAsync({
      wine,
      restaurantName: restaurant,
      city,
      tastingNote,
      otherObservations,
      userScore,
    });
    setSaved(true);
    onSaved();
  }

  async function handleAddToWishList() {
    if (!wine || !session) return;
    const location = [restaurant.trim(), city.trim()].filter(Boolean).join(', ');
    await addToWishList.mutateAsync({
      user_id: session.user.id,
      wine_name: wine.name,
      producer: wine.producer,
      region: wine.region ?? null,
      vintage: wine.vintage ? String(wine.vintage) : null,
      quantity: 1,
      storage_location: null,
      date_received: new Date().toISOString().split('T')[0],
      critic_score: wine.criticScore ?? null,
      drinking_window_from: wine.drinkingWindow?.from ?? null,
      drinking_window_to: wine.drinkingWindow?.to ?? null,
      drinking_window_status: 'unknown',
      tasting_notes: tastingNote.trim() || null,
      grape_variety: wine.grape ?? null,
      label_image_path: null,
      user_notes: location || null,
      is_wishlist: true,
    });
    setWishlistAdded(true);
  }

  if (!wine) return null;

  const wineName = wine.vintage ? `${wine.vintage} ${wine.name}` : wine.name;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

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
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={colors.textMuted}
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
                  <Text style={styles.savedLink}>View Wine Reviews</Text>
                </TouchableOpacity>
                {showReturnToArchive && (
                  <>
                    <Text style={styles.savedText}> · </Text>
                    <TouchableOpacity onPress={() => { onClose(); router.push('/scan/history'); }}>
                      <Text style={styles.savedLink}>Return to List Archive</Text>
                    </TouchableOpacity>
                  </>
                )}
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

            {wishlistAdded ? (
              <View style={styles.savedRow}>
                <Text style={styles.savedText}>Added to Wish List — </Text>
                <TouchableOpacity onPress={() => { onClose(); router.push('/cellar/wishlist'); }}>
                  <Text style={styles.savedLink}>View Wish List</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.wishlistButton}
                onPress={handleAddToWishList}
                disabled={addToWishList.isPending || !session}
              >
                <Text style={styles.wishlistButtonText}>
                  {addToWishList.isPending ? 'Adding…' : 'Add to Cellar Wish List'}
                </Text>
              </TouchableOpacity>
            )}

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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 40,
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
    fontSize: 14,
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
    fontSize: 12,
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
  wishlistButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  wishlistButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.textMuted,
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
});
