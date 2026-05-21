import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useWishList } from '../../../src/hooks/useCellar';
import { useAuth } from '../../../src/hooks/useAuth';
import { syncEditToChosen } from '../../../src/services/reviewSync';
import { splitLocationString } from '../../../src/services/reviewSync';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Dedicated screen for viewing and editing a wish-list wine's note and
// the "Discovered at" location. Reached from the Wish List card. Keeps
// the wish-list screen itself a clean compact list (like Your Wine
// Reviews), and mirrors saved edits to any matching chosen_wines review.
export default function WishlistNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { wines, isLoading, updateWine } = useWishList();
  const qc = useQueryClient();

  const wine = wines.find((w) => w.id === id) ?? null;
  const [note, setNote] = useState('');
  const [location, setLocation] = useState('');
  const [initialised, setInitialised] = useState(false);
  const [vinsterNotesOpen, setVinsterNotesOpen] = useState(false);

  // Seed the fields once the wine has loaded; don't fight subsequent
  // edits by re-syncing from the cached row on every render.
  useEffect(() => {
    if (wine && !initialised) {
      setNote(wine.tasting_notes ?? '');
      setLocation(wine.user_notes ?? '');
      setInitialised(true);
    }
  }, [wine, initialised]);

  const noteDirty = wine ? (note ?? '') !== (wine.tasting_notes ?? '') : false;
  const locationDirty = wine ? (location ?? '') !== (wine.user_notes ?? '') : false;
  const dirty = noteDirty || locationDirty;

  async function handleSave() {
    if (!wine || !dirty) return;
    const trimmedNote = note.trim() || null;
    const trimmedLocation = location.trim() || null;
    try {
      const updates: { tasting_notes?: string | null; user_notes?: string | null } = {};
      if (noteDirty) updates.tasting_notes = trimmedNote;
      if (locationDirty) updates.user_notes = trimmedLocation;
      await updateWine.mutateAsync({ id: wine.id, updates });
      // Mirror the edits to any matching chosen_wines review row so the
      // user's note + location stay in lock-step across wish list and
      // reviews. Best-effort: a sync failure shouldn't block the save.
      if (session) {
        try {
          const fields: Parameters<typeof syncEditToChosen>[2] = {};
          if (noteDirty) fields.tastingNote = trimmedNote ?? '';
          if (locationDirty) {
            const { restaurantName, city } = splitLocationString(trimmedLocation);
            fields.restaurantName = restaurantName;
            fields.city = city;
          }
          await syncEditToChosen(
            session.user.id,
            { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage },
            fields,
          );
          qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
        } catch (err) {
          console.warn('[wishlist-note→review sync] failed:', err);
        }
      }
      router.back();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  if (isLoading || (!wine && !initialised)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!wine) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Wish List Wine</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyBody}>Couldn't find this wish-list wine.</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wish List Wine</Text>
        <TouchableOpacity onPress={handleSave} disabled={!dirty || updateWine.isPending}>
          <Text style={[styles.saveText, (!dirty || updateWine.isPending) && { opacity: 0.4 }]}>
            {updateWine.isPending ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.wineHeader}>{wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}</Text>
        {wine.region ? <Text style={styles.wineDetail}>{wine.region}</Text> : null}

        <Text style={styles.fieldLabel}>Discovered at</Text>
        <TextInput
          style={styles.locationInput}
          value={location}
          onChangeText={setLocation}
          placeholder="Restaurant, city…"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.fieldLabel}>Note</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Your tasting note, where you've seen it, why you'd like to try it…"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          autoFocus={!wine.tasting_notes && !wine.user_notes}
        />

        {/* Vinster's notes for this wine — mirrors the expandable block
            in EditChosenWineModal so the user can revisit the AI's view
            of THIS bottle from the wish-list screen too. The wish-list
            row carries a narrower subset of Vinster fields than a
            chosen-wine review (critic score + drinking window only —
            rationale/vintage/rarity live on the ChosenWine type), so
            those are the rows we render. */}
        {(() => {
          const hasVinsterNotes =
            wine.critic_score != null ||
            !!wine.critic_score_note ||
            wine.drinking_window_from != null ||
            wine.drinking_window_to != null ||
            (wine.drinking_window_status && wine.drinking_window_status !== 'unknown');
          if (!hasVinsterNotes) return null;
          const drinkingRange =
            wine.drinking_window_from != null && wine.drinking_window_to != null
              ? `${wine.drinking_window_from}–${wine.drinking_window_to}`
              : wine.drinking_window_from != null
                ? `${wine.drinking_window_from}`
                : wine.drinking_window_to != null
                  ? `${wine.drinking_window_to}`
                  : null;
          const drinkingStatus =
            wine.drinking_window_status && wine.drinking_window_status !== 'unknown'
              ? wine.drinking_window_status
              : null;
          const hasDrinkingWindow = !!(drinkingRange || drinkingStatus);
          return (
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
                  ) : wine.critic_score_note ? (
                    <View style={styles.vinsterField}>
                      <Text style={styles.vinsterLabel}>Critic Score</Text>
                      <Text style={styles.vinsterFieldBody}>{wine.critic_score_note}</Text>
                    </View>
                  ) : null}

                  {hasDrinkingWindow ? (
                    <View style={styles.vinsterField}>
                      <Text style={styles.vinsterLabel}>Drinking Window</Text>
                      <Text style={styles.vinsterFieldValue}>
                        {drinkingRange ? drinkingRange : ''}
                        {drinkingRange && drinkingStatus ? ' · ' : ''}
                        {drinkingStatus ?? ''}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Inter — back/nav link
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 60 },
  // Cormorant — page header
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  // Cormorant — save button text
  saveText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, width: 60, textAlign: 'right' },
  // Inter — wine name on this details screen
  wineHeader: { fontSize: 20, fontFamily: fonts.bodyBold, color: colors.text, marginBottom: 4 },
  // Inter — wine detail caption
  wineDetail: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  // Inter — form label
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  // Inter — form input
  locationInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.lg },
  // Inter — form input
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 200, lineHeight: 22 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  // Inter — empty body
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center' },
  // Vinster notes expandable block — values copied from
  // EditChosenWineModal so the two surfaces read identically.
  vinsterWrap: { marginTop: spacing.lg, marginBottom: spacing.sm },
  vinsterLink: { alignItems: 'flex-start', paddingVertical: spacing.xs },
  // Cormorant — inline action link reads as a button
  vinsterLinkText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  // Inter — intro body
  vinsterIntro: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, lineHeight: 19 },
  vinsterBlock: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, marginTop: spacing.xs, gap: spacing.sm, backgroundColor: 'rgba(212,176,96,0.06)' },
  vinsterRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  // Inter — form label
  vinsterLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  // Inter — large stat value
  vinsterScore: { fontFamily: fonts.bodyBold, fontSize: 22, color: colors.gold },
  // Inter — small unit caption
  vinsterScoreUnit: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold },
  vinsterField: { gap: 2 },
  // Inter — value read-out
  vinsterFieldValue: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  // Inter — body
  vinsterFieldBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, lineHeight: 21 },
});
