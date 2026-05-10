import { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useChosenWines } from '../hooks/useChosenWines';
import { CityAutocomplete } from './CityAutocomplete';
import { colors, spacing } from '../constants/theme';
import type { ChosenWine } from '../types/wine';

interface Props {
  wine: ChosenWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditChosenWineModal({ wine, visible, onClose, onSaved }: Props) {
  const { update } = useChosenWines();

  const [restaurant, setRestaurant] = useState('');
  const [city, setCity] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);

  useEffect(() => {
    if (visible && wine) {
      setRestaurant(wine.restaurant_name ?? '');
      setCity(wine.city ?? '');
      setTastingNote(wine.tasting_note ?? '');
      setOtherObservations(wine.other_observations ?? '');
      setUserScore(wine.user_score ?? null);
    }
  }, [visible, wine]);

  async function handleSave() {
    if (!wine) return;
    await update.mutateAsync({
      id: wine.id,
      input: { restaurantName: restaurant, city, tastingNote, otherObservations, userScore },
    });
    onSaved();
    onClose();
  }

  if (!wine) return null;

  const wineName = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;

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
            <CityAutocomplete
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
});
